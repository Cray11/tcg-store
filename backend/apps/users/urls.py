from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("password/change/", views.change_password_view, name="change_password"),
    path("password/reset/", views.password_reset_request, name="password_reset"),
    path("password/reset/confirm/", views.password_reset_confirm, name="password_reset_confirm"),
    path("addresses/", views.AddressListCreateView.as_view(), name="address_list"),
    path("addresses/<uuid:pk>/", views.AddressDetailView.as_view(), name="address_detail"),
    path("addresses/<uuid:pk>/set-default/", views.set_default_address, name="set_default_address"),
    path("wishlist/", views.WishlistListCreateView.as_view(), name="wishlist_list"),
    path("wishlist/<uuid:product_id>/", views.WishlistDetailView.as_view(), name="wishlist_detail"),
]
