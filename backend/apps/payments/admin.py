from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["payment_reference", "provider", "order", "amount", "status", "created_at"]
    list_filter = ["provider", "status", "currency"]
    search_fields = ["payment_reference", "transaction_reference", "order__order_number"]
    readonly_fields = [
        "provider",
        "payment_reference",
        "transaction_reference",
        "order",
        "amount",
        "currency",
        "created_at",
        "updated_at",
    ]
