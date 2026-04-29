# Backend Roadmap

Backend-first implementation plan adapted to the current `tcg-store` repo.

This file is not a generic wishlist. It reflects what already exists in this codebase, what is incomplete, and what should be implemented next if the focus stays on backend work.

## Status Legend

- `[x]` Built and present in the repo
- `[~]` Present but needs correction before relying on it
- `[ ]` Not complete yet
- `[?]` Environment task not guaranteed from code alone

## Current Backend Baseline

### Repo and Django setup

- `[x]` Monorepo layout with `/backend` and `/frontend`
- `[x]` Python virtual environment exists locally
- `[x]` Backend dependencies are installed locally
- `[x]` Django project uses `config/` structure
- `[x]` Settings are split into `base.py`, `development.py`, and `production.py`
- `[x]` `config/wsgi.py` and `config/asgi.py` exist
- `[x]` `config/urls.py` wires admin, health, auth, products, cart, orders, and payments routes
- `[x]` CORS settings exist for the frontend origin
- `[x]` JWT settings are configured for 15 minute access and 7 day refresh
- `[x]` All 6 Django apps exist: `users`, `products`, `cart`, `orders`, `payments`, `notifications`

### Database and local runtime

- `[x]` SQLite is configured in `development.py`
- `[x]` Initial migrations exist for all local apps
- `[x]` Local `db.sqlite3` exists
- `[x]` Migrations are currently applied in the local database
- `[x]` `manage.py check` passes
- `[?]` Superuser creation is a manual environment step and should be verified per machine
- `[?]` `/admin/` should be verified manually in the browser after local run

### Users app

- `[x]` `CustomUser` model with UUID primary key
- `[x]` `Address` model
- `[x]` Register, login, logout views
- `[x]` Profile and change-password views
- `[x]` Address CRUD views
- `[x]` Password reset request and reset-confirm flows exist
- `[x]` Registration no longer claims email verification before that feature exists
- `[x]` Custom exception handler setting points to the correct module
- `[x]` Admin registration exists for user models

### Products app

- `[x]` `Category` and `Product` models
- `[x]` Product filters for condition, rarity, type, price range, stock, and game
- `[x]` Product list and detail API views
- `[x]` Featured products API view
- `[x]` Standard pagination with 24 items per page
- `[x]` Admin registration exists for product models

### Cart app

- `[x]` `Cart` and `CartItem` models
- `[x]` Get, add, update, remove, and clear cart views
- `[x]` Guest cart support via session key
- `[x]` `merge_guest_cart` utility exists
- `[x]` Guest cart merge is wired into the login flow
- `[x]` `add_to_cart` respects the requested quantity on first create

### Orders app

- `[x]` `Order`, `OrderItem`, and `PromoCode` models
- `[x]` `create_order` view exists, and inventory locking now happens during payment reservation/finalization
- `[x]` Order list, detail, and cancel views
- `[x]` Admin order list and update views
- `[x]` Auto-generated order numbers in `TCG-YYYYMMDD-XXXX` format
- `[x]` Product snapshot fields are stored in `OrderItem`
- `[x]` Order creation leaves cart and stock unchanged until payment begins
- `[x]` Order confirmation email is sent only after payment succeeds

### Payments app

- `[x]` `Payment` model
- `[x]` Stripe payment-intent creation view
- `[x]` Stripe webhook handler
- `[x]` Handling for `payment_intent.succeeded` and `payment_intent.payment_failed`
- `[x]` Payment flow reuses existing active intents, tracks inventory reservation, and avoids duplicate success handling
- `[x]` Payment-intent creation updates the existing order payment state instead of drifting through `get_or_create()`
- `[x]` Webhook success no longer causes duplicate confirmation behavior

### Notifications app

- `[x]` Email sending helpers for welcome, order confirmation, shipped, and password reset
- `[x]` HTML email templates exist
- `[x]` Payment-backed confirmation email timing now matches successful payment finalization

### Tests

- `[x]` `pytest` is configured with fixtures in `backend/tests/conftest.py`
- `[x]` User login tests exist
- `[ ]` User registration tests
- `[ ]` Product list and filter tests
- `[~]` Cart behavior tests exist for first-add quantity and guest-cart merge
- `[~]` Order/payment lifecycle tests exist for order creation, inventory reservation, failure restore, and success finalization
- `[~]` Payment success and failure handlers are tested directly with mocks
- `[ ]` Business-logic coverage target of at least 80%

## Backend Priority Order

The next work should not follow the original list line by line. This repo already has most of the scaffolding. The right order now is correctness first, then missing backend features, then test depth.

### P0 - Correctness and gaps in existing backend

- `[x]` Fix DRF exception handler import path
- `[x]` Wire `merge_guest_cart` into login
- `[x]` Fix `add_to_cart` so first create respects requested quantity
- `[x]` Add password reset confirm endpoint and token validation flow
- `[x]` Decide email verification strategy for v1:
  - implement verification endpoints and token flow, or
  - remove the verification claim from API messages for now
- `[ ]` Review API response consistency across all apps

### P1 - Order and payment lifecycle hardening

- `[x]` Redesign checkout flow so stock is not permanently deducted before successful payment
- `[x]` Decide one clear backend source of truth:
  - create unpaid orders and finalize on webhook, or
  - create payment intent first and persist order only after confirmation
- `[x]` Make Stripe webhook handling idempotent for the success path
- `[x]` Prevent duplicate confirmation emails
- `[x]` Ensure failed payments do not leave orders or inventory in a broken state
- `[ ]` Add tests for success, failure, retry, and duplicate webhook delivery

### P2 - Backend completeness

- `[x]` Add password reset completion support on the backend
- `[ ]` Add email verification backend if it stays in product scope
- `[ ]` Add seed data strategy for categories and products
- `[ ]` Add management commands or fixtures for local bootstrap
- `[ ]` Review admin usability for catalog, orders, promo codes, and payments

### P3 - Security and production readiness

- `[ ]` Verify CORS is restricted to the intended frontend domain only
- `[ ]` Run Bandit against backend code
- `[ ]` Replace unsafe fallback secrets in local and production setup guidance
- `[ ]` Review Stripe webhook signature handling and failure logging
- `[ ]` Review email failure logging and operational visibility

## Recommended Backend Sprint Plan

### Sprint 1

- `[x]` Fix exception handler import path
- `[x]` Wire guest-cart merge into login
- `[x]` Fix cart quantity bug on first add
- `[ ]` Add backend tests for registration, cart behavior, and product filters

### Sprint 2

- `[x]` Redesign order/payment flow
- `[x]` Remove duplicate order confirmation behavior
- `[~]` Add order creation and Stripe webhook tests

### Sprint 3

- `[x]` Implement password reset completion flow
- `[x]` Decide and explicitly drop email verification for v1 messaging
- `[ ]` Add seed/bootstrap tooling and coverage improvements

## Deferred While Backend Is The Focus

These should stay out of the critical path until backend correctness is stable:

- Frontend page expansion
- Frontend component library polish
- Vercel deployment work
- Playwright and full browser E2E coverage
- Lighthouse and frontend performance work

## Working Rule For This Repo

When adding new backend features, do not treat this project as greenfield anymore.

Use this order:

1. Fix incorrect existing behavior.
2. Add missing backend capabilities.
3. Add tests for the business path that was just changed.
4. Only then move outward into frontend wiring and deployment.
