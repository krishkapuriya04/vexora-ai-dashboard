import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireOrganization } from '../middleware/organization.js';
import * as exportController from '../controllers/exportController.js';

const router = Router();

router.use(protect, requireOrganization);

router.get('/pdf', exportController.exportPdf);
router.get('/csv', exportController.exportCsv);
router.get('/excel', exportController.exportExcel);

export default router;
