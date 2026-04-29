import uuid
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    GAME_CHOICES = [
        ("POKEMON", "Pokémon"),
        ("ONE_PIECE", "One Piece"),
        ("YUGIOH", "Yu-Gi-Oh!"),
        ("OTHER", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    game = models.CharField(max_length=50, choices=GAME_CHOICES)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "products_category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return f"{self.get_game_display()} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    CONDITION_CHOICES = [
        ("NM", "Near Mint"),
        ("LP", "Lightly Played"),
        ("MP", "Moderately Played"),
        ("HP", "Heavily Played"),
        ("DMG", "Damaged"),
    ]
    RARITY_CHOICES = [
        ("COMMON", "Common"),
        ("UNCOMMON", "Uncommon"),
        ("RARE", "Rare"),
        ("RARE_HOLO", "Rare Holo"),
        ("ULTRA_RARE", "Ultra Rare"),
        ("SECRET_RARE", "Secret Rare"),
        ("FULL_ART", "Full Art"),
        ("PROMO", "Promo"),
    ]
    PRODUCT_TYPE_CHOICES = [
        ("SINGLE", "Single Card"),
        ("PACK", "Booster Pack"),
        ("BOX", "Booster Box"),
        ("BUNDLE", "Bundle"),
        ("TIN", "Tin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # Pricing & Stock
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)

    # Card-specific
    set_name = models.CharField(max_length=150, blank=True)
    set_code = models.CharField(max_length=20, blank=True)
    card_number = models.CharField(max_length=20, blank=True)
    rarity = models.CharField(max_length=50, choices=RARITY_CHOICES, blank=True)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default="NM")
    language = models.CharField(max_length=30, default="English")
    is_foil = models.BooleanField(default=False)
    is_first_edition = models.BooleanField(default=False)
    product_type = models.CharField(max_length=30, choices=PRODUCT_TYPE_CHOICES, default="SINGLE")

    # Images
    image_url = models.CharField(max_length=500, blank=True)
    image_back_url = models.CharField(max_length=500, blank=True)

    # Flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products_product"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["sku"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["category", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} [{self.condition}]"

    @property
    def is_in_stock(self):
        return self.stock > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock <= self.low_stock_threshold

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return round((1 - self.price / self.compare_price) * 100)
        return None

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.name}-{self.condition}-{self.sku}")
            self.slug = base
        super().save(*args, **kwargs)
