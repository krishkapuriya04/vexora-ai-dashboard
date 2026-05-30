import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrManager, requireWriteAccess } from '../middleware/role.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(protect, requireAdminOrManager);

router.get('/stats', adminController.getStats);
router.get('/audit-logs', adminController.getAuditLogs);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', requireWriteAccess, adminController.updateUser);
router.delete('/users/:id', requireWriteAccess, adminController.deleteUser);

router.get('/organizations', adminController.listOrganizations);
router.get('/organizations/:id', adminController.getOrganization);
router.post('/organizations', requireAdmin, requireWriteAccess, adminController.createOrganization);
router.patch('/organizations/:id', requireWriteAccess, adminController.updateOrganization);

export default router;
