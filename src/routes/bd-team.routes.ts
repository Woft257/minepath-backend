import { Router } from 'express';
import { BDTeamController } from '../controllers/bd-team.controller';

const router = Router();
const bdTeamController = new BDTeamController();

// GET /api/stats/bd-team - Get all BD team members
router.get('/', bdTeamController.getAllBDMembers);

// GET /api/stats/bd-team/:uuid - Get BD member by ID
router.get('/:uuid', bdTeamController.getBDMemberById);

// GET /api/stats/bd-team/:uuid/kols - Get managed KOLs
router.get('/:uuid/kols', bdTeamController.getManagedKOLs);

// GET /api/stats/bd-team/:uuid/performance - Get BD performance
router.get('/:uuid/performance', bdTeamController.getBDPerformance);

export default router;

