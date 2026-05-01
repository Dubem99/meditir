import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../types/enums';
import * as controller from './ehr-extractions.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/session/:sessionId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.getBySession));
router.post('/session/:sessionId/regenerate', requireRole(Role.DOCTOR), asyncHandler(controller.regenerate));

router.post('/problems', requireRole(Role.DOCTOR), asyncHandler(controller.createProblem));
router.patch('/problems/:id', requireRole(Role.DOCTOR), asyncHandler(controller.patchProblem));
router.delete('/problems/:id', requireRole(Role.DOCTOR), asyncHandler(controller.removeProblem));

router.patch('/orders/:id', requireRole(Role.DOCTOR), asyncHandler(controller.patchOrder));
router.delete('/orders/:id', requireRole(Role.DOCTOR), asyncHandler(controller.removeOrder));

router.post('/billing-codes', requireRole(Role.DOCTOR), asyncHandler(controller.createBillingCode));
router.patch('/billing-codes/:id', requireRole(Role.DOCTOR), asyncHandler(controller.patchBillingCode));
router.delete('/billing-codes/:id', requireRole(Role.DOCTOR), asyncHandler(controller.removeBillingCode));

export default router;
