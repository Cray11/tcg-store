import pytest
from django.urls import reverse

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
