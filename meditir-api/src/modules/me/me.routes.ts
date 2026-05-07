import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import * as controller from './me.controller';

const router = Router();

// All /me routes require auth. No role gate — every authenticated user
// reads + updates their own profile here. Tenant resolution is intentionally
// skipped: the user is identified by req.user.id from the JWT, not by the
// hospital slug header (a SUPER_ADMIN with no hospital still needs a profile).
router.use(authenticate);

router.get('/profile', asyncHandler(controller.get));
router.patch('/profile', asyncHandler(controller.update));
router.post('/password', asyncHandler(controller.changePassword));

export default router;
