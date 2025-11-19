import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

// GET /api/stats/dashboard - Get dashboard statistics
router.get('/', dashboardController.getStats);

// GET /api/stats/dashboard/transactions - Get recent transactions
router.get('/transactions', dashboardController.getRecentTransactions);

// GET /api/stats/dashboard/transactions/range - Get transactions by date range
router.get('/transactions/range', dashboardController.getTransactionsByDateRange);

// GET /api/stats/dashboard/user-growth - Get user growth data
router.get('/user-growth', dashboardController.getUserGrowth);

export default router;

