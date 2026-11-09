from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    BrandViewSet,
    ProductViewSet,
    ProductImageViewSet,
)

app_name = 'store_api_v1'

router = DefaultRouter()

router.register('categories', CategoryViewSet, basename='category')
router.register('brands', BrandViewSet, basename='brand')
router.register('products', ProductViewSet, basename='product')
router.register('product-images', ProductImageViewSet, basename='product-image')

urlpatterns = router.urls