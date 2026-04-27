import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.orders.models import Order
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
        intent = stripe.PaymentIntent.create(
            amount=int(order.total * 100),  # Stripe uses centavos
            currency="php",
            metadata={
                "order_id": str(order.id),
                "order_number": order.order_number,
                "user_id": str(request.user.id),
            },
        )

        Payment.objects.get_or_create(
            order=order,
            defaults={
                "stripe_payment_intent": intent.id,
                "amount": order.total,
                "currency": "PHP",
                "status": "PENDING",
            },
        )

        return Response({
            "data": {"client_secret": intent.client_secret},
            "message": "Payment intent created.",
            "errors": None,
        })

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


def _handle_payment_succeeded(payment_intent):
    try:
        payment = Payment.objects.get(stripe_payment_intent=payment_intent["id"])
        payment.status = "SUCCEEDED"
        payment.stripe_charge_id = payment_intent.get("latest_charge", "")
        payment.save()
        payment.order.status = "PROCESSING"
        payment.order.save()
        send_order_confirmation_email(payment.order)
    except Payment.DoesNotExist:
        pass


def _handle_payment_failed(payment_intent):
    try:
        payment = Payment.objects.get(stripe_payment_intent=payment_intent["id"])
        payment.status = "FAILED"
        payment.failure_message = payment_intent.get("last_payment_error", {}).get("message", "")
        payment.save()
    except Payment.DoesNotExist:
        pass