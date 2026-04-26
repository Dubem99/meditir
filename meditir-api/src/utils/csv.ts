import Papa from 'papaparse';
import { randomBytes } from 'crypto';
import { AppError } from './AppError';

const MAX_ROWS = 1000;

export interface BulkRowResult {
  row: number;
  email: string;
  status: 'success' | 'error';
  id?: string;
  error?: string;
  generatedPassword?: string;
}

export interface BulkResult {
  totalRows: number;
  successful: number;
  failed: number;
  results: BulkRowResult[];
}

export const parseCsvBuffer = (buffer: Buffer): Record<string, string>[] => {
  const text = buffer.toString('utf8').replace(/^﻿/, '');
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  });

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new AppError(`CSV parse error on row ${first.row ?? '?'}: ${first.message}`, 400);
  }
  if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
    throw new AppError('CSV is empty or has no data rows', 400);
  }
  if (parsed.data.length > MAX_ROWS) {
    throw new AppError(`CSV exceeds maximum of ${MAX_ROWS} rows`, 400);
  }
  return parsed.data;
};

// Convert "" / "  " to undefined so optional Zod fields don't fail on empty strings.
export const cleanRow = (row: Record<string, string>): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined || v === null) continue;
    const trimmed = String(v).trim();
    out[k] = trimmed === '' ? undefined : trimmed;
  }
  return out;
};

// Split a CSV cell of semicolon- or comma-separated values into a string array.
// Returns undefined when the cell is blank, so optional array fields stay optional.
export const splitList = (v: string | undefined): string[] | undefined => {
  if (!v) return undefined;
  return v
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

// 16-char hex temp password — meets the 8-char min and is high-entropy enough
// for a single-use credential that's emailed to the recipient.
export const generateTempPassword = (): string => randomBytes(8).toString('hex');
