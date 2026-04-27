# TCG Store 🃏

A full-stack e-commerce platform for trading card games (Pokémon, Magic: The Gathering, Yu-Gi-Oh!) built with Django REST Framework and React.

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Cray11/tcg-store.git
cd tcg-store
```

### 2. Backend Setup (Django)

#### Install Python Dependencies

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
pip install -r requirements.dev.txt
```

#### Environment Configuration

```bash
cp ../.env.example .env
```

Edit `.env` and configure the following (minimum required for development):

```env
# Backend
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Optional for payments (get from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Database Setup

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Run Backend Server

```bash
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup (React)

#### Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### Environment Configuration

```bash
cp ../.env.example .env
```

Edit `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Run Frontend Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📁 Project Structure

```
tcg-store/
├── backend/                 # Django REST API
│   ├── apps/               # Django apps
│   │   ├── users/         # User management
│   │   ├── products/      # Product catalog
│   │   ├── cart/          # Shopping cart
│   │   ├── orders/        # Order management
│   │   ├── payments/      # Stripe integration
│   │   └── notifications/ # Email notifications
│   ├── config/            # Django settings
│   └── requirements.txt   # Python dependencies
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── api/           # API client
│   └── package.json       # Node dependencies
└── .env.example           # Environment template
```

## 🔧 Development

### Code Quality

#### Backend
```bash
cd backend
pip install -r requirements.dev.txt
python manage.py check  # Django checks
pytest  # Run tests
```

#### Frontend
```bash
cd frontend
npm run lint  # ESLint
npm run build  # Production build
```

### API Documentation

Once the backend is running, visit:
- API Root: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

## 🚀 Deployment

### Backend (Production)
1. Set `DJANGO_DEBUG=False` in `.env`
2. Configure production database (PostgreSQL recommended)
3. Set up Stripe webhooks
4. Configure email service (SendGrid, etc.)
5. Use `config.settings.production`

### Frontend (Production)
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add some feature'`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Check the backend logs and browser console

### Common Issues

**Backend won't start:**
- Ensure virtual environment is activated
- Check if port 8000 is available
- Verify `.env` file exists and is properly configured

**Frontend shows blank page:**
- Ensure backend is running on port 8000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Clear browser cache and restart dev server

**Database errors:**
- Run `python manage.py migrate`
- Check database file permissions (SQLite)

**Stripe payments not working:**
- Ensure Stripe keys are set in both backend and frontend `.env`
- Use test keys for development</content>
<parameter name="filePath">d:\ecommercetcg\tcg-store\tcg-store\README.md