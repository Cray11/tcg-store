import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.users.models import CustomUser

if not CustomUser.objects.filter(email="admin@tcgstore.com").exists():
    CustomUser.objects.create_superuser(
        email="admin@tcgstore.com",
        password="AdminPass123!",
        first_name="Admin",
        last_name="User"
    )
    print("Superuser created successfully.")
else:
    print("Superuser already exists.")
