import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { AppError } from '../utils/AppError';

const MAX_CSV_BYTES = 5 * 1024 * 1024;

const handler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CSV_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const isCsvName = name.endsWith('.csv');
    const isCsvMime =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/csv' ||
      file.mimetype === 'text/plain';
    if (!isCsvName || !isCsvMime) {
      return cb(new AppError('Upload must be a .csv file', 400));
    }
    cb(null, true);
  },
}).single('file');

// Wraps multer to convert its raw errors (LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE)
// into AppErrors so the global error handler returns a meaningful 400/413 instead
// of a generic 500.
export const csvUpload = (req: Request, res: Response, next: NextFunction): void => {
  handler(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`File exceeds ${MAX_CSV_BYTES / 1024 / 1024} MB limit`, 413));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Unexpected upload field — use form field "file"', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    next(err as Error);
  });
};
