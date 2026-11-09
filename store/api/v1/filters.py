import django_filters

from store.models import Product


class ProductFilter(django_filters.FilterSet):

    # Price filters
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte'
    )

    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte'
    )

    # Category and brand filters
    category = django_filters.NumberFilter(
        field_name='category__id'
    )

    brand = django_filters.NumberFilter(
        field_name='brand__id'
    )

    # Stock filters
    in_stock = django_filters.BooleanFilter(
        method='filter_in_stock'
    )

    min_stock = django_filters.NumberFilter(
        field_name='stock',
        lookup_expr='gte'
    )

    max_stock = django_filters.NumberFilter(
        field_name='stock',
        lookup_expr='lte'
    )

    # Discount filter
    has_discount = django_filters.BooleanFilter(
        method='filter_has_discount'
    )

    # Availability and active status
    is_available = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)

        return queryset.filter(stock=0)

    def filter_has_discount(self, queryset, name, value):
        if value:
            return queryset.filter(discount_price__isnull=False)

        return queryset.filter(discount_price__isnull=True)

    class Meta:
        model = Product
        fields = []