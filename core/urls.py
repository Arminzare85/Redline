
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'api/swagger/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui'
    ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema'),
        name='redoc'
    ),

    # Backend Applications
    path('accounts/', include('accounts.urls')),
    path('', include('store.urls')),
    path('api-auth/', include('rest_framework.urls')),

    # Frontend Pages - Main
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('index.html', TemplateView.as_view(template_name='index.html')),

    # Shop
    path('shop/', TemplateView.as_view(template_name='shop.html'), name='shop'),
    path('shop.html', TemplateView.as_view(template_name='shop.html')),

    # Product
    path('product/', TemplateView.as_view(template_name='product.html'), name='product'),
    path('product.html', TemplateView.as_view(template_name='product.html')),

    # Cart
    path('cart/', TemplateView.as_view(template_name='cart.html'), name='cart'),
    path('cart.html', TemplateView.as_view(template_name='cart.html')),

    # Checkout
    path('checkout/', TemplateView.as_view(template_name='checkout.html'), name='checkout'),
    path('checkout.html', TemplateView.as_view(template_name='checkout.html')),

    # Authentication
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('login.html', TemplateView.as_view(template_name='login.html')),

    # Profile
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile'),
    path('profile.html', TemplateView.as_view(template_name='profile.html')),

    # Orders
    path('orders/', TemplateView.as_view(template_name='orders.html'), name='orders'),
    path('orders.html', TemplateView.as_view(template_name='orders.html')),
]

