import stripe
import uuid
from django.conf import settings
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.orders.models import Order
from apps.orders.utils import InventoryError, reserve_order_inventory, restore_order_inventory, sync_cart_after_payment
from apps.notifications.emails import send_order_confirmation_email
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"data": None, "errors": {"order_id": "Required."}}, status=400)

    try:
        order = Order.objects.get(id=order_id, user=request.user, status="PENDING")
    except Order.DoesNotExist:
        return Response({"data": None, "errors": {"order": "Order not found."}}, status=404)

    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order.id)
            payment = Payment.objects.select_for_update().filter(order=order).first()
            intent = _get_reusable_payment_intent(payment)

            if payment and payment.status == "SUCCEEDED":
                return Response({
                    "data": None,
                    "errors": {"payment": "Payment has already been completed for this order."}
                }, status=status.HTTP_409_CONFLICT)

            if payment and intent and intent.status not in {"canceled", "succeeded"}:
                if not payment.inventory_reserved:
                    reserve_order_inventory(order)
                    payment.inventory_reserved = True

                payment.amount = order.total
                payment.currency = "PHP"
                payment.status = "PENDING"
                payment.failure_message = ""
                payment.save(update_fields=[
                    "amount", "currency", "status",
                    "failure_message", "inventory_reserved", "updated_at"
                ])

                return Response({
                    "data": {"client_secret": intent.client_secret},
                    "message": "Payment intent ready.",
                    "errors": None,
                })

            if payment is None:
                payment = Payment(order=order)

            if not payment.inventory_reserved:
                reserve_order_inventory(order)
                payment.inventory_reserved = True

            intent = stripe.PaymentIntent.create(
                amount=int(order.total * 100),  # Stripe uses centavos
                currency="php",
                metadata={
                    "order_id": str(order.id),
                    "order_number": order.order_number,
                    "user_id": str(request.user.id),
                },
            )

            payment.stripe_payment_intent = intent.id
            payment.amount = order.total
            payment.currency = "PHP"
            payment.status = "PENDING"
            payment.stripe_charge_id = ""
            payment.failure_message = ""
            payment.save()

        return Response({
            "data": {"client_secret": intent.client_secret},
            "message": "Payment intent created.",
            "errors": None,
        })

    except InventoryError as e:
        return Response({"data": None, "errors": {"stock": str(e)}}, status=status.HTTP_409_CONFLICT)
    except stripe.error.StripeError as e:
        return Response({"data": None, "errors": {"stripe": str(e)}}, status=500)


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if event["type"] == "payment_intent.succeeded":
        _handle_payment_succeeded(event["data"]["object"])

    elif event["type"] == "payment_intent.payment_failed":
        _handle_payment_failed(event["data"]["object"])

    return Response({"received": True})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def simulate_payment_success(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"data": None, "errors": {"order_id": "Required."}}, status=400)

    try:
        order = Order.objects.get(id=order_id, user=request.user, status="PENDING")
    except Order.DoesNotExist:
        return Response({"data": None, "errors": {"order": "Pending order not found."}}, status=404)

    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order.id)
            payment = Payment.objects.select_for_update().filter(order=order).first()

            if payment and payment.status == "SUCCEEDED":
                return Response({
                    "data": None,
                    "errors": {"payment": "Payment has already been completed for this order."}
                }, status=status.HTTP_409_CONFLICT)

            if payment is None:
                payment = Payment(
                    order=order,
                    stripe_payment_intent=f"demo_pi_{uuid.uuid4().hex}",
                    amount=order.total,
                    currency="PHP",
                    status="PENDING",
                )

            if not payment.inventory_reserved:
                reserve_order_inventory(order)
                payment.inventory_reserved = True

            payment.amount = order.total
            payment.currency = "PHP"
            _mark_payment_success(
                payment,
                charge_id=f"demo_charge_{uuid.uuid4().hex[:18]}",
            )

        send_order_confirmation_email(order)

        return Response({
            "data": {
                "order_id": str(order.id),
                "order_number": order.order_number,
                "email_to": order.user.email,
                "email_from": settings.DEFAULT_FROM_EMAIL,
            },
            "message": "Demo payment completed. Invoice email sent.",
            "errors": None,
        })

    except InventoryError as e:
        return Response({"data": None, "errors": {"stock": str(e)}}, status=status.HTTP_409_CONFLICT)


def _handle_payment_succeeded(payment_intent):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(
                stripe_payment_intent=payment_intent["id"]
            )

            if payment.status == "SUCCEEDED":
                return

            if not payment.inventory_reserved:
                reserve_order_inventory(payment.order)
                payment.inventory_reserved = True

            _mark_payment_success(
                payment,
                charge_id=payment_intent.get("latest_charge", ""),
            )

        send_order_confirmation_email(payment.order)
    except Payment.DoesNotExist:
        pass
    except InventoryError:
        pass


def _handle_payment_failed(payment_intent):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(
                stripe_payment_intent=payment_intent["id"]
            )

            if payment.status == "SUCCEEDED":
                return

            if payment.inventory_reserved:
                restore_order_inventory(payment.order)
                payment.inventory_reserved = False

            payment.status = "FAILED"
            payment.failure_message = payment_intent.get("last_payment_error", {}).get("message", "")
            payment.save(update_fields=[
                "status", "failure_message", "inventory_reserved", "updated_at"
            ])
    except Payment.DoesNotExist:
        pass


def _get_reusable_payment_intent(payment):
    if not payment or not payment.stripe_payment_intent:
        return None

    try:
        return stripe.PaymentIntent.retrieve(payment.stripe_payment_intent)
    except stripe.error.InvalidRequestError:
        return None


def _mark_payment_success(payment, charge_id=""):
    payment.status = "SUCCEEDED"
    payment.stripe_charge_id = charge_id
    payment.failure_message = ""
    payment.save(update_fields=[
        "status", "stripe_charge_id", "failure_message",
        "inventory_reserved", "updated_at"
    ])

    if payment.order.promo_code:
        payment.order.promo_code.uses_count += 1
        payment.order.promo_code.save(update_fields=["uses_count"])

    payment.order.status = "PROCESSING"
    payment.order.save(update_fields=["status", "updated_at"])
    sync_cart_after_payment(payment.order)
