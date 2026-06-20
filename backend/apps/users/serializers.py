from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from apps.products.models import Product
from apps.products.serializers import ProductListSerializer
from .models import Address, CustomUser, WishlistItem


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "first_name", "last_name", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        return CustomUser.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = ["id", "email", "first_name", "last_name", "full_name", "phone",
                  "is_verified", "date_joined"]
        read_only_fields = ["id", "email", "is_verified", "date_joined"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs


class ResetPasswordConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})

        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = CustomUser.objects.get(pk=user_id)
        except (CustomUser.DoesNotExist, TypeError, ValueError, OverflowError):
            raise serializers.ValidationError({"uid": "Invalid reset link."})

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "Invalid or expired reset token."})

        attrs["user"] = user
        return attrs


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "full_name", "phone", "line1", "line2",
                  "city", "province", "zip_code", "country", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]
        read_only_fields = fields


class WishlistItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()

    def validate_product_id(self, value):
        try:
            product = Product.objects.select_related("category").get(pk=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")

        self.product = product
        return value

    def create(self, validated_data):
        item, created = WishlistItem.objects.get_or_create(
            user=self.context["request"].user,
            product=self.product,
        )
        self.created = created
        return item
