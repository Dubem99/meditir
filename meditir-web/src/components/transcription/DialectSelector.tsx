'use client';

import type { Dialect } from '@/types/entities.types';

// Synthetic value used when the doctor wants automatic language detection
// instead of locking to a single dialect. Not a Prisma enum value — handled
// at the STT bridge layer (omits the language hint to OpenAI).
export const AUTO_DETECT = 'AUTO_DETECT' as const;
export type DialectChoice = Dialect | typeof AUTO_DETECT;

interface DialectOption {
  id: DialectChoice;
  name: string;
  description: string;
}

const OPTIONS: DialectOption[] = [
  {
    id: AUTO_DETECT,
    name: 'Auto-detect',
    description: 'Recognise and adapt to whichever language is spoken — best for code-switching visits',
  },
  {
    id: 'ENGLISH',
    name: 'English',
    description: 'Optimised for consultations conducted in English',
  },
  {
    id: 'PIDGIN',
    name: 'Pidgin',
    description: 'Optimised for consultations in Nigerian Pidgin',
  },
  {
    id: 'YORUBA_ACCENTED',
    name: 'Yoruba',
    description: 'Optimised for consultations primarily in Yoruba',
  },
  {
    id: 'HAUSA_ACCENTED',
    name: 'Hausa',
    description: 'Optimised for consultations primarily in Hausa',
  },
  {
    id: 'IGBO_ACCENTED',
    name: 'Igbo',
    description: 'Optimised for consultations primarily in Igbo',
  },
];

interface Props {
  value: DialectChoice;
  onChange: (dialect: DialectChoice) => void;
  disabled?: boolean;
}

const RadioDot = ({ active }: { active: boolean }) => (
  <span
    className={[
      'shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
      active ? 'border-gray-900' : 'border-gray-300',
    ].join(' ')}
    aria-hidden
  >
    {active && <span className="w-2 h-2 rounded-full bg-gray-900" />}
  </span>
);

export const DialectSelector = ({ value, onChange, disabled }: Props) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4">
    <p className="text-xs font-semibold text-gray-700 mb-3">Language</p>
    <div className="flex flex-col gap-1">
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => !disabled && onChange(opt.id)}
            disabled={disabled}
            className={[
              'flex items-start gap-3 text-left p-3 rounded-xl transition-colors',
              active ? 'bg-gray-50' : 'hover:bg-gray-50/60',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <RadioDot active={active} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{opt.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

export const dialectChoiceLabel = (d: DialectChoice): string => {
  const o = OPTIONS.find((x) => x.id === d);
  if (o) return o.name;
  // Legacy NIGERIAN_ENGLISH from older sessions — display as English.
  if (d === 'NIGERIAN_ENGLISH') return 'English';
  return 'Auto-detect';
};
