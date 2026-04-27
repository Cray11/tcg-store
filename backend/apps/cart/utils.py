from .models import Cart, CartItem


def get_or_create_cart(request):
    """Get or create cart for authenticated user or guest session."""
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    else:
        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(
            session_key=session_key, user=None
        )
        return cart


def merge_guest_cart(guest_cart, user_cart):
    """Merge guest cart into user cart on login."""
    for guest_item in guest_cart.items.select_related("product").all():
        existing = user_cart.items.filter(product=guest_item.product).first()
        if existing:
            new_qty = existing.quantity + guest_item.quantity
            existing.quantity = min(new_qty, guest_item.product.stock)
            existing.save()
        else:
            guest_item.cart = user_cart
            guest_item.save()
    guest_cart.delete()