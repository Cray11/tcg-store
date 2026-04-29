from django.db import transaction

from apps.cart.models import Cart
from apps.products.models import Product


class InventoryError(Exception):
    pass


def reserve_order_inventory(order):
    order_items = list(order.items.select_related("product").all())
    product_ids = [item.product_id for item in order_items if item.product_id]
    locked_products = {
        product.id: product
        for product in Product.objects.select_for_update().filter(id__in=product_ids)
    }

    for item in order_items:
        if not item.product_id:
            raise InventoryError(f"'{item.product_name}' is no longer available.")

        product = locked_products.get(item.product_id)
        if product is None:
            raise InventoryError(f"'{item.product_name}' is no longer available.")
        if product.stock < item.quantity:
            raise InventoryError(f"'{item.product_name}' only has {product.stock} left.")

    for item in order_items:
        product = locked_products[item.product_id]
        product.stock -= item.quantity

    Product.objects.bulk_update(locked_products.values(), ["stock"])


def restore_order_inventory(order):
    order_items = list(order.items.select_related("product").all())
    product_ids = [item.product_id for item in order_items if item.product_id]
    locked_products = {
        product.id: product
        for product in Product.objects.select_for_update().filter(id__in=product_ids)
    }

    for item in order_items:
        if not item.product_id:
            continue
        product = locked_products.get(item.product_id)
        if product is None:
            continue
        product.stock += item.quantity

    if locked_products:
        Product.objects.bulk_update(locked_products.values(), ["stock"])


def sync_cart_after_payment(order):
    try:
        cart = Cart.objects.prefetch_related("items").get(user=order.user)
    except Cart.DoesNotExist:
        return

    order_quantities = {item.product_id: item.quantity for item in order.items.all() if item.product_id}
    cart_items = list(cart.items.filter(product_id__in=order_quantities).all())

    items_to_update = []
    items_to_delete = []

    for cart_item in cart_items:
        ordered_quantity = order_quantities[cart_item.product_id]
        if cart_item.quantity <= ordered_quantity:
            items_to_delete.append(cart_item.id)
        else:
            cart_item.quantity -= ordered_quantity
            items_to_update.append(cart_item)

    if items_to_delete:
        cart.items.filter(id__in=items_to_delete).delete()
    if items_to_update:
        type(cart_items[0]).objects.bulk_update(items_to_update, ["quantity"])
