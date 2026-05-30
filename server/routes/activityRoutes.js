import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireOrganization } from '../middleware/organization.js';
import * as activityController from '../controllers/activityController.js';

const router = Router();

router.use(protect, requireOrganization);
router.get('/', activityController.listActivities);

export default router;
