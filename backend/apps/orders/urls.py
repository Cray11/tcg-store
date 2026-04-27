from django.urls import path
from . import views

urlpatterns = [
    path("", views.OrderListView.as_view(), name="order_list"),
    path("create/", views.create_order, name="order_create"),
    path("<uuid:pk>/", views.OrderDetailView.as_view(), name="order_detail"),
    path("<uuid:pk>/cancel/", views.cancel_order, name="order_cancel"),
    path("admin/", views.AdminOrderListView.as_view(), name="admin_order_list"),
    path("admin/<uuid:pk>/", views.AdminOrderUpdateView.as_view(), name="admin_order_update"),
]