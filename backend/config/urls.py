from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok", "service": "tcg-store-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check),
    path("api/auth/", include("apps.users.urls")),
    path("api/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
]