import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError } from '../utils/AppError';

// System-level bearer token gate for audit routes. Compares against
// AUDIT_BEARER_TOKEN env var using a constant-time check. Returns 503 if
// the token isn't configured (so the routes are inert by default).
export const requireAuditBearer = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const expected = config.AUDIT_BEARER_TOKEN;
  if (!expected) {
    return next(new AppError('Audit endpoints disabled', 503));
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing bearer token', 401));
  }

  const provided = header.slice('Bearer '.length).trim();
  // Length-bias-safe equality. Both strings are static within a request, so a
  // simple length-then-loop comparison suffices.
  if (provided.length !== expected.length) {
    return next(new AppError('Invalid bearer token', 401));
  }
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return next(new AppError('Invalid bearer token', 401));
  }

  next();
};
