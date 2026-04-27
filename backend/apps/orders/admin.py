from django.contrib import admin
from .models import Order, OrderItem, PromoCode

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "product_sku", "quantity", "unit_price", "total_price"]

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "user", "status", "total", "created_at"]
    list_filter = ["status", "shipping_method", "created_at"]
    search_fields = ["order_number", "user__email", "shipping_full_name"]
    readonly_fields = ["order_number", "subtotal", "shipping_cost", "discount_amount", "total", "created_at", "updated_at"]
    inlines = [OrderItemInline]

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ["code", "discount_type", "discount_value", "is_active", "uses_count", "max_uses", "valid_until"]
    list_filter = ["is_active", "discount_type"]
    search_fields = ["code"]
