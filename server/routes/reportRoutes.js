import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireOrganization, requireManager } from '../middleware/organization.js';
import { validateRequest } from '../middleware/validate.js';
import { REPORT_CATEGORIES } from '../models/Report.js';
import * as reportController from '../controllers/reportController.js';

const router = Router();

const reportValidation = [
  body('title').trim().notEmpty().withMessage('Report title is required'),
  body('category').optional().isIn(REPORT_CATEGORIES).withMessage('Invalid report category'),
];

router.use(protect, requireOrganization);

router.get('/', reportController.listReports);
router.get('/:id', reportController.getReport);
router.post('/', requireManager, reportValidation, validateRequest, reportController.createReport);
router.patch('/:id', requireManager, reportController.updateReport);
router.delete('/:id', requireManager, reportController.deleteReport);

export default router;
