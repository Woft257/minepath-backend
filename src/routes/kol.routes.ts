import { Router } from 'express';
import { KOLController } from '../controllers/kol.controller';

const router = Router();
const kolController = new KOLController();

// GET /api/stats/kols - Get all KOLs
router.get('/', kolController.getAllKOLs);

// GET /api/stats/kols/overview - Get KOL overview statistics
router.get('/overview', kolController.getKOLOverview);

// GET /api/stats/kols/top - Get top KOLs
router.get('/top', kolController.getTopKOLs);

// GET /api/stats/kols/:uuid - Get KOL by ID
router.get('/:uuid', kolController.getKOLById);

// GET /api/stats/kols/:uuid/referrals - Get KOL referrals
router.get('/:uuid/referrals', kolController.getKOLReferrals);

// GET /api/stats/kols/:uuid/earnings - Get KOL earnings
router.get('/:uuid/earnings', kolController.getKOLEarnings);

export default router;

