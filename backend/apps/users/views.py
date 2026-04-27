from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import CustomUser, Address
from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, AddressSerializer
)
from apps.notifications.emails import send_welcome_email, send_password_reset_email
import uuid


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
            message="Registration successful. Please verify your email.",
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


# ── Helpers ───────────────────────────────────────────────────────
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }