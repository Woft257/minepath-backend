# Minepath Backend API

Backend API server for Minepath Dashboard built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- ✅ RESTful API with TypeScript
- ✅ PostgreSQL database integration
- ✅ CORS enabled
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Response compression
- ✅ Health check endpoint
- ✅ Comprehensive error handling

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd minepath-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
PORT=3000
NODE_ENV=development

DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=minepath
DB_USER=dbadmin
DB_PASSWORD=your-password
DB_SSL=true

CORS_ORIGIN=http://localhost:8080
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check database connection status

### Dashboard
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/dashboard/transactions` - Get recent transactions
- `GET /api/stats/dashboard/transactions/range?startDate=&endDate=` - Get transactions by date range
- `GET /api/stats/dashboard/user-growth?days=30` - Get user growth data

### KOLs
- `GET /api/stats/kols` - Get all KOLs
- `GET /api/stats/kols/overview` - Get KOL overview statistics
- `GET /api/stats/kols/top?limit=10` - Get top KOLs
- `GET /api/stats/kols/:uuid` - Get KOL by ID
- `GET /api/stats/kols/:uuid/referrals` - Get KOL referrals
- `GET /api/stats/kols/:uuid/earnings?startDate=&endDate=` - Get KOL earnings

### BD Team
- `GET /api/stats/bd-team` - Get all BD team members
- `GET /api/stats/bd-team/:uuid` - Get BD member by ID
- `GET /api/stats/bd-team/:uuid/kols` - Get managed KOLs
- `GET /api/stats/bd-team/:uuid/performance?startDate=&endDate=` - Get BD performance

### Users
- `GET /api/stats/users?limit=100&offset=0` - Get all users
- `GET /api/stats/users/stats` - Get user statistics
- `GET /api/stats/users/active?days=7` - Get active users
- `GET /api/stats/users/search?q=username` - Search users
- `GET /api/stats/users/:uuid` - Get user by ID
- `GET /api/stats/users/:uuid/transactions?limit=50` - Get user transactions
- `GET /api/stats/users/:uuid/referrals` - Get user referrals

### Transactions
- `GET /api/stats/transactions?limit=100&offset=0` - Get all transactions
- `GET /api/stats/transactions/stats` - Get transaction statistics
- `GET /api/stats/transactions/range?startDate=&endDate=` - Get transactions by date range
- `GET /api/stats/transactions/claims?limit=20` - Get recent claims
- `GET /api/stats/transactions/method/:method?limit=100` - Get transactions by method
- `GET /api/stats/transactions/:id` - Get transaction by ID

## Project Structure

```
minepath-backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/             # Request handlers
│   │   ├── dashboard.controller.ts
│   │   ├── kol.controller.ts
│   │   ├── bd-team.controller.ts
│   │   ├── user.controller.ts
│   │   └── transaction.controller.ts
│   ├── services/                # Business logic
│   │   ├── dashboard.service.ts
│   │   ├── kol.service.ts
│   │   ├── bd-team.service.ts
│   │   ├── user.service.ts
│   │   └── transaction.service.ts
│   ├── routes/                  # API routes
│   │   ├── dashboard.routes.ts
│   │   ├── kol.routes.ts
│   │   ├── bd-team.routes.ts
│   │   ├── user.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   └── index.ts                 # Application entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

The backend connects to a PostgreSQL database with the following main tables:

- `players` - User accounts with balances, roles, and referral data
- `transaction_logs` - Transaction history
- `ref_logs` - Referral tracking
- `mine_to_earn` - Player upgrades

See `DatabaseManager.java` in the main project for complete schema.

## License

MIT

