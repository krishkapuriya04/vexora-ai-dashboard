import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { registerValidation, loginValidation } from '../middleware/validators.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);

export default router;
