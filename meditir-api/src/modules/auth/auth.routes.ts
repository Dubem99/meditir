import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { LoginSchema, RegisterHospitalSchema } from './auth.schema';
import * as controller from './auth.controller';

const router = Router();

router.post('/register', authLimiter, validate(RegisterHospitalSchema), asyncHandler(controller.register));
router.post('/login', authLimiter, validate(LoginSchema), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', authenticate, asyncHandler(controller.logout));

export default router;
