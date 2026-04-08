import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { Role } from '../../types/enums';
import * as controller from './tts.controller';

const router = Router();

router.use(authenticate);

router.post('/generate', requireRole(Role.DOCTOR, Role.PATIENT, Role.HOSPITAL_ADMIN), asyncHandler(controller.generate));

export default router;
