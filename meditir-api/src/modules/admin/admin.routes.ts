import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../types/enums';
import * as controller from './admin.controller';

const router = Router();

router.use(authenticate);

// Admin profile (own hospital admin)
router.get('/profile', requireRole(Role.HOSPITAL_ADMIN), asyncHandler(controller.getProfile));
router.patch('/profile', requireRole(Role.HOSPITAL_ADMIN), asyncHandler(controller.updateProfile));

// SuperAdmin only
router.get('/users', requireRole(Role.SUPER_ADMIN), asyncHandler(controller.listUsers));
router.patch('/users/:id/toggle', requireRole(Role.SUPER_ADMIN), asyncHandler(controller.toggleUser));
router.get('/audit-logs', requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN), resolveTenant, asyncHandler(controller.getAuditLogs));

export default router;
