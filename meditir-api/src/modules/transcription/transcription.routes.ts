import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { uploadLimiter } from '../../middleware/rateLimit.middleware';
import { Role } from '../../types/enums';
import * as controller from './transcription.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

const router = Router();

router.use(authenticate, resolveTenant);

router.post(
  '/upload',
  uploadLimiter,
  requireRole(Role.DOCTOR),
  upload.single('audio'),
  asyncHandler(controller.uploadAndTranscribe)
);
router.get('/session/:sessionId', requireRole(Role.DOCTOR, Role.HOSPITAL_ADMIN), asyncHandler(controller.getTranscript));
router.post('/offline-sync', requireRole(Role.DOCTOR), asyncHandler(controller.offlineSync));

export default router;
