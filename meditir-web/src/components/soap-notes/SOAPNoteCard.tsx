'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, noteStatusBadge } from '@/components/ui/Badge';
import type { SOAPNote } from '@/types/entities.types';

interface Props {
  note: SOAPNote;
  showActions?: boolean;
  onEdit?: () => void;
  onFinalize?: () => void;
}

const SOAP_SECTIONS = [
  { key: 'subjective', label: 'Subjective', icon: '💬', description: 'Patient-reported symptoms' },
  { key: 'objective', label: 'Objective', icon: '🔬', description: 'Clinical observations' },
  { key: 'assessment', label: 'Assessment', icon: '🩺', description: 'Diagnosis' },
  { key: 'plan', label: 'Plan', icon: '📋', description: 'Treatment plan' },
] as const;

export const SOAPNoteCard = ({ note, showActions, onEdit, onFinalize }: Props) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">SOAP Note</h3>
        <p className="text-xs text-gray-500">
          Generated {new Date(note.createdAt).toLocaleDateString()} · {note.aiModel}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={noteStatusBadge(note.status)}>
          {note.status.replace('_', ' ')}
        </Badge>
        {note.doctorSignedAt && (
          <span className="text-xs text-green-600 font-medium">
            Signed {new Date(note.doctorSignedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>

    {SOAP_SECTIONS.map(({ key, label, icon, description }) => (
      <Card key={key} padding="sm" className="border-l-4 border-l-primary-400">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{icon}</span>
          <div>
            <span className="text-sm font-semibold text-gray-900">{label}</span>
            <span className="text-xs text-gray-500 ml-2">{description}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {note[key as keyof typeof note] as string}
        </p>
      </Card>
    ))}

    {showActions && note.status !== 'FINALIZED' && (
      <div className="flex gap-3">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            Edit Note
          </button>
        )}
        {onFinalize && (
          <button
            onClick={onFinalize}
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            Finalize & Sign
          </button>
        )}
      </div>
    )}
  </div>
);
