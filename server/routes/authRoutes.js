import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { requireDB } from '../middleware/db.js';
import { requireOrganization, requireManager } from '../middleware/organization.js';
import { validateRequest } from '../middleware/validate.js';
import { registerValidation, loginValidation } from '../middleware/validators.js';

const router = Router();

router.use(requireDB);

router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);
router.patch('/organization', protect, requireOrganization, requireManager, authController.updateOrganization);

export default router;
