import pytest
from django.urls import reverse
from apps.products.models import Product


@pytest.mark.django_db
def test_product_detail_exposes_game_for_storefront_filtering(api_client, product):
    response = api_client.get(reverse("product_detail", kwargs={"slug": product.slug}))

    assert response.status_code == 200
    assert response.data["slug"] == product.slug
    assert response.data["game"] == "POKEMON"
    assert response.data["category"]["game"] == "POKEMON"


@pytest.mark.django_db
def test_product_list_exposes_card_metadata_used_by_storefront_cards(api_client, product):
    product.card_number = "025"
    product.image_back_url = "https://example.com/pikachu-back.jpg"
    product.set_name = "Perfect Order"
    product.save(update_fields=["card_number", "image_back_url", "set_name"])

    response = api_client.get(reverse("product_list"))

    assert response.status_code == 200
    first_product = response.data["data"][0]
    assert first_product["card_number"] == "025"
    assert first_product["image_back_url"] == "https://example.com/pikachu-back.jpg"


@pytest.mark.django_db
def test_product_list_supports_exact_set_name_filter(api_client, category):
    matching_product = Product.objects.create(
        category=category,
        name="Pikachu",
        sku="PKM-001",
        price="100.00",
        stock=10,
        condition="NM",
        product_type="SINGLE",
        set_name="Perfect Order",
    )
    Product.objects.create(
        category=category,
        name="Charizard",
        sku="PKM-002",
        price="250.00",
        stock=5,
        condition="NM",
        product_type="SINGLE",
        set_name="Paradise Dragona",
    )

    response = api_client.get(reverse("product_list"), {"set_name": "Perfect Order"})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.data["data"]}
    assert returned_ids == {str(matching_product.id)}


@pytest.mark.django_db
def test_product_list_marks_wishlisted_items_for_authenticated_users(auth_client, product, wishlist_item):
    response = auth_client.get(reverse("product_list"))

    assert response.status_code == 200
    first_product = response.data["data"][0]
    assert first_product["id"] == str(product.id)
    assert first_product["is_in_wishlist"] is True


@pytest.mark.django_db
def test_product_detail_marks_non_wishlisted_items_for_authenticated_users(auth_client, product):
    response = auth_client.get(reverse("product_detail", kwargs={"slug": product.slug}))

    assert response.status_code == 200
    assert response.data["is_in_wishlist"] is False
