import pytest
from rest_framework.test import APIClient
from apps.users.models import CustomUser


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
