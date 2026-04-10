import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types/enums';
import { GenerateSOAPSchema, UpdateSOAPSchema } from './soap-notes.schema';
import * as controller from './soap-notes.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/generate', requireRole(Role.DOCTOR), validate(GenerateSOAPSchema), asyncHandler(controller.generate));
router.get('/my-notes', requireRole(Role.PATIENT), asyncHandler(controller.listMyNotes));
router.get('/:id', requireRole(Role.DOCTOR, Role.PATIENT, Role.HOSPITAL_ADMIN), asyncHandler(controller.get));
router.patch('/:id', requireRole(Role.DOCTOR), validate(UpdateSOAPSchema), asyncHandler(controller.update));
router.post('/:id/finalize', requireRole(Role.DOCTOR), asyncHandler(controller.finalize));
router.get('/:id/tts', requireRole(Role.DOCTOR, Role.PATIENT), asyncHandler(controller.getTTS));

export default router;
