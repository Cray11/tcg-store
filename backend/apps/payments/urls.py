from django.urls import path
from . import views

urlpatterns = [
    path("prepare/", views.prepare_demo_payment, name="prepare_demo_payment"),
    path("complete/", views.complete_demo_payment, name="complete_demo_payment"),
]
