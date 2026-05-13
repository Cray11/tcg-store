from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, PromoCode
from .serializers import OrderSerializer, CreateOrderSerializer, AdminUpdateOrderSerializer
from apps.users.models import Address
from apps.cart.models import Cart
from apps.orders.utils import restore_order_inventory

SHIPPING_COSTS = {"STANDARD": 99, "EXPRESS": 199}


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"data": None, "errors": serializer.errors}, status=400)

    data = serializer.validated_data

    try:
        address = Address.objects.get(id=data["address_id"], user=request.user)
    except Address.DoesNotExist:
        return Response({"data": None, "errors": {"address": "Address not found."}}, status=400)

    try:
        cart = Cart.objects.prefetch_related("items__product").get(user=request.user)
    except Cart.DoesNotExist:
        return Response({"data": None, "errors": {"cart": "Cart is empty."}}, status=400)

    if not cart.items.exists():
        return Response({"data": None, "errors": {"cart": "Cart is empty."}}, status=400)

    shipping_cost = SHIPPING_COSTS.get(data["shipping_method"], 99)
    subtotal = cart.subtotal
    discount_amount = 0
    promo = None

    # Validate promo code
    if data.get("promo_code"):
        try:
            promo = PromoCode.objects.get(code=data["promo_code"].upper())
            valid, msg = promo.is_valid(subtotal)
            if not valid:
                return Response({"data": None, "errors": {"promo_code": msg}}, status=400)
            if promo.discount_type == "PERCENT":
                discount_amount = subtotal * (promo.discount_value / 100)
            else:
                discount_amount = promo.discount_value
        except PromoCode.DoesNotExist:
            return Response({"data": None, "errors": {"promo_code": "Invalid promo code."}}, status=400)

    total = subtotal + shipping_cost - discount_amount

    for item in cart.items.select_related("product").all():
        if item.product.stock < item.quantity:
            return Response({
                "data": None,
                "errors": {"stock": f"'{item.product.name}' only has {item.product.stock} left."}
            }, status=status.HTTP_409_CONFLICT)

    with transaction.atomic():
        order = Order.objects.create(
            user=request.user,
            status="PENDING",
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total=total,
            shipping_method=data["shipping_method"],
            promo_code=promo,
            customer_note=data.get("customer_note", ""),
            shipping_full_name=address.full_name,
            shipping_phone=address.phone,
            shipping_line1=address.line1,
            shipping_line2=address.line2,
            shipping_city=address.city,
            shipping_province=address.province,
            shipping_zip=address.zip_code,
            shipping_country=address.country,
        )

        # Snapshot order items now; inventory is reserved when payment starts.
        for item in cart.items.select_related("product").all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_sku=item.product.sku,
                product_image=item.product.image_url,
                product_condition=item.product.condition,
                product_set=item.product.set_name,
                quantity=item.quantity,
                unit_price=item.product.price,
                total_price=item.line_total,
            )

    return Response({
        "data": OrderSerializer(order).data,
        "message": "Order created. Complete payment to finalize it.",
        "errors": None,
    }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related("items").select_related("payment").order_by("-created_at")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related("items").select_related("payment")


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, pk):
    order = get_object_or_404(Order, pk=pk, user=request.user)
    if order.status != "PENDING":
        return Response({
            "data": None,
            "errors": {"status": f"Order in '{order.status}' status cannot be cancelled."}
        }, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        payment = getattr(order, "payment", None)

        if payment and payment.status == "SUCCEEDED":
            return Response({
                "data": None,
                "errors": {"status": "Paid orders cannot be cancelled automatically."}
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = "CANCELLED"
        order.save()

        if payment:
            if payment.inventory_reserved:
                restore_order_inventory(order)
                payment.inventory_reserved = False

            payment.status = "FAILED"
            payment.failure_message = "Order cancelled by user."
            payment.save(update_fields=["status", "failure_message", "inventory_reserved", "updated_at"])

    return Response({
        "data": OrderSerializer(order).data,
        "message": "Order cancelled.",
        "errors": None,
    })


# ── Admin views ───────────────────────────────────────────────────
class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.prefetch_related("items").select_related("user", "payment").order_by("-created_at")
    filterset_fields = ["status"]
    search_fields = ["order_number", "user__email", "shipping_full_name"]


class AdminOrderUpdateView(generics.UpdateAPIView):
    serializer_class = AdminUpdateOrderSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.all()
