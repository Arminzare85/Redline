from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProductManagerOrReadOnly(BasePermission):
    """
    Anyone can read store data.
    Only Product Managers and Superusers can modify it.
    """

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:
            return True

        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name='Product Manager'
        ).exists()