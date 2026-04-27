from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "game", "description", "image", "is_active"]


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product grids."""
    category_name = serializers.CharField(source="category.name", read_only=True)
    game = serializers.CharField(source="category.game", read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "compare_price", "discount_percent",
            "stock", "is_in_stock", "is_low_stock", "condition", "rarity",
            "product_type", "image", "is_featured", "category_name", "game",
            "set_name", "language", "is_foil",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for PDP."""
    category = CategorySerializer(read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = "__all__"


class ProductWriteSerializer(serializers.ModelSerializer):
    """For admin create/update."""
    class Meta:
        model = Product
        exclude = ["slug", "created_at", "updated_at"]