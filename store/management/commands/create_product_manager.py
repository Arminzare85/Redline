from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from store.models import Category, Brand, Product, ProductImage


class Command(BaseCommand):
    help = 'Create Product Manager group and assign store permissions.'

    def handle(self, *args, **options):

        group, created = Group.objects.get_or_create(
            name='Product Manager'
        )

        models = [
            Category,
            Brand,
            Product,
            ProductImage,
        ]

        permissions = []

        for model in models:
            content_type = ContentType.objects.get_for_model(model)

            model_permissions = Permission.objects.filter(
                content_type=content_type,
                codename__in=[
                    f'add_{model._meta.model_name}',
                    f'change_{model._meta.model_name}',
                    f'delete_{model._meta.model_name}',
                    f'view_{model._meta.model_name}',
                ]
            )

            permissions.extend(model_permissions)

        group.permissions.set(permissions)

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    'Product Manager group created successfully.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    'Product Manager permissions updated successfully.'
                )
            )