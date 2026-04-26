import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { csvUpload } from '../../middleware/upload.middleware';
import { Role } from '../../types/enums';
import { RegisterPatientSchema, UpdatePatientSchema } from './patients.schema';
import * as controller from './patients.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), validate(RegisterPatientSchema), asyncHandler(controller.register));
router.post('/bulk', requireRole(Role.HOSPITAL_ADMIN), csvUpload, asyncHandler(controller.bulkRegister));
router.get('/', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), asyncHandler(controller.list));
router.get('/:id', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.PATIENT), asyncHandler(controller.get));
router.patch('/:id', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.PATIENT), validate(UpdatePatientSchema), asyncHandler(controller.update));
router.get('/:id/sessions', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.PATIENT), asyncHandler(controller.getSessions));
router.get('/:id/notes', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.PATIENT), asyncHandler(controller.getNotes));
router.get('/:id/timeline', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), asyncHandler(controller.getTimeline));

export default router;
