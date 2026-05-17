# High-Level Design (HLD)

## 1. Objective

Migrate the current Next.js application to a Spring Boot backend and a React.js frontend while preserving the existing product capabilities:

- Authentication and user session management
- Dashboard with charts and summaries
- Budgets CRUD
- Expenses CRUD
- Upgrade/subscription flow
- Static marketing pages such as About Us

## 2. Target Architecture

The new system will follow a decoupled client-server model.

### Frontend

- React.js single-page application
- Responsible for routing, rendering, form handling, and client-side state
- Communicates with the backend via REST APIs over HTTPS

### Backend

- Spring Boot REST API
- Responsible for authentication, authorization, business rules, validation, persistence, and integrations
- Exposes versioned JSON APIs to the frontend

### Data and Infrastructure

- PostgreSQL as the primary relational database
- Redis optional for caching, rate limiting, token support, or short-lived server state
- Object storage optional for receipts, avatars, and uploads
- External services for email, payments, and notifications where needed

## 3. System Context

Users access the React frontend from browsers or mobile web.
The frontend sends requests to Spring Boot APIs.
The backend reads and writes PostgreSQL, enforces business rules, and integrates with external providers.

## 4. Key Components

### React Frontend

- Public pages: landing, about, sign-in, sign-up
- Protected pages: dashboard, budgets, expenses, upgrade
- Shared UI: header, navigation, cards, tables, dialogs, forms
- API layer: typed service modules, token handling, error handling

### Spring Boot Backend

- Auth module
- User module
- Budget module
- Expense module
- Dashboard aggregation module
- Subscription/upgrade module
- Common module for exceptions, validation, logging, and response formatting

### Persistence Layer

- JPA entities and repositories
- Flyway or Liquibase migrations
- Reporting queries for dashboard summaries and trend data

## 5. Core Data Flow

1. User signs in through the React frontend.
2. Frontend sends credentials to the Spring Boot auth API.
3. Backend validates credentials and returns access and refresh tokens.
4. Frontend stores tokens securely and attaches access tokens to API requests.
5. User performs actions such as creating budgets or expenses.
6. Backend validates authorization, applies business rules, persists data, and returns DTOs.
7. Dashboard screen requests aggregated summary data from the backend.
8. Backend computes totals and chart-ready responses server-side.

## 6. Authentication and Authorization

- Use JWT-based authentication
- Access token with short expiry
- Refresh token with longer expiry
- Passwords hashed with bcrypt
- Resource-level authorization so users can only access their own data
- Optional role support for admin or premium features

## 7. Data Model Overview

Main entities:

- users
- budgets
- expenses
- categories
- subscriptions
- audit_logs

Relationships:

- One user has many budgets
- One user has many expenses
- One budget can have many expenses
- Optional categories can be shared or user-specific
- One user can have one active subscription record at a time

## 8. API Style

- RESTful JSON APIs
- Versioned endpoints such as /api/v1
- Predictable response envelopes
- Standard HTTP status codes
- Centralized validation and exception handling

## 9. Non-Functional Requirements

- Stateless services for horizontal scaling
- Secure token handling and CORS restrictions
- Structured logs and metrics for observability
- Idempotent write operations where needed
- Efficient dashboard queries with indexes and aggregation support

## 10. Deployment View

### Frontend

- Deployed as static assets or via a CDN
- Communicates only with the backend API domain

### Backend

- Deployed as a containerized Spring Boot service
- Scales horizontally behind a load balancer or API gateway

### Database

- Managed PostgreSQL instance with backups and migration control

## 11. Migration Strategy

### Phase 1: Foundation

- Freeze feature scope
- Define API contracts
- Design relational schema

### Phase 2: Backend Build

- Implement auth, users, budgets, and expenses
- Add validation, logging, and global error handling

### Phase 3: Frontend Build

- Recreate pages in React
- Add route guards and API integration

### Phase 4: Dashboard and Reporting

- Implement aggregation APIs
- Add chart and summary views

### Phase 5: Upgrade and Hardening

- Add subscription/payment integration
- Add caching, rate limiting, and audit logging

### Phase 6: Cutover

- Migrate data if required
- Switch traffic to the new frontend and backend

## 12. Key Risks

- Authentication migration if the current app depends on a third-party auth provider
- Schema mismatch between the current app and the new relational model
- Performance issues in dashboard aggregation without proper indexing
- Payment and subscription idempotency concerns

## 13. Acceptance Criteria

- All existing core workflows are available in the new stack
- Users can sign in, manage budgets, and track expenses
- Dashboard metrics are returned by the backend and rendered in React
- Production deployment works without relying on Next.js
- Security, validation, and authorization are enforced server-side
