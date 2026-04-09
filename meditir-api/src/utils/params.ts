import { Request } from 'express';
import { AppError } from './AppError';

/** Extract a string param from req.params, handling Express 5's string | string[] type. */
export const param = (req: Request, name: string): string => {
  const val = req.params[name];
  if (!val) throw new AppError(`Missing route parameter: ${name}`, 400);
  return Array.isArray(val) ? val[0] : val;
};

/** Extract hospitalId from request (set by tenant middleware or user context). */
export const hospitalId = (req: Request): string => {
  const id = req.hospitalId ?? req.user?.hospitalId;
  if (!id) throw new AppError('Hospital context required', 400);
  return id;
};
