from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductWriteSerializer
)
from .filters import ProductFilter
from .pagination import StandardPagination


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.filter(is_active=True)

    def get_queryset(self):
        queryset = super().get_queryset()
        game = self.request.query_params.get("game")
        if game:
            queryset = queryset.filter(game__iexact=game)
        return queryset


class ProductListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "set_name", "sku", "card_number"]
    ordering_fields = ["price", "created_at", "name", "stock"]
    ordering = ["-created_at"]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related("category")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductWriteSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category")
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProductWriteSerializer
        return ProductDetailSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(
            is_active=True, is_featured=True
        ).select_related("category")
        game = self.request.query_params.get("game")
        if game:
            queryset = queryset.filter(category__game__iexact=game)
        return queryset[:12]
