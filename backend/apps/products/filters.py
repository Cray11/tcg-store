import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    game = django_filters.CharFilter(field_name="category__game", lookup_expr="iexact")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    set_name = django_filters.CharFilter(field_name="set_name", lookup_expr="iexact")

    class Meta:
        model = Product
        fields = {
            "category__slug": ["exact"],
            "condition": ["exact"],
            "rarity": ["exact"],
            "product_type": ["exact"],
            "language": ["exact"],
            "is_foil": ["exact"],
            "is_featured": ["exact"],
            "set_name": ["icontains"],
        }

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
