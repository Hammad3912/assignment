import { Router } from 'express';
import { DealController } from '../controllers/dealController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { UserRole } from '../utils/enums';

const dealController = new DealController();
const router = Router();

// Deal registration by partner
router.post('/', authMiddleware, roleMiddleware(UserRole.PARTNER, UserRole.ADMIN), (req, res) =>
	dealController.createDeal(req, res),
);

// Approve deal (admin only)
router.put('/:dealId/approve', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) =>
	dealController.approveDeal(req, res),
);

export default router;
