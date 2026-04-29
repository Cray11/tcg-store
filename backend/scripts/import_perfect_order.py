from __future__ import annotations

import math
import os
import random
import re
import sys
import time
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from html import unescape
from pathlib import Path
from statistics import median
from typing import Iterable
from urllib.request import Request, urlopen


BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django

django.setup()

from django.db import transaction
from django.utils.text import slugify

from apps.products.models import Category, Product


SET_URL = "https://pkmncards.com/set/perfect-order/?sort=date&ord=auto&display=images"
SET_NAME = "Perfect Order"
SET_CODE = "POR"
CATEGORY_SLUG = "perfect-order"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
USD_TO_PHP = Decimal("60.5")  # BSP reference bulletin, Apr 24 2026
REQUEST_DELAY_SECONDS = 0.15
PRICE_QUANT = Decimal("0.01")

CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"]
LANGUAGES = ["English", "Japanese", "Korean"]

CONDITION_MULTIPLIER = {
    "NM": Decimal("1.00"),
    "LP": Decimal("0.93"),
    "MP": Decimal("0.85"),
    "HP": Decimal("0.72"),
    "DMG": Decimal("0.55"),
}

LANGUAGE_MULTIPLIER = {
    "English": Decimal("1.00"),
    "Japanese": Decimal("0.97"),
    "Korean": Decimal("0.90"),
}

RARITY_FALLBACK_USD = {
    "COMMON": Decimal("0.45"),
    "UNCOMMON": Decimal("0.75"),
    "RARE": Decimal("1.50"),
    "RARE_HOLO": Decimal("2.50"),
    "ULTRA_RARE": Decimal("6.00"),
    "FULL_ART": Decimal("12.00"),
    "SECRET_RARE": Decimal("20.00"),
    "PROMO": Decimal("3.00"),
}

STOCK_RANGES = {
    "COMMON": (12, 28),
    "UNCOMMON": (10, 22),
    "RARE": (6, 14),
    "RARE_HOLO": (4, 10),
    "ULTRA_RARE": (2, 6),
    "FULL_ART": (1, 4),
    "SECRET_RARE": (1, 3),
    "PROMO": (2, 6),
}

LOW_STOCK_THRESHOLDS = {
    "COMMON": 5,
    "UNCOMMON": 4,
    "RARE": 3,
    "RARE_HOLO": 3,
    "ULTRA_RARE": 2,
    "FULL_ART": 2,
    "SECRET_RARE": 1,
    "PROMO": 2,
}


@dataclass
class CardRecord:
    name: str
    source_url: str
    image_url: str
    description: str
    card_number: str
    rarity_raw: str
    rarity: str
    market_price_usd: Decimal | None
    lowest_price_usd: Decimal | None
    highest_price_usd: Decimal | None
    condition: str = ""
    language: str = ""
    price_php: Decimal = Decimal("0.00")
    compare_price_php: Decimal | None = None
    stock: int = 0
    low_stock_threshold: int = 1
    is_foil: bool = False
    is_featured: bool = False


