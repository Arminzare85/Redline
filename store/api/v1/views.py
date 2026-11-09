from django.db.models import F

from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from store.models import Category, Brand, Product, ProductImage

from .serializers import (
    CategorySerializer,
    BrandSerializer,
    ProductSerializer,
    ProductImageSerializer,
)

from .filters import ProductFilter
from .pagination import ProductPagination
from store.permissions import IsProductManagerOrReadOnly


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsProductManagerOrReadOnly]


class BrandViewSet(ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsProductManagerOrReadOnly]


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related(
        'category', 'brand'
    ).prefetch_related('images')

    serializer_class = ProductSerializer
    permission_classes = [IsProductManagerOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        'name',
        'description',
        'short_description',
        'sku',
        'brand__name',
        'category__name',
    ]

    ordering_fields = [
        'name',
        'price',
        'discount_price',
        'stock',
        'views_count',
        'created_at',
        'updated_at',
    ]

    ordering = ['-created_at']

    pagination_class = ProductPagination

    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()

        Product.objects.filter(pk=product.pk).update(
            views_count=F('views_count') + 1
        )

        product.refresh_from_db(fields=['views_count'])

        serializer = self.get_serializer(product)

        return Response(serializer.data)


class ProductImageViewSet(ModelViewSet):
    queryset = ProductImage.objects.select_related('product')
    serializer_class = ProductImageSerializer
    permission_classes = [IsProductManagerOrReadOnly]