# frontend routes for the Redline templates. Copy this file next to your project urls.py
# (rename if you like) and APPEND it to your existing urlpatterns - see INTEGRATION.md.
from django.urls import path
from django.views.generic import TemplateView

PAGES = ["index", "shop", "product", "cart", "checkout", "login", "profile", "orders"]

frontend_urlpatterns = [path("", TemplateView.as_view(template_name="index.html"), name="home")] + [
    path(f"{p}.html", TemplateView.as_view(template_name=f"{p}.html"), name=f"page-{p}") for p in PAGES
]
