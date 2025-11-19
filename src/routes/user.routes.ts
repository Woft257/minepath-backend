import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// GET /api/stats/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/stats/users/stats - Get user statistics
router.get('/stats', userController.getUserStats);

// GET /api/stats/users/active - Get active users
router.get('/active', userController.getActiveUsers);

// GET /api/stats/users/search - Search users
router.get('/search', userController.searchUsers);

// GET /api/stats/users/:uuid - Get user by ID
router.get('/:uuid', userController.getUserById);

// GET /api/stats/users/:uuid/transactions - Get user transactions
router.get('/:uuid/transactions', userController.getUserTransactions);

// GET /api/stats/users/:uuid/referrals - Get user referrals
router.get('/:uuid/referrals', userController.getUserReferrals);

export default router;

