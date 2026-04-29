import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_product_detail_exposes_game_for_storefront_filtering(api_client, product):
    response = api_client.get(reverse("product_detail", kwargs={"slug": product.slug}))

    assert response.status_code == 200
    assert response.data["slug"] == product.slug
    assert response.data["game"] == "POKEMON"
    assert response.data["category"]["game"] == "POKEMON"
