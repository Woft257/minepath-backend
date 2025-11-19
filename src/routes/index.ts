import { Router } from 'express';
import healthRoutes from './health.routes';
import dashboardRoutes from './dashboard.routes';
import kolRoutes from './kol.routes';
import bdTeamRoutes from './bd-team.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Stats endpoints
router.use('/stats/dashboard', dashboardRoutes);
router.use('/stats/kols', kolRoutes);
router.use('/stats/bd-team', bdTeamRoutes);
router.use('/stats/users', userRoutes);
router.use('/stats/transactions', transactionRoutes);

export default router;

