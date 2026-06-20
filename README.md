# DracNest TCG-Store
## What This Project Includes

- Pokemon-only storefront and product catalog
- Authentication and account management
- Product listing, detail, cart, and checkout flow
- Structured demo checkout with invoice email
- Admin panel for managing products and backend data
- One-time importer for the `Perfect Order` set from PkmnCards

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, django-filter
- Frontend: React 18, Vite, Tailwind CSS, Zustand, Axios
- Payments: Structured demo checkout with invoice email simulation
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
- No external payment gateway credentials are required for the demo checkout

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

The checkout includes a working demo payment flow.

How it works:

- Create an order through checkout
- The payment page prepares a pending demo payment and reserves inventory
- Click `Complete Demo Payment` on the payment page
- The backend records the payment as successful and moves the order into processing
- An invoice-style email is sent through the configured backend email sender

You do not need any live gateway credentials to demo the full checkout experience.

## 6. Vercel Deployment

This repo is best deployed to Vercel as two separate projects:

- Frontend project with Root Directory set to `frontend`
- Backend project with Root Directory set to `backend`

Why two projects:

- The frontend is a Vite single-page app
- The backend is a standalone Django API
- Demo checkout writes orders, payments, carts, and users, so the backend needs a real external database in production

Recommended order:

1. Import the GitHub repo into Vercel as the backend project with Root Directory `backend`
2. Add backend environment variables:
   `DJANGO_SETTINGS_MODULE=config.settings.production`
   `DJANGO_SECRET_KEY=<strong-secret>`
   `DATABASE_URL=<your-postgres-connection-string>`
   `ALLOWED_HOSTS=.vercel.app`
   `CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>`
   `CSRF_TRUSTED_ORIGINS=https://<your-frontend-domain>`
   `FRONTEND_URL=https://<your-frontend-domain>`
3. Deploy the backend and copy its public URL
4. Import the same GitHub repo into Vercel as the frontend project with Root Directory `frontend`
5. Add frontend environment variable:
   `VITE_API_BASE_URL=https://<your-backend-domain>/api`
6. Deploy the frontend

Notes:

- Vercel supports Django deployments from the `backend` directory, but SQLite is not suitable for a writable production demo
- Use a managed Postgres database such as Neon, Supabase, or another hosted PostgreSQL provider
- Development can stay on SQLite locally; production should use `DATABASE_URL`

## 7. Testing and Verification

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

## 8. Collaboration Workflow

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

## 9. Common Commands

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

## 10. Troubleshooting

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

## 11. Current Project Phase

This project is currently in the `functional demo / final polish` phase.

That means:

- The core e-commerce flow is working end to end
- It behaves like a real store for demo and presentation purposes
- Some parts are intentionally simulated rather than fully productionized

