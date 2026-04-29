from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_welcome_email(user):
    subject = "Welcome to DracNest!"
    html = render_to_string("emails/welcome.html", {"user": user})
    _send(subject, html, [user.email])


def send_order_confirmation_email(order):
    subject = f"Order Confirmed - {order.order_number}"
    html = render_to_string("emails/order_confirmation.html", {"order": order})
    _send(subject, html, [order.user.email])


def send_order_shipped_email(order):
    subject = f"Your Order Has Shipped! - {order.order_number}"
    html = render_to_string("emails/order_shipped.html", {"order": order})
    _send(subject, html, [order.user.email])


def send_password_reset_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    subject = "Reset Your DracNest Password"
    html = render_to_string(
        "emails/password_reset.html",
        {
            "user": user,
            "reset_url": reset_url,
        },
    )
    _send(subject, html, [user.email])


def _send(subject, html_message, recipient_list):
    try:
        send_mail(
            subject=subject,
            message="",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as error:
        import logging

        logger = logging.getLogger(__name__)
        logger.error("Email send failed: %s", error)
