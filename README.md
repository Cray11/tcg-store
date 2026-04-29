# DracNest

DracNest is a full-stack Pokemon Trading Card Game e-commerce platform built with Django REST Framework and React.

## Stack

- Backend: Django, Django REST Framework
- Frontend: React, Vite, Tailwind CSS, Zustand
- Payments: Stripe-ready flow plus a demo payment simulation for development
- Email: transactional notifications through the backend mail provider

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements.dev.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment

### Backend `.env`

Minimum local settings:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Optional integrations:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DEFAULT_FROM_EMAIL=noreply@example.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development Notes

- The storefront is Pokemon-only and public catalog queries are filtered to `POKEMON`.
- The checkout includes a demo "Continue Payment" flow for local testing.
- Invoice and order emails are sent by the backend mail configuration.

## Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Project Structure

```text
tcg-store/
|-- backend/
|   |-- apps/
|   |-- config/
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |-- public/
|   `-- package.json
`-- README.md
```

## Support

If something is not working:

1. Confirm the backend is running on port `8000`.
2. Confirm the frontend is using the correct `VITE_API_BASE_URL`.
3. Check backend logs for API or email errors.
4. Run `pytest`, `npm run lint`, and `npm run build`.
