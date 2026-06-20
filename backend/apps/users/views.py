from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import Address, CustomUser, WishlistItem
from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, ResetPasswordConfirmSerializer, AddressSerializer,
    WishlistItemCreateSerializer, WishlistItemSerializer,
)
from apps.notifications.emails import send_welcome_email, send_password_reset_email
from apps.cart.models import Cart
from apps.cart.utils import merge_guest_cart


def success_response(data=None, message="", status_code=status.HTTP_200_OK):
    return Response({"data": data, "message": message, "errors": None}, status=status_code)


def error_response(errors, message="", status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"data": None, "message": message, "errors": errors}, status=status_code)


# ── Register ──────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors, "Registration failed.")
        user = serializer.save()
        send_welcome_email(user)
        tokens = get_tokens_for_user(user)
        return success_response(
            data={"user": UserSerializer(user).data, "tokens": tokens},
            message="Registration successful.",
            status_code=status.HTTP_201_CREATED
        )


# ── Login ─────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return error_response({"detail": "Email and password are required."})

    user = authenticate(request, username=email, password=password)
    if not user:
        return error_response(
            {"detail": "Invalid credentials."},
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    if not user.is_active:
        return error_response(
            {"detail": "Account is disabled."},
            status_code=status.HTTP_403_FORBIDDEN
        )

    session_key = request.session.session_key
    if session_key:
        guest_cart = Cart.objects.filter(session_key=session_key, user=None).first()
        if guest_cart:
            user_cart, _ = Cart.objects.get_or_create(user=user)
            if guest_cart.pk != user_cart.pk:
                merge_guest_cart(guest_cart, user_cart)

    tokens = get_tokens_for_user(user)
    return success_response(
        data={"user": UserSerializer(user).data, "tokens": tokens},
        message="Login successful."
    )


# ── Logout ────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return success_response(message="Logged out successfully.")
    except Exception:
        return error_response({"detail": "Invalid token."})


# ── Profile ───────────────────────────────────────────────────────
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


# ── Change Password ───────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors)

    user = request.user
    if not user.check_password(serializer.validated_data["current_password"]):
        return error_response({"current_password": "Incorrect password."})

    user.set_password(serializer.validated_data["new_password"])
    user.save()
    return success_response(message="Password changed successfully.")


# ── Password Reset ────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    email = request.data.get("email", "").strip().lower()
    try:
        user = CustomUser.objects.get(email=email)
        send_password_reset_email(user)
    except CustomUser.DoesNotExist:
        pass  # Don't reveal if email exists
    return success_response(message="If that email exists, a reset link has been sent.")


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    serializer = ResetPasswordConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors)

    user = serializer.validated_data["user"]
    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return success_response(message="Password has been reset successfully.")


# ── Addresses ─────────────────────────────────────────────────────
class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def set_default_address(request, pk):
    address = get_object_or_404(Address, pk=pk, user=request.user)
    address.is_default = True
    address.save()
    return success_response(
        data=AddressSerializer(address).data,
        message="Default address updated."
    )


class WishlistListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product__category")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return WishlistItemCreateSerializer
        return WishlistItemSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()

        response_serializer = WishlistItemSerializer(item, context=self.get_serializer_context())
        status_code = status.HTTP_201_CREATED if getattr(serializer, "created", False) else status.HTTP_200_OK
        return Response(response_serializer.data, status=status_code)


class WishlistDetailView(generics.DestroyAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "product_id"
    lookup_url_kwarg = "product_id"

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product__category")


# ── Helpers ───────────────────────────────────────────────────────
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
