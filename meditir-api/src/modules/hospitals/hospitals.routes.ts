import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types/enums';
import { CreateHospitalSchema, UpdateHospitalSchema } from './hospitals.schema';
import * as controller from './hospitals.controller';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(Role.SUPER_ADMIN), validate(CreateHospitalSchema), asyncHandler(controller.create));
router.get('/', requireRole(Role.SUPER_ADMIN), asyncHandler(controller.list));
router.get('/:id', requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN), asyncHandler(controller.get));
router.patch('/:id', requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN), validate(UpdateHospitalSchema), asyncHandler(controller.update));
router.delete('/:id', requireRole(Role.SUPER_ADMIN), asyncHandler(controller.deactivate));
router.get('/:id/stats', requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN), asyncHandler(controller.stats));

export default router;
