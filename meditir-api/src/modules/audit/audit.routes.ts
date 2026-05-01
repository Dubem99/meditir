import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuditBearer } from '../../middleware/auditAuth.middleware';
import * as controller from './audit.controller';

const router = Router();

// All audit routes are gated by AUDIT_BEARER_TOKEN. They are NOT under the
// normal user JWT auth — these are system endpoints called by the weekly
// audit routine, not by humans.
router.use(requireAuditBearer);

router.get('/nhia-codes', asyncHandler(controller.getNhiaAudit));

export default router;
