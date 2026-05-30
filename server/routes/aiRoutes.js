import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireOrganization } from '../middleware/organization.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();
const aiRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.use(protect, requireOrganization, aiRateLimit);

router.post('/generate-summary', aiController.generateSummary);
router.post('/generate-recommendations', aiController.generateRecommendations);
router.post('/generate-risk-analysis', aiController.generateRiskAnalysis);
router.post('/generate-forecast', aiController.generateForecast);
router.get('/history', aiController.getHistory);

export default router;
