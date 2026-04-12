import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../types/enums';
import * as controller from './note-chat.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/session/:sessionId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.list));
router.post('/session/:sessionId', requireRole(Role.DOCTOR), asyncHandler(controller.send));
router.delete('/session/:sessionId', requireRole(Role.DOCTOR), asyncHandler(controller.clear));

export default router;
