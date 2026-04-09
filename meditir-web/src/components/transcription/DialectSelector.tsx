'use client';

import type { Dialect } from '@/types/entities.types';

const DIALECT_LABELS: Record<Dialect, string> = {
  NIGERIAN_ENGLISH: 'Nigerian English',
  YORUBA_ACCENTED: 'Yoruba-Accented English',
  HAUSA_ACCENTED: 'Hausa-Accented English',
  IGBO_ACCENTED: 'Igbo-Accented English',
};

interface Props {
  value: Dialect;
  onChange: (dialect: Dialect) => void;
  disabled?: boolean;
}

export const DialectSelector = ({ value, onChange, disabled }: Props) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
      Dialect / Accent
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Dialect)}
      disabled={disabled}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {(Object.keys(DIALECT_LABELS) as Dialect[]).map((d) => (
        <option key={d} value={d}>
          {DIALECT_LABELS[d]}
        </option>
      ))}
    </select>
  </div>
);
