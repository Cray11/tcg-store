from unittest.mock import patch

import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from apps.cart.models import Cart, CartItem
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.payments.views import _handle_payment_failed, _handle_payment_succeeded


class FakeIntent:
    def __init__(self, intent_id="pi_test_123", client_secret="pi_test_123_secret", status="requires_payment_method"):
        self.id = intent_id
        self.client_secret = client_secret
        self.status = status


@pytest.mark.django_db
class TestPhaseTwoHardening:
    def test_add_to_cart_respects_requested_quantity_on_first_add(self, api_client, product):
        url = reverse("cart_add")

        response = api_client.post(url, {"product_id": str(product.id), "quantity": 3})

        assert response.status_code == 200
        assert response.data["data"]["items"][0]["quantity"] == 3

        cart = Cart.objects.get(session_key=api_client.session.session_key, user=None)
        assert cart.items.get(product=product).quantity == 3

    def test_login_merges_guest_cart_into_user_cart(self, api_client, user, product):
        Cart.objects.create(user=user)
        CartItem.objects.create(cart=user.cart, product=product, quantity=1)

        add_url = reverse("cart_add")
        login_url = reverse("login")

        guest_add = api_client.post(add_url, {"product_id": str(product.id), "quantity": 2})
        assert guest_add.status_code == 200

        response = api_client.post(login_url, {
            "email": user.email,
            "password": "TestPass123!",
        })

        assert response.status_code == 200
        user.cart.refresh_from_db()
        assert user.cart.items.get(product=product).quantity == 3
        assert not Cart.objects.filter(session_key=api_client.session.session_key, user=None).exists()

    def test_password_reset_confirm_changes_password(self, api_client, user):
        url = reverse("password_reset_confirm")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = api_client.post(url, {
            "uid": uid,
            "token": token,
            "new_password": "BrandNewPass123!",
            "new_password2": "BrandNewPass123!",
        })

        assert response.status_code == 200

        user.refresh_from_db()
        assert user.check_password("BrandNewPass123!")

    def test_create_order_keeps_stock_and_cart_until_payment(self, auth_client, user, address, product, user_cart):
        CartItem.objects.create(cart=user_cart, product=product, quantity=2)
        url = reverse("order_create")

        response = auth_client.post(url, {
            "address_id": str(address.id),
            "shipping_method": "STANDARD",
        })

        assert response.status_code == 201

        product.refresh_from_db()
        assert product.stock == 10
        assert user_cart.items.get(product=product).quantity == 2

        order = Order.objects.get(id=response.data["data"]["id"])
        assert order.status == "PENDING"

    @patch("apps.payments.views.stripe.PaymentIntent.create")
    def test_create_payment_intent_reserves_inventory(self, mock_create, auth_client, user, address, product, user_cart):
        mock_create.return_value = FakeIntent()
        CartItem.objects.create(cart=user_cart, product=product, quantity=2)
        order_response = auth_client.post(reverse("order_create"), {
            "address_id": str(address.id),
            "shipping_method": "STANDARD",
        })
        order_id = order_response.data["data"]["id"]

        response = auth_client.post(reverse("create_payment_intent"), {"order_id": order_id})

        assert response.status_code == 200

        product.refresh_from_db()
        payment = Payment.objects.get(order_id=order_id)
        assert product.stock == 8
        assert payment.inventory_reserved is True
        assert payment.status == "PENDING"
        assert user_cart.items.get(product=product).quantity == 2

    @patch("apps.payments.views.send_order_confirmation_email")
    @patch("apps.payments.views.stripe.PaymentIntent.create")
    def test_payment_failed_restores_inventory(self, mock_create, mock_send_email, auth_client, user, address, product, user_cart):
        mock_create.return_value = FakeIntent()
        CartItem.objects.create(cart=user_cart, product=product, quantity=2)
        order_response = auth_client.post(reverse("order_create"), {
            "address_id": str(address.id),
            "shipping_method": "STANDARD",
        })
        order_id = order_response.data["data"]["id"]
        auth_client.post(reverse("create_payment_intent"), {"order_id": order_id})

        _handle_payment_failed({
            "id": "pi_test_123",
            "last_payment_error": {"message": "Card declined"},
        })

        product.refresh_from_db()
        payment = Payment.objects.get(order_id=order_id)
        order = Order.objects.get(id=order_id)

        assert product.stock == 10
        assert payment.inventory_reserved is False
        assert payment.status == "FAILED"
        assert payment.failure_message == "Card declined"
        assert order.status == "PENDING"
        assert user_cart.items.get(product=product).quantity == 2
        mock_send_email.assert_not_called()

    @patch("apps.payments.views.send_order_confirmation_email")
    @patch("apps.payments.views.stripe.PaymentIntent.create")
    def test_payment_success_finalizes_order_and_syncs_cart(self, mock_create, mock_send_email, auth_client, user, address, product, user_cart):
        mock_create.return_value = FakeIntent()
        CartItem.objects.create(cart=user_cart, product=product, quantity=3)
        order_response = auth_client.post(reverse("order_create"), {
            "address_id": str(address.id),
            "shipping_method": "STANDARD",
        })
        order_id = order_response.data["data"]["id"]
        cart_item = user_cart.items.get(product=product)
        cart_item.quantity = 4
        cart_item.save(update_fields=["quantity"])
        auth_client.post(reverse("create_payment_intent"), {"order_id": order_id})

        _handle_payment_succeeded({
            "id": "pi_test_123",
            "latest_charge": "ch_test_123",
        })

        product.refresh_from_db()
        payment = Payment.objects.get(order_id=order_id)
        order = Order.objects.get(id=order_id)
        user_cart.refresh_from_db()

        assert product.stock == 7
        assert payment.status == "SUCCEEDED"
        assert payment.inventory_reserved is True
        assert payment.stripe_charge_id == "ch_test_123"
        assert order.status == "PROCESSING"
        assert user_cart.items.get(product=product).quantity == 1
        mock_send_email.assert_called_once()

    @patch("apps.payments.views.send_order_confirmation_email")
    def test_simulated_payment_success_sends_invoice_and_finalizes_order(self, mock_send_email, auth_client, user, address, product, user_cart):
        CartItem.objects.create(cart=user_cart, product=product, quantity=2)
        order_response = auth_client.post(reverse("order_create"), {
            "address_id": str(address.id),
            "shipping_method": "STANDARD",
        })
        order_id = order_response.data["data"]["id"]

        response = auth_client.post(reverse("simulate_payment_success"), {
            "order_id": order_id,
        })

        assert response.status_code == 200

        product.refresh_from_db()
        order = Order.objects.get(id=order_id)
        payment = Payment.objects.get(order_id=order_id)
        user_cart.refresh_from_db()

        assert response.data["message"] == "Demo payment completed. Invoice email sent."
        assert response.data["data"]["email_to"] == user.email
        assert payment.status == "SUCCEEDED"
        assert payment.inventory_reserved is True
        assert payment.stripe_payment_intent.startswith("demo_pi_")
        assert payment.stripe_charge_id.startswith("demo_charge_")
        assert order.status == "PROCESSING"
        assert product.stock == 8
        assert user_cart.items.count() == 0
        mock_send_email.assert_called_once_with(order)
