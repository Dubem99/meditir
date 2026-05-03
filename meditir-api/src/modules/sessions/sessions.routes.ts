import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types/enums';
import { CreateSessionSchema, UpdateSessionSchema } from './sessions.schema';
import * as controller from './sessions.controller';

const router = Router();

router.use(authenticate, resolveTenant);

// Static routes must come before /:id
router.get('/analytics', requireRole(Role.HOSPITAL_ADMIN), asyncHandler(controller.analytics));
router.get('/templates', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.listTemplates));

router.post('/', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), validate(CreateSessionSchema), asyncHandler(controller.create));
router.get('/', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.list));
router.get('/:id', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.PATIENT), asyncHandler(controller.get));
router.patch('/:id', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), validate(UpdateSessionSchema), asyncHandler(controller.update));
router.post('/:id/start', requireRole(Role.DOCTOR), asyncHandler(controller.start));
router.patch('/:id/template', requireRole(Role.DOCTOR), asyncHandler(controller.setTemplate));
router.post('/:id/end', requireRole(Role.DOCTOR), asyncHandler(controller.end));
router.post('/:id/handover', requireRole(Role.DOCTOR), asyncHandler(controller.handover));
router.delete('/:id', requireRole(Role.HOSPITAL_ADMIN), asyncHandler(controller.cancel));

export default router;
