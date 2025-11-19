# API Endpoints Documentation

This document provides a detailed overview of the Minepath backend API, including authentication, authorization, and a summary of key endpoints.

## Authentication

All protected endpoints require a JSON Web Token (JWT) to be included in the `Authorization` header as a Bearer Token.

- **Header Format**: `Authorization: Bearer <your_access_token>`

To obtain a token, use the `POST /auth/login` endpoint with valid user credentials.

## Authorization (Role-Based Access Control)

Access to endpoints is restricted by user roles. The two primary roles are `Admin` and `KOL`.

- **Admin Role**: Has access to all administrative APIs under the `/admin/*` path.
- **KOL Role**: Has access to the KOL-specific dashboard APIs under the `/kol-dashboard/*` path.

If a user attempts to access an endpoint without the required role, a `403 Forbidden` error will be returned.

---

## Key Endpoints

### 1. Authentication (`/auth`)

- **`POST /auth/login`**
  - **Description**: Authenticates a user and returns a JWT access token.
  - **Request Body**: `{ "username": "string", "password": "string" }`
  - **Access**: Public

### 2. Admin Dashboard (`/admin`)

*All endpoints under this path require the `Admin` role.*

- **`/admin/dashboard/stats`**: Get key statistics for the main admin dashboard.
- **`/admin/users`**: Manage and view all users in the system.
- **`/admin/kols`**: Manage KOLs, their commissions, and assigned BD managers.
- **`/admin/bd-team`**: Manage the Business Development team.
- **`/admin/transactions`**: View and filter all system transactions.

### 3. KOL Dashboard (`/kol-dashboard`)

*All endpoints under this path require the `KOL` role.*

- **`GET /kol-dashboard/stats`**
  - **Description**: Retrieves overall statistics for the logged-in KOL, including referral counts, earnings, and withdrawable balances.

- **`GET /kol-dashboard/referral-growth`**
  - **Description**: Provides data for a chart showing the cumulative growth of referrals over the last 7 days.

- **`GET /kol-dashboard/commission-breakdown`**
  - **Description**: Returns the total SOL and MINE earned from commissions, suitable for a pie chart.

- **`GET /kol-dashboard/top-referrals`**
  - **Description**: Provides a paginated leaderboard of the KOL's direct referrals, ranked by the total SOL they have spent.
  - **Query Params**: `page` (number), `limit` (number).

