from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
from .utils import get_or_create_cart


def cart_response(cart):
    return Response({
        "data": CartSerializer(cart).data,
        "message": "",
        "errors": None,
    })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_cart(request):
    cart = get_or_create_cart(request)
    return cart_response(cart)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"data": None, "errors": serializer.errors}, status=400)

    product = get_object_or_404(Product, id=serializer.validated_data["product_id"], is_active=True)
    quantity = serializer.validated_data["quantity"]

    if product.stock < quantity:
        return Response({
            "data": None,
            "message": f"Only {product.stock} units available.",
            "errors": {"stock": "Insufficient stock."}
        }, status=status.HTTP_400_BAD_REQUEST)

    cart = get_or_create_cart(request)
    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": quantity},
    )

    if not created:
        new_qty = item.quantity + quantity
        if new_qty > product.stock:
            return Response({
                "data": None,
                "message": f"Cannot add more. Only {product.stock} in stock.",
                "errors": {"stock": "Exceeds available stock."}
            }, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = new_qty
        item.save()

    return cart_response(cart)


@api_view(["PATCH"])
@permission_classes([permissions.AllowAny])
def update_cart_item(request, pk):
    serializer = UpdateCartItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"data": None, "errors": serializer.errors}, status=400)

    cart = get_or_create_cart(request)
    item = get_object_or_404(CartItem, pk=pk, cart=cart)
    new_qty = serializer.validated_data["quantity"]

    if new_qty > item.product.stock:
        return Response({
            "data": None,
            "message": f"Only {item.product.stock} units available.",
            "errors": {"stock": "Exceeds available stock."}
        }, status=status.HTTP_400_BAD_REQUEST)

    item.quantity = new_qty
    item.save()
    return cart_response(item.cart)


@api_view(["DELETE"])
@permission_classes([permissions.AllowAny])
def remove_cart_item(request, pk):
    cart = get_or_create_cart(request)
    item = get_object_or_404(CartItem, pk=pk, cart=cart)
    item.delete()
    return cart_response(cart)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def clear_cart(request):
    cart = get_or_create_cart(request)
    cart.items.all().delete()
    return cart_response(cart)
