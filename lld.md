# Low-Level Design (LLD)

## 1. Scope

This document defines the concrete implementation design for migrating the current Next.js application to a Spring Boot backend and a React.js frontend.

## 2. Proposed Repository Layout

### Frontend repository

- src/
  - app/ or pages/ depending on routing choice
  - components/
  - features/
  - services/
  - hooks/
  - context/
  - utils/
  - routes/

### Backend repository

- src/main/java/com/pennywise/
  - config/
  - common/
  - auth/
  - user/
  - budget/
  - expense/
  - dashboard/
  - subscription/
  - notification/
- src/main/resources/
  - db/migration/
  - application.yml

## 3. Frontend Design

### 3.1 Route Structure

Public routes:

- /
- /about-us
- /sign-in
- /sign-up

Protected routes:

- /dashboard
- /dashboard/budgets
- /dashboard/expenses
- /dashboard/expenses/:id
- /dashboard/upgrade

### 3.2 Frontend Modules

#### Auth module

- sign-in form
- sign-up form
- token storage and refresh handling
- route guards for guest-only and authenticated routes

#### Dashboard module

- summary cards
- chart widgets
- search bar
- recent expense list
- budget overview

#### Budget module

- budget list
- create budget modal or page
- edit budget action
- delete confirmation dialog

#### Expense module

- expense table
- create expense modal or page
- edit expense flow
- expense details page
- filtering and search

#### Shared components

- header
- side navigation
- buttons
- inputs
- dialogs
- alerts
- tables
- loading and empty states

### 3.3 Frontend State Management

- Use React Query or equivalent for server state
- Use local component state for form inputs and modal visibility
- Use a dedicated auth store or context for user session data
- Derive dashboard totals from backend response rather than client-side computation

### 3.4 Frontend API Layer

Create service modules for:

- auth service
- user service
- budget service
- expense service
- dashboard service
- subscription service

Responsibilities:

- Attach access token to requests
- Handle refresh token flow
- Normalize API errors
- Provide typed request and response contracts

## 4. Backend Design

### 4.1 Package Structure

#### config

- Security configuration
- CORS configuration
- OpenAPI configuration
- Jackson and serialization configuration

#### common

- Global exception handler
- API response wrapper
- validation helpers
- constants
- audit utilities

#### auth

- AuthController
- AuthService
- JwtService
- RefreshTokenService
- Auth DTOs

#### user

- UserController
- UserService
- UserRepository
- User entity
- User DTOs

#### budget

- BudgetController
- BudgetService
- BudgetRepository
- Budget entity
- Budget DTOs

#### expense

- ExpenseController
- ExpenseService
- ExpenseRepository
- Expense entity
- Expense DTOs

#### dashboard

- DashboardController
- DashboardService
- Aggregation queries
- Response DTOs

#### subscription

- SubscriptionController
- SubscriptionService
- Provider integration adapter

### 4.2 Backend Responsibilities

- Authenticate users and issue JWTs
- Enforce authorization on every protected resource
- Validate all request payloads
- Execute business rules for budgets and expenses
- Persist data via JPA repositories
- Return DTOs instead of entities
- Handle integrations with payment and notification providers

### 4.3 Security Design

- Access token JWT with short lifetime
- Refresh token with longer lifetime
- bcrypt password hashing
- CORS restricted to the frontend origin
- Role-based access control where required
- Rate limiting on login and password-related endpoints

### 4.4 Error Handling Contract

All errors should follow a common shape:

- timestamp
- status
- code
- message
- path
- fieldErrors when validation fails

Mapped HTTP codes:

- 400 for validation and business rule failures
- 401 for unauthenticated requests
- 403 for unauthorized access
- 404 for missing resources
- 409 for conflicts or duplicates
- 500 for unhandled server errors

## 5. Database Design

### 5.1 Tables

#### users

- id
- name
- email
- password_hash
- role
- status
- created_at
- updated_at

#### budgets

- id
- user_id
- name
- amount
- period
- start_date
- end_date
- created_at
- updated_at

#### expenses

- id
- user_id
- budget_id nullable
- category_id nullable
- title
- amount
- expense_date
- notes
- created_at
- updated_at

#### categories

- id
- user_id nullable
- name
- color

#### subscriptions

- id
- user_id
- plan
- status
- provider
- provider_reference
- renewal_date

#### audit_logs

- id
- actor_user_id
- action
- entity_type
- entity_id
- metadata
- created_at

### 5.2 Indexing

- Index user_id on budgets, expenses, subscriptions, and audit_logs
- Index budget_id on expenses
- Index expense_date for reporting queries
- Unique index on users.email

## 6. REST API Design

### 6.1 Auth APIs

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

### 6.2 User APIs

- GET /api/v1/users/me
- PUT /api/v1/users/me

### 6.3 Budget APIs

- GET /api/v1/budgets
- POST /api/v1/budgets
- GET /api/v1/budgets/{id}
- PUT /api/v1/budgets/{id}
- DELETE /api/v1/budgets/{id}

### 6.4 Expense APIs

- GET /api/v1/expenses
- POST /api/v1/expenses
- GET /api/v1/expenses/{id}
- PUT /api/v1/expenses/{id}
- DELETE /api/v1/expenses/{id}

### 6.5 Dashboard APIs

- GET /api/v1/dashboard/summary
- GET /api/v1/dashboard/chart-data
- GET /api/v1/dashboard/recent-activity

### 6.6 Subscription APIs

- GET /api/v1/subscription/plans
- POST /api/v1/subscription/checkout
- POST /api/v1/subscription/webhook

## 7. Key Workflows

### 7.1 Sign-In Flow

1. User submits credentials.
2. Backend validates the password.
3. Backend returns access and refresh tokens.
4. Frontend stores session state and redirects to the dashboard.

### 7.2 Create Budget Flow

1. User opens budget form.
2. Frontend validates required fields.
3. Frontend submits the payload to the backend.
4. Backend validates ownership and business rules.
5. Backend stores the budget and returns the created DTO.

### 7.3 Create Expense Flow

1. User enters expense details.
2. Frontend posts the expense payload.
3. Backend checks budget ownership if a budget is attached.
4. Backend saves the expense.
5. Dashboard summary becomes stale and is re-fetched.

### 7.4 Dashboard Load Flow

1. Frontend requests summary and chart data.
2. Backend computes totals and trends server-side.
3. Frontend renders cards and charts using the returned DTOs.

## 8. Validation Rules

- Email must be unique and valid
- Budget amount must be positive
- Expense amount must be positive
- Expense date cannot be malformed
- Resource ownership must match authenticated user
- Subscription update endpoints must be idempotent

## 9. Observability

- Structured JSON logs
- Request correlation IDs
- Metrics for API latency, error rate, and throughput
- Audit log writes for sensitive state changes

## 10. Testing Strategy

### Frontend

- Component tests for forms and reusable UI
- Integration tests for authentication and CRUD flows
- Route guard tests

### Backend

- Unit tests for business services
- Repository tests for persistence logic
- Controller tests for API contracts
- Security tests for authorization rules
- Integration tests for dashboard aggregation and subscription flows

## 11. Migration Notes

- Keep business logic out of the frontend
- Use DTOs to avoid leaking database structure
- Preserve existing user flows and URL semantics where possible
- Migrate authentication carefully if the current app depends on an external provider

## 12. Deliverables

- Spring Boot backend service
- React frontend application
- DB migration scripts
- OpenAPI specification
- Deployment configuration
- Test suite for critical flows
