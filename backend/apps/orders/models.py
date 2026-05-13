import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product


class PromoCode(models.Model):
    DISCOUNT_TYPE_CHOICES = [("PERCENT", "Percentage"), ("FIXED", "Fixed Amount")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default="PERCENT")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    uses_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders_promocode"

    def __str__(self):
        return self.code

    def is_valid(self, order_subtotal=0):
        from django.utils import timezone
        if not self.is_active:
            return False, "Promo code is inactive."
        if self.valid_until and timezone.now() > self.valid_until:
            return False, "Promo code has expired."
        if self.max_uses and self.uses_count >= self.max_uses:
            return False, "Promo code has reached its usage limit."
        if order_subtotal < self.min_order_amount:
            return False, f"Minimum order of PHP {self.min_order_amount} required."
        return True, "Valid."


class Order(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
        ("REFUNDED", "Refunded"),
    ]
    SHIPPING_METHOD_CHOICES = [
        ("STANDARD", "Standard (3-5 days)"),
        ("EXPRESS", "Express (1-2 days)"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    shipping_method = models.CharField(max_length=20, choices=SHIPPING_METHOD_CHOICES, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)

    # Snapshot of shipping address
    shipping_full_name = models.CharField(max_length=200)
    shipping_phone = models.CharField(max_length=20, blank=True)
    shipping_line1 = models.CharField(max_length=255)
    shipping_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_province = models.CharField(max_length=100)
    shipping_zip = models.CharField(max_length=10)
    shipping_country = models.CharField(max_length=100, default="Philippines")

    promo_code = models.ForeignKey(
        PromoCode, on_delete=models.SET_NULL, null=True, blank=True
    )
    customer_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders_order"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["order_number"]),
        ]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)

    def _generate_order_number(self):
        from django.utils import timezone
        import random
        date_str = timezone.now().strftime("%Y%m%d")
        rand = str(random.randint(1000, 9999))
        return f"TCG-{date_str}-{rand}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)

    # Snapshots
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    product_image = models.CharField(max_length=500, blank=True)
    product_condition = models.CharField(max_length=10, blank=True)
    product_set = models.CharField(max_length=150, blank=True)

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "orders_orderitem"

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"
