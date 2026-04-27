from django.urls import path
from . import views

urlpatterns = [
    path("", views.get_cart, name="cart_detail"),
    path("add/", views.add_to_cart, name="cart_add"),
    path("items/<uuid:pk>/", views.update_cart_item, name="cart_item_update"),
    path("items/<uuid:pk>/remove/", views.remove_cart_item, name="cart_item_remove"),
    path("clear/", views.clear_cart, name="cart_clear"),
]