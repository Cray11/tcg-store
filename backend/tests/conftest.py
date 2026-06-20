import pytest
from rest_framework.test import APIClient
from apps.users.models import Address, CustomUser, WishlistItem
from apps.products.models import Category, Product
from apps.cart.models import Cart, CartItem


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return CustomUser.objects.create_user(
        email="test@tcgstore.com",
        password="TestPass123!",
        first_name="Test",
        last_name="User",
        is_verified=True,
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_superuser(
        email="admin@tcgstore.com",
        password="AdminPass123!",
        first_name="Admin",
        last_name="User",
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(
        name="Pokemon Singles",
        slug="pokemon-singles",
        game="POKEMON",
    )


@pytest.fixture
def product(db, category):
    return Product.objects.create(
        category=category,
        name="Pikachu",
        sku="PKM-001",
        price="100.00",
        stock=10,
        condition="NM",
        product_type="SINGLE",
    )


@pytest.fixture
def address(db, user):
    return Address.objects.create(
        user=user,
        full_name="Test User",
        line1="123 Test Street",
        city="Manila",
        province="Metro Manila",
        zip_code="1000",
        country="Philippines",
        is_default=True,
    )


@pytest.fixture
def user_cart(db, user):
    return Cart.objects.create(user=user)


@pytest.fixture
def user_cart_item(db, user_cart, product):
    return CartItem.objects.create(cart=user_cart, product=product, quantity=2)


@pytest.fixture
def wishlist_item(db, user, product):
    return WishlistItem.objects.create(user=user, product=product)
