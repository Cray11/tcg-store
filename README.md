# DracNest

DracNest is a demo-ready Pokemon Trading Card Game e-commerce platform built with Django REST Framework and React. It is designed to behave like a real online store for presentation, development practice, and team collaboration.

## What This Project Includes

- Pokemon-only storefront and product catalog
- Authentication and account management
- Product listing, detail, cart, and checkout flow
- Demo payment simulation with invoice email
- Admin panel for managing products and backend data
- One-time importer for the `Perfect Order` set from PkmnCards

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, django-filter
- Frontend: React 18, Vite, Tailwind CSS, Zustand, Axios
- Payments: Stripe-ready flow plus demo payment simulation
- Database: SQLite for local development

## Project Structure

```text
tcg-store/
|-- backend/
|   |-- apps/
|   |   |-- users/
|   |   |-- products/
|   |   |-- cart/
|   |   |-- orders/
|   |   |-- payments/
|   |   `-- notifications/
|   |-- config/
|   |-- scripts/
|   `-- manage.py
|-- frontend/
|   |-- public/
|   |-- src/
|   `-- package.json
|-- .env.example
|-- CONTRIBUTION.md
`-- README.md
```

## Prerequisites

Install these first:

- Python 3.12+ recommended
- Node.js 18+ recommended
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/Cray11/tcg-store.git
cd tcg-store
```

## 2. Backend Setup

### Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
pip install -r requirements.dev.txt
cd ..
```

### Create backend environment file

Copy the backend environment template:

Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

macOS / Linux:

```bash
cp backend/.env.example backend/.env
```

Minimum values for local development in `backend/.env`:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
DEFAULT_FROM_EMAIL=noreply@example.com
```

Notes:

- Local development uses SQLite from `config.settings.development`
- Email defaults to console output in development
- Stripe keys are optional if you only want the demo payment flow

### Run migrations

```bash
cd backend
python manage.py migrate
cd ..
```

### Create a superuser

```bash
cd backend
python manage.py createsuperuser
cd ..
```

### Start the backend server

```bash
cd backend
python manage.py runserver
cd ..
```

Backend URLs:

- API: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/`

## 3. Frontend Setup

### Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### Create frontend environment file

For local development, create `frontend/.env` with:

```env
VITE_API_BASE_URL=/api
```

If you want to bypass the Vite proxy and call Django directly, use:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Optional:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Start the frontend server

```bash
cd frontend
npm run dev
cd ..
```

Frontend URL:

- App: `http://127.0.0.1:5173/`

## 4. Load Demo Product Data

This project includes a one-time script that imports the `Perfect Order` set into your local product catalog.

Run it after migrations:

```bash
.\.venv\Scripts\python.exe backend\scripts\import_perfect_order.py
```

What it does:

- Creates or updates the `Perfect Order` category
- Replaces existing `Perfect Order` products
- Imports 124 cards
- Uses external image URLs from PkmnCards
- Randomizes condition, language, and stock for demo filtering
- Derives PHP prices from available market-style card data
- Marks the top 12 priced cards as featured

## 5. Demo Payment Flow

The checkout includes a working demo payment simulation.

How it works:

- Create an order through checkout
- Click `Continue Payment` on the payment page
- The backend simulates a successful payment
- The order is marked paid/processing
- An invoice-style email is sent through the configured backend email sender

You do not need live Stripe credentials to demo the full checkout experience.

## 6. Testing and Verification

### Backend tests

```bash
cd backend
pytest
cd ..
```

### Frontend checks

```bash
cd frontend
npm run lint
npm run build
cd ..
```

## 7. Collaboration Workflow

Recommended team workflow:

1. Pull the latest `main`
2. Create a new branch for your task
3. Make your changes
4. Run backend/frontend checks locally
5. Commit with a clear message
6. Push your branch
7. Open a pull request

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/product-import-improvements
```

Commit format:

```bash
git commit -m "feat(products): improve importer parsing"
```

See [CONTRIBUTION.md](CONTRIBUTION.md) for the project’s contribution rules.

## 8. Common Commands

Backend:

```bash
cd backend
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
pytest
```

Frontend:

```bash
cd frontend
npm run dev
npm run lint
npm run build
```

Importer:

```bash
.\.venv\Scripts\python.exe backend\scripts\import_perfect_order.py
```

## 9. Troubleshooting

### Admin shows product image column errors

Restart the Django server and run migrations again:

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

### Frontend cannot reach the API

Check:

- Django is running on port `8000`
- `frontend/.env` has the correct `VITE_API_BASE_URL`
- Vite dev server is running on port `5173`

### Checkout email is not sending

In development, email may print to the console depending on your backend settings. If you want real email sending, configure SMTP values in `backend/.env`.

### Product catalog is empty

Run the importer again:

```bash
.\.venv\Scripts\python.exe backend\scripts\import_perfect_order.py
```

## 10. Current Project Phase

This project is currently in the `functional demo / final polish` phase.

That means:

- The core e-commerce flow is working end to end
- It behaves like a real store for demo and presentation purposes
- Some parts are intentionally simulated rather than fully productionized

## Support

If you are onboarding onto the project and something is unclear:

1. Read this README fully
2. Check [CONTRIBUTION.md](CONTRIBUTION.md)
3. Run the setup commands exactly as written
4. Ask the team before changing shared setup or import scripts
