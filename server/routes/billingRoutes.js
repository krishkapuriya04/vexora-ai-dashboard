import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireOrganization, requireManager } from '../middleware/organization.js';
import * as billingController from '../controllers/billingController.js';

const router = Router();

router.get('/plans', protect, billingController.getPlans);

router.use(protect, requireOrganization);

router.get('/subscription', billingController.getSubscription);
router.get('/history', billingController.getHistory);
router.post('/create-order', requireManager, billingController.createOrder);
router.post('/verify-payment', requireManager, billingController.verifyPayment);

export default router;
