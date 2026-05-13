import uuid
from django.db import models
from apps.orders.models import Order


class Payment(models.Model):
    PROVIDER_CHOICES = [
        ("DEMO", "Demo Checkout"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCEEDED", "Succeeded"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name="payment")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default="DEMO")
    payment_reference = models.CharField(max_length=200, unique=True)
    transaction_reference = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="PHP")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="PENDING")
    inventory_reserved = models.BooleanField(default=False)
    failure_message = models.TextField(blank=True)
    refund_reference = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_payment"

    def __str__(self):
        return f"Payment {self.payment_reference} - {self.status}"
