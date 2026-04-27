from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Address


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ["email", "full_name", "is_verified", "is_staff", "date_joined"]
    list_filter = ["is_staff", "is_verified", "is_active"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-date_joined"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_verified")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2"),
        }),
    )
    readonly_fields = ["date_joined", "last_login"]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["full_name", "user", "city", "province", "is_default"]
    list_filter = ["province", "country", "is_default"]
    search_fields = ["full_name", "user__email", "city"]