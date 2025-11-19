# Minepath Backend

This is the backend service for the Minepath application, built with NestJS, TypeORM, and PostgreSQL. It provides a robust API for managing users, KOLs, transactions, and provides dashboard functionalities for both Admins and KOLs.

## Features

- **Authentication & Authorization:** Secure JWT-based authentication with a detailed Role-Based Access Control (RBAC) system (`Admin`, `KOL`).
- **Admin Dashboard:** A comprehensive set of APIs for administrators to manage users, KOLs, BD Team members, and view system-wide statistics.
- **KOL Dashboard:** A dedicated dashboard for KOLs to track their referral performance, commission earnings, and user engagement.
- **Database Integration:** Uses TypeORM for object-relational mapping with PostgreSQL.
- **API Documentation:** Auto-generated and interactive API documentation via Swagger.
- **Containerized:** Fully configured with Docker for consistent and reliable deployment.

---

## 🚀 Getting Started (Docker)

This is the recommended way to run the application.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A running PostgreSQL database accessible from your machine.

### Step 1: Configure Environment

Create a `.env` file in the project root by copying the example file:

```bash
cp .env.example .env
```

Open the `.env` file and fill in the required values:

```env
# .env file

# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=minepath
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT Secret - IMPORTANT: Use a long, random, and secret string
JWT_SECRET=your-super-secret-and-long-key
```

### Step 2: Build the Docker Image

```bash
docker build -t minepath-backend .
```

### Step 3: Run the Docker Container

```bash
docker run -p 3000:3000 -d --name minepath-api --env-file ./.env minepath-backend
```

### Step 4: Access the Application

- **API Server**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/api`

---

## API Documentation & Testing

All API endpoints are documented via Swagger UI at **[http://localhost:3000/api](http://localhost:3000/api)**.

### Using Authenticated Endpoints

1.  **Get Token:** Navigate to the `Authentication` section, use the `POST /auth/login` endpoint with valid credentials for an `Admin` or `KOL` user to get an `access_token`.
2.  **Authorize:** Click the **Authorize** button at the top of the Swagger page.
3.  **Set Token:** In the popup, enter `Bearer <your_access_token>` (e.g., `Bearer eyJhbGci...`) and click **Authorize**.
4.  **Test:** You can now test all the protected endpoints.

---

## Useful Docker Commands

- **Check logs:** `docker logs minepath-api`
- **Follow logs live:** `docker logs -f minepath-api`
- **Stop the container:** `docker stop minepath-api`
- **Remove the container:** `docker rm minepath-api`
- **Restart the container:** `docker start minepath-api`

---

## Running Locally (for Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- A running PostgreSQL database.

### Installation

1.  **Clone repository and install dependencies:**
    ```bash
    git clone <repository-url>
    cd minepath-backend
    npm install
    ```
2.  **Set up `.env` file** as described in the Docker setup.

### Running in Dev Mode

```bash
npm run start:dev
```

This command starts the application with hot-reloading enabled.

