from django.contrib import admin
from .models import Category, Brand, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'category',
        'brand',
        'price',
        'stock',
        'is_available',
        'is_active',
    )
    list_filter = ('category', 'brand', 'is_available', 'is_active')
    search_fields = ('name', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]