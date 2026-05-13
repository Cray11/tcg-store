import uuid

from django.conf import settings
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.notifications.emails import send_order_confirmation_email
from apps.orders.models import Order
from apps.orders.utils import InventoryError, reserve_order_inventory, sync_cart_after_payment

from .models import Payment


def _build_payment_reference():
    return f"demo_pay_{uuid.uuid4().hex}"


def _build_transaction_reference():
    return f"demo_tx_{uuid.uuid4().hex[:18]}"


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def prepare_demo_payment(request):
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
                    provider="DEMO",
                    payment_reference=_build_payment_reference(),
                    amount=order.total,
                    currency="PHP",
                    status="PENDING",
                )

            if not payment.inventory_reserved:
                reserve_order_inventory(order)
                payment.inventory_reserved = True

            if not payment.payment_reference:
                payment.payment_reference = _build_payment_reference()

            payment.provider = "DEMO"
            payment.amount = order.total
            payment.currency = "PHP"
            payment.status = "PENDING"
            payment.failure_message = ""
            payment.save()

        return Response({
            "data": {
                "payment_reference": payment.payment_reference,
                "provider": payment.provider,
                "provider_label": payment.get_provider_display(),
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status,
            },
            "message": "Demo payment prepared.",
            "errors": None,
        })

    except InventoryError as error:
        return Response({"data": None, "errors": {"stock": str(error)}}, status=status.HTTP_409_CONFLICT)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_demo_payment(request):
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
                    provider="DEMO",
                    payment_reference=_build_payment_reference(),
                    amount=order.total,
                    currency="PHP",
                    status="PENDING",
                )

            if not payment.inventory_reserved:
                reserve_order_inventory(order)
                payment.inventory_reserved = True

            if not payment.payment_reference:
                payment.payment_reference = _build_payment_reference()

            payment.provider = "DEMO"
            payment.amount = order.total
            payment.currency = "PHP"
            payment.failure_message = ""
            _mark_payment_success(
                payment,
                transaction_reference=_build_transaction_reference(),
            )

        send_order_confirmation_email(order)

        return Response({
            "data": {
                "order_id": str(order.id),
                "order_number": order.order_number,
                "email_to": order.user.email,
                "email_from": settings.DEFAULT_FROM_EMAIL,
                "payment_reference": payment.payment_reference,
                "transaction_reference": payment.transaction_reference,
            },
            "message": "Demo payment completed. Invoice email sent.",
            "errors": None,
        })

    except InventoryError as error:
        return Response({"data": None, "errors": {"stock": str(error)}}, status=status.HTTP_409_CONFLICT)


def _mark_payment_success(payment, transaction_reference=""):
    payment.status = "SUCCEEDED"
    payment.transaction_reference = transaction_reference
    payment.failure_message = ""
    payment.save(update_fields=[
        "status",
        "transaction_reference",
        "failure_message",
        "inventory_reserved",
        "updated_at",
    ])

    if payment.order.promo_code:
        payment.order.promo_code.uses_count += 1
        payment.order.promo_code.save(update_fields=["uses_count"])

    payment.order.status = "PROCESSING"
    payment.order.save(update_fields=["status", "updated_at"])
    sync_cart_after_payment(payment.order)
