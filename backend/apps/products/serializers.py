from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "game", "description", "image", "is_active"]


class WishlistStateMixin:
    def get_is_in_wishlist(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        if not hasattr(self, "_wishlist_product_ids"):
            self._wishlist_product_ids = set(
                request.user.wishlist_items.values_list("product_id", flat=True)
            )

        return obj.id in self._wishlist_product_ids


class ProductListSerializer(WishlistStateMixin, serializers.ModelSerializer):
    """Lightweight serializer for product grids."""
    category_name = serializers.CharField(source="category.name", read_only=True)
    game = serializers.CharField(source="category.game", read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    is_in_wishlist = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "compare_price", "discount_percent",
            "stock", "is_in_stock", "is_low_stock", "condition", "rarity",
            "product_type", "image_url", "image_back_url", "is_featured",
            "category_name", "game", "set_name", "card_number", "language", "is_foil",
            "is_in_wishlist",
        ]


class ProductDetailSerializer(WishlistStateMixin, serializers.ModelSerializer):
    """Full serializer for PDP."""
    category = CategorySerializer(read_only=True)
    game = serializers.CharField(source="category.game", read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    is_in_wishlist = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"


class ProductWriteSerializer(serializers.ModelSerializer):
    """For admin create/update."""
    class Meta:
        model = Product
        exclude = ["slug", "created_at", "updated_at"]
