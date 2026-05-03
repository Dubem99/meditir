import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { audioChunkUpload } from '../../middleware/upload.middleware';
import { Role } from '../../types/enums';
import * as controller from './transcription.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/segment', requireRole(Role.DOCTOR), asyncHandler(controller.saveSegment));
router.post('/stream', requireRole(Role.DOCTOR), audioChunkUpload, asyncHandler(controller.streamTranscribe));
router.patch('/:id', requireRole(Role.DOCTOR), asyncHandler(controller.editSegment));
router.get('/session/:sessionId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.getTranscript));
router.post('/offline-sync', requireRole(Role.DOCTOR), asyncHandler(controller.offlineSync));

export default router;
