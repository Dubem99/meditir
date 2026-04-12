import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../types/enums';
import * as controller from './messages.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/colleagues', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.listColleagues));
router.get('/conversations', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.listConversations));
router.get('/conversations/:conversationId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.listMessages));
router.post('/conversations/:conversationId/read', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.markRead));
router.post('/', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.sendMessage));
router.get('/unread-count', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.unreadCount));

export default router;
