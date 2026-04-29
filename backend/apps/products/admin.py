from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "game", "slug", "is_active", "created_at"]
    list_filter = ["game", "is_active"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "price", "stock", "is_active", "is_featured"]
    list_filter = ["is_active", "is_featured", "condition", "rarity", "product_type"]
    search_fields = ["name", "sku", "set_name", "card_number"]
    prepopulated_fields = {"slug": ("name", "condition", "sku")}
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("category", "name", "slug", "sku", "description", "product_type")
        }),
        ("Pricing & Stock", {
            "fields": ("price", "compare_price", "stock", "low_stock_threshold")
        }),
        ("Card Specifics", {
            "fields": ("set_name", "set_code", "card_number", "rarity", "condition", "language", "is_foil", "is_first_edition")
        }),
        ("Images", {
            "fields": ("image_url", "image_back_url")
        }),
        ("Flags & Dates", {
            "fields": ("is_active", "is_featured", "created_at", "updated_at")
        }),
    )
