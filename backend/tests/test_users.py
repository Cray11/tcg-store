import pytest
from django.urls import reverse
from apps.users.models import WishlistItem

@pytest.mark.django_db
class TestUserAuthentication:
    def test_user_login(self, api_client, user):
        """Test that a verified user can login successfully."""
        url = reverse('login')
        data = {
            'email': 'test@tcgstore.com',
            'password': 'TestPass123!'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == 200
        assert 'access' in response.data['data']['tokens']
        assert 'refresh' in response.data['data']['tokens']

    def test_invalid_login(self, api_client):
        """Test that an invalid login returns a 401 Unauthorized."""
        url = reverse('login')
        data = {
            'email': 'wrong@tcgstore.com',
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == 401


@pytest.mark.django_db
class TestWishlist:
    def test_authenticated_user_can_add_product_to_wishlist(self, auth_client, product, user):
        response = auth_client.post(reverse("wishlist_list"), {"product_id": str(product.id)})

        assert response.status_code == 201
        assert response.data["product"]["id"] == str(product.id)
        assert WishlistItem.objects.filter(user=user, product=product).exists()

    def test_adding_same_product_twice_is_idempotent(self, auth_client, product, user):
        auth_client.post(reverse("wishlist_list"), {"product_id": str(product.id)})

        response = auth_client.post(reverse("wishlist_list"), {"product_id": str(product.id)})

        assert response.status_code == 200
        assert WishlistItem.objects.filter(user=user, product=product).count() == 1

    def test_authenticated_user_can_list_wishlist(self, auth_client, wishlist_item):
        response = auth_client.get(reverse("wishlist_list"))

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["product"]["name"] == wishlist_item.product.name

    def test_authenticated_user_can_remove_wishlist_item_by_product(self, auth_client, wishlist_item, product):
        response = auth_client.delete(reverse("wishlist_detail", kwargs={"product_id": product.id}))

        assert response.status_code == 204
        assert not WishlistItem.objects.filter(pk=wishlist_item.id).exists()

    def test_unauthenticated_user_cannot_access_wishlist(self, api_client, product):
        response = api_client.post(reverse("wishlist_list"), {"product_id": str(product.id)})

        assert response.status_code == 401
