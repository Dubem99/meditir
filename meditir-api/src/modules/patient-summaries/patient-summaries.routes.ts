import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../types/enums';
import * as controller from './patient-summaries.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/generate', requireRole(Role.DOCTOR), asyncHandler(controller.generate));
router.get('/session/:sessionId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.listBySession));
router.patch('/:id', requireRole(Role.DOCTOR), asyncHandler(controller.update));
router.delete('/:id', requireRole(Role.DOCTOR), asyncHandler(controller.remove));
router.post('/:id/send', requireRole(Role.DOCTOR), asyncHandler(controller.send));

export default router;
