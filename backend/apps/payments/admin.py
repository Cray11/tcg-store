from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["stripe_payment_intent", "order", "amount", "status", "created_at"]
    list_filter = ["status", "currency"]
    search_fields = ["stripe_payment_intent", "order__order_number"]
    readonly_fields = ["stripe_payment_intent", "order", "amount", "currency", "created_at", "updated_at"]
