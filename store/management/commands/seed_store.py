import random

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from store.models import Category, Brand, Product


class Command(BaseCommand):
    help = 'Create sample categories, brands and products.'

    def handle(self, *args, **options):

        random.seed(42)

        with transaction.atomic():

            self.create_categories()
            self.create_brands()
            self.create_products()

        self.stdout.write(
            self.style.SUCCESS(
                'Store sample data created successfully!'
            )
        )

    def create_categories(self):

        categories = [
            'Engine Performance',
            'Exhaust Systems',
            'Suspension',
            'Brakes',
            'Air Intake',
            'Exterior Accessories',
        ]

        self.categories = {}

        for name in categories:

            category, _ = Category.objects.get_or_create(
                name=name,
                defaults={
                    'description': f'{name} products for performance cars.',
                    'is_active': True,
                }
            )

            self.categories[name] = category

        self.stdout.write(
            self.style.SUCCESS('Categories created.')
        )

    def create_brands(self):

        brands = [
            'Brembo',
            'K&N',
            'Borla',
            'Bilstein',
            'HKS',
            'Mishimoto',
            'Eibach',
            'Sparco',
        ]

        self.brands = {}

        for name in brands:

            brand, _ = Brand.objects.get_or_create(
                name=name,
                defaults={
                    'description': f'{name} automotive performance products.',
                    'is_active': True,
                }
            )

            self.brands[name] = brand

        self.stdout.write(
            self.style.SUCCESS('Brands created.')
        )

    def create_products(self):

        product_templates = [
            ('Sport Air Filter', 'Air Intake'),
            ('Cold Air Intake Kit', 'Air Intake'),
            ('Performance Exhaust', 'Exhaust Systems'),
            ('Stainless Steel Header', 'Exhaust Systems'),
            ('Sport Muffler', 'Exhaust Systems'),
            ('Performance Brake Pads', 'Brakes'),
            ('Sport Brake Disc', 'Brakes'),
            ('Adjustable Coilover', 'Suspension'),
            ('Sport Shock Absorber', 'Suspension'),
            ('Performance Spring Kit', 'Suspension'),
            ('Engine Oil Cooler', 'Engine Performance'),
            ('Performance Spark Plug', 'Engine Performance'),
            ('Engine Mount Kit', 'Engine Performance'),
            ('Sport Steering Wheel', 'Exterior Accessories'),
            ('Carbon Fiber Spoiler', 'Exterior Accessories'),
        ]

        brand_names = list(self.brands.keys())

        for index in range(1, 31):

            template_name, category_name = product_templates[
                (index - 1) % len(product_templates)
            ]

            brand_name = brand_names[(index - 1) % len(brand_names)]

            sku = f'RL-{index:04d}'

            base_price = random.randint(500, 50000) * 1000

            has_discount = random.choice([True, False])

            discount_price = (
                Decimal(base_price * random.randint(80, 95) / 100)
                .quantize(Decimal('0.01'))
                if has_discount else None
            )

            Product.objects.update_or_create(
                sku=sku,
                defaults={
                    'name': f'{brand_name} {template_name} {index}',
                    'description': (
                        f'{brand_name} {template_name}. '
                        'Designed for automotive performance and reliability.'
                    ),
                    'short_description': (
                        f'High-quality {template_name} by {brand_name}.'
                    ),
                    'category': self.categories[category_name],
                    'brand': self.brands[brand_name],
                    'price': Decimal(base_price),
                    'discount_price': discount_price,
                    'stock': random.randint(0, 100),
                    'is_available': True,
                    'is_active': True,
                }
            )

        self.stdout.write(
            self.style.SUCCESS('30 products created or updated.')
        )