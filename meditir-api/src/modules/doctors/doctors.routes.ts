import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { csvUpload } from '../../middleware/upload.middleware';
import { Role } from '../../types/enums';
import { OnboardDoctorSchema, UpdateDoctorSchema, UpdateScheduleSchema } from './doctors.schema';
import * as controller from './doctors.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/', requireRole(Role.HOSPITAL_ADMIN), validate(OnboardDoctorSchema), asyncHandler(controller.onboard));
router.post('/bulk', requireRole(Role.HOSPITAL_ADMIN), csvUpload, asyncHandler(controller.bulkOnboard));
router.get('/', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), asyncHandler(controller.list));
router.get('/:id', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), asyncHandler(controller.get));
router.patch('/:id', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), validate(UpdateDoctorSchema), asyncHandler(controller.update));
router.delete('/:id', requireRole(Role.HOSPITAL_ADMIN), asyncHandler(controller.deactivate));
router.get('/:id/schedule', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), asyncHandler(controller.getSchedule));
router.put('/:id/schedule', requireRole(Role.HOSPITAL_ADMIN, Role.DOCTOR), validate(UpdateScheduleSchema), asyncHandler(controller.updateSchedule));

export default router;
