# Minepath Backend API

Backend API server for the Minepath Dashboard, built with **NestJS**, **TypeScript**, and **PostgreSQL**. This project is containerized with **Docker** for consistent and reliable deployment.

## Features

- **Modern Framework**: Built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications.
- **Database Integration**: Uses TypeORM to connect to a PostgreSQL database.
- **API Documentation**: Integrated Swagger UI for easy API exploration and testing.
- **Containerized**: Fully configured to run in a Docker container, eliminating environment-specific issues.
- **Clean Architecture**: Organized into modules for better maintainability (Admin, Users, etc.).

---

## 🚀 Getting Started (Deployment with Docker)

This is the recommended and most reliable way to run the application.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

### Step 1: Create the Environment File

Create a file named `.env` in the root of the project (`minepath-backend/.env`) and add your database connection details. This file is crucial for the application to connect to your existing database.

```env
# .env file

# PostgreSQL Database Connection
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# Application Port (Optional, defaults to 3000)
PORT=3000
```

### Step 2: Build the Docker Image

Open a terminal in the project's root directory (`e:\Code\Minepath\minepath-backend`) and run the following command. This will build the Docker image based on the `Dockerfile`.

```bash
docker build -t minepath-backend .
```

### Step 3: Run the Docker Container

Once the image is built, run the application inside a container with this command. It will start the server and connect it to your database.

```bash
docker run -p 3000:3000 -d --name minepath-api --env-file ./.env minepath-backend
```

**Command Breakdown:**
- `-p 3000:3000`: Maps port 3000 on your machine to port 3000 inside the container.
- `-d`: Runs the container in detached mode (in the background).
- `--name minepath-api`: Assigns a convenient name to the container.
- `--env-file ./.env`: Passes your database credentials from the `.env` file into the container.
- `minepath-backend`: The name of the image to run.

### Step 4: Access the Application

Your backend server is now running!

- **Swagger API Docs**: Open your browser and go to [**http://localhost:3000/api**](http://localhost:3000/api)
- **Base URL**: The API is running at `http://localhost:3000`

---

## API Documentation

All available API endpoints are documented and testable via the Swagger UI.

**URL**: [**http://localhost:3000/api**](http://localhost:3000/api)

All dashboard-related APIs are grouped under the **"Admin Dashboard"** tag.

## Useful Docker Commands

- **Check container logs:**
  ```bash
  docker logs minepath-api
  ```
- **Stop the container:**
  ```bash
  docker stop minepath-api
  ```
- **Remove the container:**
  ```bash
  docker rm minepath-api
  ```
- **Restart the container:**
  ```bash
  docker start minepath-api
  ```

## License

MIT

