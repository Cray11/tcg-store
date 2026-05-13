from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from .models import Order, OrderItem, PromoCode
from apps.users.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id", "product", "product_name", "product_sku",
            "product_image", "product_condition", "product_set",
            "quantity", "unit_price", "total_price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_summary = serializers.SerializerMethodField()

    def get_payment_summary(self, obj):
        try:
            payment = obj.payment
        except ObjectDoesNotExist:
            return None

        return {
            "status": payment.status,
            "amount": payment.amount,
            "currency": payment.currency,
            "provider": payment.provider,
            "provider_label": payment.get_provider_display(),
            "reference": payment.transaction_reference or payment.payment_reference,
            "inventory_reserved": payment.inventory_reserved,
            "receipt_email": obj.user.email,
            "updated_at": payment.updated_at,
        }

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "subtotal", "shipping_cost",
            "discount_amount", "total", "shipping_method", "tracking_number",
            "estimated_delivery", "shipping_full_name", "shipping_phone",
            "shipping_line1", "shipping_line2", "shipping_city",
            "shipping_province", "shipping_zip", "shipping_country",
            "customer_note", "items", "payment_summary", "created_at", "updated_at",
        ]


class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.UUIDField()
    shipping_method = serializers.ChoiceField(choices=["STANDARD", "EXPRESS"])
    promo_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    customer_note = serializers.CharField(required=False, allow_blank=True)


class AdminUpdateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "tracking_number", "estimated_delivery"]
