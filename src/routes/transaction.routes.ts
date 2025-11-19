import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
const transactionController = new TransactionController();

// GET /api/stats/transactions - Get all transactions
router.get('/', transactionController.getAllTransactions);

// GET /api/stats/transactions/stats - Get transaction statistics
router.get('/stats', transactionController.getTransactionStats);

// GET /api/stats/transactions/range - Get transactions by date range
router.get('/range', transactionController.getTransactionsByDateRange);

// GET /api/stats/transactions/claims - Get recent claims
router.get('/claims', transactionController.getRecentClaims);

// GET /api/stats/transactions/method/:method - Get transactions by method
router.get('/method/:method', transactionController.getTransactionsByMethod);

// GET /api/stats/transactions/:id - Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

export default router;

