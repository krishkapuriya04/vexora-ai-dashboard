import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireOrganization, requireManager } from '../middleware/organization.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.use(protect, requireOrganization);

router.get('/metrics', dashboardController.getMetrics);
router.post('/metrics', requireManager, dashboardController.updateMetrics);

export default router;
