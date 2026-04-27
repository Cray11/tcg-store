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

## 🤝 Contributing & Git Workflow

### 📋 Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/Cray11/tcg-store.git
   cd tcg-store
   git remote add upstream https://github.com/Cray11/tcg-store.git
   ```

2. **Keep your fork updated**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

### 🌿 Branching Strategy

We use a feature branch workflow with the following naming conventions:

- **Features**: `feature/description-of-feature`
- **Bug fixes**: `fix/description-of-bug`
- **Hotfixes**: `hotfix/critical-fix`
- **Documentation**: `docs/update-readme`

**Never commit directly to `main` branch!**

### 🚀 Working on Features

1. **Create a feature branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, tested code
   - Follow the existing code style
   - Update documentation if needed
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   # Stage your changes
   git add .

   # Commit with descriptive message
   git commit -m "feat: add user authentication feature

   - Implement JWT token authentication
   - Add login/register endpoints
   - Update frontend auth store
   - Add proper error handling"

   # Use conventional commit format:
   # feat: new feature
   # fix: bug fix
   # docs: documentation
   # style: formatting
   # refactor: code restructuring
   # test: adding tests
   # chore: maintenance
   ```

4. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to GitHub and create a PR from your branch to `main`
   - Fill out the PR template with:
     - Clear description of changes
     - Screenshots/videos if UI changes
     - Testing instructions
     - Related issues

### 🔄 Pull Request Process

1. **PR Review Requirements**
   - At least 1 reviewer approval required
   - All CI checks must pass
   - No merge conflicts
   - Tests pass locally

2. **Code Review Checklist**
   - [ ] Code follows project conventions
   - [ ] Tests are included/updated
   - [ ] Documentation is updated
   - [ ] No console errors or warnings
   - [ ] Responsive design (if frontend)
   - [ ] Accessibility considerations

3. **Merging**
   - Use "Squash and merge" for clean history
   - Delete the feature branch after merge

### 🔧 Daily Git Commands

```bash
# Check status
git status

# See changes
git diff
git diff --staged

# Undo changes
git checkout -- file.txt          # Discard changes to file
git reset HEAD file.txt           # Unstage file
git reset --hard HEAD             # Discard all changes (dangerous!)

# Update from main
git checkout main
git pull upstream main
git checkout your-branch
git rebase main                    # Or git merge main

# Clean up local branches
git branch -d feature/old-branch   # Delete merged branch
git remote prune origin           # Remove deleted remote branches
```

### 🚨 Conflict Resolution

If you encounter merge conflicts:

```bash
# Abort current merge/rebase
git merge --abort
# or
git rebase --abort

# Resolve conflicts manually, then:
git add resolved-file.txt
git commit -m "Resolve merge conflicts"
```

### 📝 Commit Message Guidelines

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(auth): add Google OAuth login
fix(cart): resolve duplicate items bug
docs(readme): update installation instructions
refactor(api): simplify user serializer
```

### 🔒 Protected Branches

- `main`: Protected branch, requires PR review
- Direct pushes disabled
- Force pushes disabled
- Branch deletion disabled

### 🧪 Pre-commit Checks

Before pushing, ensure:

```bash
# Backend
cd backend
python manage.py check
python manage.py test
pip install -r requirements.dev.txt  # If using pre-commit hooks

# Frontend
cd frontend
npm run lint
npm run build  # Ensure no build errors
```

### 📞 Communication

- Use GitHub Issues for bugs/features
- Use PR comments for code discussion
- Keep commits atomic and focused
- Update PR description as work progresses

### 🎯 Best Practices

- **Small, focused PRs** - Easier to review
- **Regular commits** - Don't wait until feature is "done"
- **Test locally** - Don't rely only on CI
- **Update dependencies** - Keep packages current
- **Document breaking changes** - Update README/API docs
- **Pair programming** - For complex features

### 🚨 Emergency Procedures

**If you accidentally committed to main:**
1. Don't panic
2. Create a revert commit: `git revert HEAD`
3. Push the revert
4. Create proper feature branch for the changes

**If you need to undo a commit:**
```bash
git reset --soft HEAD~1  # Keep changes staged
git reset --hard HEAD~1  # Discard changes completely
```

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