def fetch_html(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def collapse_text(value: str) -> str:
    value = unescape(value)
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = value.replace("\xa0", " ")
    value = value.replace("→", " -> ")
    value = value.replace("⇢", " -> ")
    value = value.replace("•", " - ")
    value = value.replace("·", " - ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def parse_meta_content(html: str, property_name: str) -> str:
    pattern = rf'<meta property="{re.escape(property_name)}" content="([^"]+)"'
    match = re.search(pattern, html)
    return unescape(match.group(1)).strip() if match else ""


def parse_set_page(html: str) -> tuple[str, list[str]]:
    image_url = parse_meta_content(html, "og:image")
    matches = re.findall(
        r'href="(https://pkmncards\.com/card/[^"]+/|https://pkmncards\.com/\?p=\d+)"',
        html,
    )
    unique_links = list(dict.fromkeys(matches))
    return image_url, unique_links


def parse_price(html: str, price_class: str) -> Decimal | None:
    match = re.search(
        rf'<li class="{price_class}"[^>]*>.*?<span class="price">([^<]+)</span>',
        html,
        flags=re.S,
    )
    if not match:
        return None
    raw = match.group(1).replace(",", "").strip()
    try:
        return Decimal(raw)
    except Exception:
        return None


def parse_description(html: str) -> str:
    block = re.search(
        r'<div class="text">(.*?)</div>\s*<div class="weak-resist-retreat">',
        html,
        flags=re.S,
    )
    if block:
        return collapse_text(block.group(1))

    fallback = parse_meta_content(html, "og:description")
    return collapse_text(fallback)


def normalize_rarity(raw_rarity: str) -> str:
    value = raw_rarity.lower().strip()

    if value == "common":
        return "COMMON"
    if value == "uncommon":
        return "UNCOMMON"
    if value == "rare":
        return "RARE"
    if "promo" in value:
        return "PROMO"
    if "special illustration" in value or "hyper rare" in value or "secret rare" in value:
        return "SECRET_RARE"
    if "illustration rare" in value:
        return "FULL_ART"
    if "double rare" in value or "ultra rare" in value:
        return "ULTRA_RARE"
    if "holo" in value or "ace spec" in value:
        return "RARE_HOLO"

    return "RARE"


def should_mark_foil(raw_rarity: str, normalized_rarity: str) -> bool:
    value = raw_rarity.lower()
    if "holo" in value:
        return True
    return normalized_rarity in {"RARE_HOLO", "ULTRA_RARE", "FULL_ART", "SECRET_RARE"}


def parse_card_page(html: str, source_url: str) -> CardRecord | None:
    title_match = re.search(r'<h1 class="card-title"[^>]*>(.*?)</h1>', html, flags=re.S)
    name_match = re.search(
        r'<span class="name" title="Name"><a [^>]+>(.*?)</a></span>',
        html,
        flags=re.S,
    )
    rarity_match = re.search(
        r'<span class="rarity"><a [^>]+>(.*?)</a></span>',
        html,
        flags=re.S,
    )

    title = collapse_text(title_match.group(1)) if title_match else ""
    name = collapse_text(name_match.group(1)) if name_match else ""
    rarity_raw = collapse_text(rarity_match.group(1)) if rarity_match else "Rare"

    if not title or not name or SET_NAME not in title:
        return None

    number_match = re.search(r"#([A-Za-z0-9]+)", title)
    card_number = number_match.group(1) if number_match else ""
    if not card_number:
        return None

    record = CardRecord(
        name=name,
        source_url=source_url,
        image_url=parse_meta_content(html, "og:image"),
        description=parse_description(html),
        card_number=card_number,
        rarity_raw=rarity_raw,
        rarity=normalize_rarity(rarity_raw),
        market_price_usd=parse_price(html, "m"),
        lowest_price_usd=parse_price(html, "l"),
        highest_price_usd=parse_price(html, "h"),
    )
    record.is_foil = should_mark_foil(record.rarity_raw, record.rarity)
    return record


def build_assignment_pool(values: list[str], size: int, rng: random.Random) -> list[str]:
    repeats = math.ceil(size / len(values))
    pool = (values * repeats)[:size]
    rng.shuffle(pool)
    return pool


def to_php(amount_usd: Decimal) -> Decimal:
    return (amount_usd * USD_TO_PHP).quantize(PRICE_QUANT, rounding=ROUND_HALF_UP)


def quantize_price(amount: Decimal) -> Decimal:
    return amount.quantize(PRICE_QUANT, rounding=ROUND_HALF_UP)


def derive_base_usd(record: CardRecord, rarity_defaults_usd: dict[str, Decimal]) -> Decimal:
    if record.market_price_usd:
        return record.market_price_usd
    if record.lowest_price_usd and record.highest_price_usd:
        return (record.lowest_price_usd + record.highest_price_usd) / Decimal("2")
    if record.lowest_price_usd:
        return record.lowest_price_usd
    return rarity_defaults_usd.get(record.rarity, Decimal("1.00"))


def derive_compare_price_php(record: CardRecord, base_usd: Decimal) -> Decimal | None:
    if record.highest_price_usd and record.highest_price_usd > base_usd:
        compare_base = min(record.highest_price_usd, base_usd * Decimal("1.35"))
        return to_php(compare_base)
    if record.rarity in {"ULTRA_RARE", "FULL_ART", "SECRET_RARE"}:
        return to_php(base_usd * Decimal("1.18"))
    return None


def rarity_default_table(records: Iterable[CardRecord]) -> dict[str, Decimal]:
    grouped: dict[str, list[Decimal]] = {}
    for record in records:
        if record.market_price_usd:
            grouped.setdefault(record.rarity, []).append(record.market_price_usd)

    defaults = dict(RARITY_FALLBACK_USD)
    for rarity, prices in grouped.items():
        defaults[rarity] = Decimal(str(median(prices)))
    return defaults


def build_products(records: list[CardRecord], category: Category) -> list[Product]:
    products: list[Product] = []
    for record in records:
        sku = f"{SET_CODE}-{record.card_number}"
        slug = slugify(f"{record.name}-{record.condition}-{sku}")

        products.append(
            Product(
                category=category,
                name=record.name,
                slug=slug,
                sku=sku,
                description=record.description,
                price=record.price_php,
                compare_price=record.compare_price_php,
                stock=record.stock,
                low_stock_threshold=record.low_stock_threshold,
                set_name=SET_NAME,
                set_code=SET_CODE,
                card_number=record.card_number,
                rarity=record.rarity,
                condition=record.condition,
                language=record.language,
                is_foil=record.is_foil,
                is_first_edition=False,
                product_type="SINGLE",
                image_url=record.image_url,
                image_back_url="",
                is_active=True,
                is_featured=record.is_featured,
            )
        )
    return products


def assign_demo_fields(records: list[CardRecord]) -> None:
    rng = random.Random("perfect-order-demo-import")
    condition_pool = build_assignment_pool(CONDITIONS, len(records), rng)
    language_pool = build_assignment_pool(LANGUAGES, len(records), rng)
    rarity_defaults_usd = rarity_default_table(records)

    for index, record in enumerate(records):
        record.condition = condition_pool[index]
        record.language = language_pool[index]

        rarity_min, rarity_max = STOCK_RANGES.get(record.rarity, (3, 8))
        stock_rng = random.Random(f"stock::{record.card_number}::{record.rarity}")
        record.stock = stock_rng.randint(rarity_min, rarity_max)
        record.low_stock_threshold = LOW_STOCK_THRESHOLDS.get(record.rarity, 2)

        base_usd = derive_base_usd(record, rarity_defaults_usd)
        language_multiplier = LANGUAGE_MULTIPLIER[record.language]
        condition_multiplier = CONDITION_MULTIPLIER[record.condition]
        jitter = Decimal(str(random.Random(f"price::{record.card_number}").uniform(0.98, 1.06)))

        adjusted_usd = base_usd * language_multiplier * condition_multiplier * jitter
        adjusted_usd = max(adjusted_usd, Decimal("0.20"))
        record.price_php = to_php(adjusted_usd)

        compare_price = derive_compare_price_php(record, base_usd)
        if compare_price and compare_price > record.price_php:
            record.compare_price_php = quantize_price(
                compare_price * language_multiplier * condition_multiplier
            )
        else:
            record.compare_price_php = None

    for record in sorted(records, key=lambda item: item.price_php, reverse=True)[:12]:
        record.is_featured = True


def print_summary(records: list[CardRecord]) -> None:
    print(f"Imported {len(records)} cards for {SET_NAME}.")
    for label, values in (
        ("Conditions", CONDITIONS),
        ("Languages", LANGUAGES),
    ):
        counts = {
            value: sum(1 for record in records if getattr(record, label[:-1].lower()) == value)
            for value in values
        }
        print(f"{label}: {counts}")

    rarity_counts: dict[str, int] = {}
    for record in records:
        rarity_counts[record.rarity] = rarity_counts.get(record.rarity, 0) + 1
    print(f"Rarities: {rarity_counts}")
    print(
        "Featured:",
        [record.name for record in sorted(records, key=lambda item: item.price_php, reverse=True)[:12]],
    )


def main() -> None:
    print(f"Fetching set page: {SET_URL}")
    set_html = fetch_html(SET_URL)
    category_image, candidate_urls = parse_set_page(set_html)
    print(f"Found {len(candidate_urls)} candidate card links on the set page.")

    parsed_records: list[CardRecord] = []
    seen_numbers: set[str] = set()

    for index, card_url in enumerate(candidate_urls, start=1):
        try:
            html = fetch_html(card_url)
            record = parse_card_page(html, card_url)
            time.sleep(REQUEST_DELAY_SECONDS)
        except Exception as error:
            print(f"[skip] {card_url} -> {error}")
            continue

        if not record:
            print(f"[skip] {card_url} -> not a {SET_NAME} card page")
            continue

        if record.card_number in seen_numbers:
            continue

        seen_numbers.add(record.card_number)
        parsed_records.append(record)
        print(f"[{index:03}] {record.card_number} {record.name} ({record.rarity_raw})")

    parsed_records.sort(key=lambda item: int(re.sub(r"\D", "", item.card_number) or "0"))
    assign_demo_fields(parsed_records)

    category, _ = Category.objects.get_or_create(
        slug=CATEGORY_SLUG,
        defaults={
            "name": SET_NAME,
            "game": "POKEMON",
        },
    )
    category.name = SET_NAME
    category.game = "POKEMON"
    category.description = (
        "Imported from the Perfect Order set page on PkmnCards for demo catalog use."
    )
    category.image = category_image
    category.is_active = True
    category.save(update_fields=["name", "game", "description", "image", "is_active"])

    with transaction.atomic():
        deleted, _ = Product.objects.filter(category=category).delete()
        print(f"Deleted {deleted} existing product rows tied to {SET_NAME}.")

        products = build_products(parsed_records, category)
        Product.objects.bulk_create(products, batch_size=200)

    print_summary(parsed_records)


if __name__ == "__main__":
    main()
