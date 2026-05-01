'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import type {
  EhrExtractions,
  Problem,
  Order,
  BillingCode,
  CodeSystem,
  ProblemStatus,
  OrderStatus,
  NhiaTariffEntry,
} from '@/types/entities.types';

interface Props {
  sessionId: string;
  extractions: EhrExtractions;
  onChange: (next: EhrExtractions) => void;
  readOnly?: boolean;
}

const problemStatusStyle: Record<ProblemStatus, { pill: string; label: string }> = {
  ACTIVE: { pill: 'bg-red-100 text-red-700', label: 'Active' },
  CHRONIC: { pill: 'bg-purple-100 text-purple-700', label: 'Chronic' },
  RESOLVED: { pill: 'bg-green-100 text-green-700', label: 'Resolved' },
  RULE_OUT: { pill: 'bg-gray-100 text-gray-600', label: 'R/O' },
};

const orderStatusPill: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ORDERED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

// ─────────── Icons ───────────

const DiagnosisIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const PillIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 20.5L3.5 13.5a4.95 4.95 0 017-7l7 7a4.95 4.95 0 01-7 7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l7 7" />
  </svg>
);
const LabIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);
const ImagingIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ProcedureIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const ReferralIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const CodeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

// Groups orders by non-medication type
const NON_MED_TYPES = ['LAB', 'IMAGING', 'PROCEDURE', 'REFERRAL'] as const;
type NonMedType = (typeof NON_MED_TYPES)[number];

const nonMedMeta: Record<NonMedType, { label: string; icon: React.ReactNode; color: string }> = {
  LAB: { label: 'Lab', icon: <LabIcon />, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  IMAGING: { label: 'Imaging', icon: <ImagingIcon />, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  PROCEDURE: { label: 'Procedure', icon: <ProcedureIcon />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  REFERRAL: { label: 'Referral', icon: <ReferralIcon />, color: 'text-pink-600 bg-pink-50 border-pink-200' },
};

// ─────────── Section header helper ───────────

const SectionHeader = ({
  icon,
  title,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  accent: string;
}) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
    <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">
      {count}
    </span>
  </div>
);

// ─────────── NHIA helpers ───────────

const formatNgn = (n: number | null | undefined) =>
  n == null ? '' : `₦${n.toLocaleString('en-NG')}`;

const findNhiaCode = (codes: BillingCode[] | undefined): BillingCode | null =>
  (codes ?? []).find((c) => c.codeType === 'NHIA' && c.isSelected) ?? null;

const NhiaChip = ({
  code,
  onClick,
  onRemove,
  readOnly,
}: {
  code: BillingCode;
  onClick?: () => void;
  onRemove?: () => void;
  readOnly?: boolean;
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]',
      'bg-amber-50 border-amber-200 text-amber-900',
    ].join(' ')}
    title={code.description}
  >
    <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">NHIA</span>
    <span className="font-mono font-semibold">{code.code}</span>
    <span className="truncate max-w-[160px] text-amber-800">{code.description}</span>
    {code.tariffNgn != null && (
      <span className="font-semibold text-amber-900">{formatNgn(code.tariffNgn)}</span>
    )}
    {!readOnly && onClick && (
      <button
        onClick={onClick}
        className="text-[10px] text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline"
      >
        change
      </button>
    )}
    {!readOnly && onRemove && (
      <button
        onClick={onRemove}
        className="text-amber-400 hover:text-red-500 text-base leading-none ml-0.5"
        aria-label="Remove"
      >
        ×
      </button>
    )}
  </span>
);

const NhiaPickerDialog = ({
  catalog,
  onPick,
  onClose,
  catalogLoading,
}: {
  catalog: NhiaTariffEntry[];
  catalogLoading: boolean;
  onPick: (entry: NhiaTariffEntry) => void;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 100);
    return catalog
      .filter(
        (e) =>
          e.code.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
      .slice(0, 100);
  }, [catalog, query]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-gray-100">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NHIA tariff (code or description)…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-300"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {catalogLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading catalog…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No matches.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <li key={e.code}>
                  <button
                    onClick={() => onPick(e)}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-700">{e.code}</span>
                      {e.tariffNgn != null && (
                        <span className="text-xs font-semibold text-amber-700 ml-auto">{formatNgn(e.tariffNgn)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-2 border-t border-gray-100 text-right">
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────── Code picker (per-Problem) ───────────

const codeSystemMeta: Partial<Record<CodeSystem, { label: string }>> = {
  ICD10: { label: 'ICD-10' },
  SNOMED: { label: 'SNOMED' },
  NHIA: { label: 'NHIA' },
};

const PICKER_SYSTEMS: CodeSystem[] = ['ICD10', 'SNOMED'];

const AddCodeForm = ({
  system,
  onSubmit,
  onCancel,
}: {
  system: CodeSystem;
  onSubmit: (code: string, description: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!code.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(code.trim(), description.trim());
      setCode('');
      setDescription('');
    } catch {
      // error surfaced by parent via actionError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-emerald-50/40 border border-emerald-100 rounded-lg px-2 py-1.5">
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={system === 'SNOMED' ? '41582007' : 'J03.0'}
        className="font-mono text-[11px] bg-white border border-gray-200 rounded px-1.5 py-1 w-24 outline-none focus:border-emerald-300"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Description"
        className="text-[11px] bg-white border border-gray-200 rounded px-1.5 py-1 flex-1 min-w-[140px] outline-none focus:border-emerald-300"
      />
      <button
        onClick={submit}
        disabled={submitting || !code.trim() || !description.trim()}
        className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-40 px-2 py-1"
      >
        {submitting ? 'Saving…' : 'Save'}
      </button>
      <button
        onClick={onCancel}
        disabled={submitting}
        className="text-[11px] text-gray-400 hover:text-gray-600 px-1.5 py-1"
      >
        Cancel
      </button>
    </div>
  );
};

const CodePicker = ({
  problem,
  busyId,
  readOnly,
  onSelect,
  onAdd,
}: {
  problem: Problem;
  busyId: string | null;
  readOnly?: boolean;
  onSelect: (problemId: string, codeId: string, codeType: CodeSystem) => void;
  onAdd: (problemId: string, codeType: CodeSystem, code: string, description: string) => Promise<void>;
}) => {
  const [addingFor, setAddingFor] = useState<CodeSystem | null>(null);
  const codes = problem.billingCodes ?? [];

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      {PICKER_SYSTEMS.map((system) => {
        const systemCodes = codes.filter((c) => c.codeType === system);
        const meta = codeSystemMeta[system];
        const isAdding = addingFor === system;
        return (
          <div key={system} className="flex items-start gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1.5 w-14 shrink-0">
              {meta?.label}
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {systemCodes.map((c) => {
                const selected = c.isSelected;
                const disabled = readOnly || busyId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => !disabled && !selected && onSelect(problem.id, c.id, system)}
                    disabled={disabled || selected}
                    title={c.description}
                    className={[
                      'group inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-colors',
                      selected
                        ? 'bg-emerald-50 border-emerald-200 cursor-default'
                        : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer',
                      disabled && !selected ? 'opacity-50 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'font-mono text-[11px] font-semibold',
                        selected ? 'text-emerald-800' : 'text-gray-700',
                      ].join(' ')}
                    >
                      {c.code}
                    </span>
                    <span
                      className={[
                        'text-[11px] truncate max-w-[200px]',
                        selected ? 'text-emerald-700' : 'text-gray-500',
                      ].join(' ')}
                    >
                      {c.description}
                    </span>
                    {selected && (
                      <svg className="h-3 w-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
              {systemCodes.length === 0 && !isAdding && (
                <span className="text-[11px] text-gray-300 italic mt-1">No suggestions</span>
              )}
              {!readOnly && !isAdding && (
                <button
                  onClick={() => setAddingFor(system)}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 px-2 py-1 text-[11px] text-gray-500 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-sm leading-none">+</span> Add
                </button>
              )}
              {isAdding && (
                <AddCodeForm
                  system={system}
                  onSubmit={async (code, description) => {
                    await onAdd(problem.id, system, code, description);
                    setAddingFor(null);
                  }}
                  onCancel={() => setAddingFor(null)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────── Main component ───────────

export const ExtractionsPanel = ({ sessionId, extractions, onChange, readOnly }: Props) => {
  const [regenerating, setRegenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  // NHIA picker target: 'visit' | { kind: 'order', orderId: string } | null
  const [nhiaPickerTarget, setNhiaPickerTarget] =
    useState<{ kind: 'visit' } | { kind: 'order'; orderId: string } | null>(null);
  const [nhiaCatalog, setNhiaCatalog] = useState<NhiaTariffEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Fetch the NHIA catalog the first time the picker opens.
  useEffect(() => {
    if (nhiaPickerTarget && nhiaCatalog.length === 0 && !catalogLoading) {
      setCatalogLoading(true);
      api
        .get('/ehr-extractions/nhia-catalog')
        .then((r) => setNhiaCatalog(r.data.data ?? []))
        .finally(() => setCatalogLoading(false));
    }
  }, [nhiaPickerTarget, nhiaCatalog.length, catalogLoading]);

  const describeError = (err: unknown, action: string): string => {
    const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = e?.response?.status;
    const msg = e?.response?.data?.message || e?.message || 'Unknown error';
    if (status === 404) return `${action} — endpoint not found. The server may still be deploying.`;
    return `${action} failed (${status ?? 'network'}): ${msg}`;
  };

  const regenerate = async () => {
    setRegenerating(true);
    setActionError(null);
    try {
      await api.post(`/ehr-extractions/session/${sessionId}/regenerate`);
      const res = await api.get(`/ehr-extractions/session/${sessionId}`);
      onChange(res.data.data);
    } catch (err) {
      setActionError(describeError(err, 'Regenerate'));
    } finally {
      setRegenerating(false);
    }
  };

  const removeProblem = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await api.delete(`/ehr-extractions/problems/${id}`);
      onChange({ ...extractions, problems: extractions.problems.filter((p) => p.id !== id) });
    } catch (err) {
      setActionError(describeError(err, 'Remove problem'));
    } finally {
      setBusyId(null);
    }
  };

  const removeOrder = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await api.delete(`/ehr-extractions/orders/${id}`);
      onChange({ ...extractions, orders: extractions.orders.filter((o) => o.id !== id) });
    } catch (err) {
      setActionError(describeError(err, 'Remove order'));
    } finally {
      setBusyId(null);
    }
  };

  const removeBillingCode = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await api.delete(`/ehr-extractions/billing-codes/${id}`);
      onChange({ ...extractions, billingCodes: extractions.billingCodes.filter((c) => c.id !== id) });
    } catch (err) {
      setActionError(describeError(err, 'Remove billing code'));
    } finally {
      setBusyId(null);
    }
  };

  const selectCode = async (problemId: string, codeId: string, codeType: CodeSystem) => {
    setBusyId(codeId);
    setActionError(null);
    try {
      await api.patch(`/ehr-extractions/billing-codes/${codeId}`, { isSelected: true });
      onChange({
        ...extractions,
        problems: extractions.problems.map((p) => {
          if (p.id !== problemId) return p;
          const codes = (p.billingCodes ?? []).map((c) =>
            c.codeType === codeType ? { ...c, isSelected: c.id === codeId } : c
          );
          return { ...p, billingCodes: codes };
        }),
      });
    } catch (err) {
      setActionError(describeError(err, 'Select code'));
    } finally {
      setBusyId(null);
    }
  };

  const addCode = async (
    problemId: string,
    codeType: CodeSystem,
    code: string,
    description: string
  ) => {
    setActionError(null);
    try {
      const res = await api.post('/ehr-extractions/billing-codes', {
        problemId,
        codeType,
        code,
        description,
      });
      const created: BillingCode = res.data.data;
      onChange({
        ...extractions,
        problems: extractions.problems.map((p) => {
          if (p.id !== problemId) return p;
          const codes = (p.billingCodes ?? []).map((c) =>
            c.codeType === codeType ? { ...c, isSelected: false } : c
          );
          return { ...p, billingCodes: [...codes, created] };
        }),
      });
    } catch (err) {
      setActionError(describeError(err, 'Add code'));
      throw err;
    }
  };

  // NHIA pick: create a new BillingCode (DOCTOR_ADDED) attached to the chosen
  // scope and let the server auto-deselect siblings. Then update local state.
  const pickNhia = async (entry: NhiaTariffEntry) => {
    if (!nhiaPickerTarget) return;
    setActionError(null);
    try {
      const body = {
        codeType: 'NHIA',
        code: entry.code,
        description: entry.description,
        tariffNgn: entry.tariffNgn,
        ...(nhiaPickerTarget.kind === 'order'
          ? { orderId: nhiaPickerTarget.orderId }
          : { soapNoteId: extractions.soapNoteId }),
      };
      const res = await api.post('/ehr-extractions/billing-codes', body);
      const created: BillingCode = res.data.data;

      if (nhiaPickerTarget.kind === 'order') {
        const orderId = nhiaPickerTarget.orderId;
        onChange({
          ...extractions,
          orders: extractions.orders.map((o) => {
            if (o.id !== orderId) return o;
            const codes = (o.billingCodes ?? []).map((c) =>
              c.codeType === 'NHIA' ? { ...c, isSelected: false } : c
            );
            return { ...o, billingCodes: [...codes, created] };
          }),
        });
      } else {
        // Visit-level: replace any existing visit-level NHIA in extractions.billingCodes.
        const next = extractions.billingCodes
          .map((c) => (c.codeType === 'NHIA' ? { ...c, isSelected: false } : c))
          .concat(created);
        onChange({ ...extractions, billingCodes: next });
      }
      setNhiaPickerTarget(null);
    } catch (err) {
      setActionError(describeError(err, 'Set NHIA code'));
    }
  };

  const removeNhiaFromOrder = async (orderId: string, codeId: string) => {
    setBusyId(codeId);
    setActionError(null);
    try {
      await api.delete(`/ehr-extractions/billing-codes/${codeId}`);
      onChange({
        ...extractions,
        orders: extractions.orders.map((o) =>
          o.id === orderId
            ? { ...o, billingCodes: (o.billingCodes ?? []).filter((c) => c.id !== codeId) }
            : o
        ),
      });
    } catch (err) {
      setActionError(describeError(err, 'Remove NHIA code'));
    } finally {
      setBusyId(null);
    }
  };

  const removeVisitNhia = async (codeId: string) => {
    setBusyId(codeId);
    setActionError(null);
    try {
      await api.delete(`/ehr-extractions/billing-codes/${codeId}`);
      onChange({
        ...extractions,
        billingCodes: extractions.billingCodes.filter((c) => c.id !== codeId),
      });
    } catch (err) {
      setActionError(describeError(err, 'Remove NHIA code'));
    } finally {
      setBusyId(null);
    }
  };

  const updateProblemStatus = async (p: Problem, status: ProblemStatus) => {
    setBusyId(p.id);
    setActionError(null);
    try {
      const res = await api.patch(`/ehr-extractions/problems/${p.id}`, { status });
      onChange({ ...extractions, problems: extractions.problems.map((x) => (x.id === p.id ? res.data.data : x)) });
    } catch (err) {
      setActionError(describeError(err, 'Update problem'));
    } finally {
      setBusyId(null);
    }
  };

  const updateOrderStatus = async (o: Order, status: OrderStatus) => {
    setBusyId(o.id);
    setActionError(null);
    try {
      const res = await api.patch(`/ehr-extractions/orders/${o.id}`, { status });
      onChange({ ...extractions, orders: extractions.orders.map((x) => (x.id === o.id ? res.data.data : x)) });
    } catch (err) {
      setActionError(describeError(err, 'Update order'));
    } finally {
      setBusyId(null);
    }
  };

  const medications = extractions.orders.filter((o) => o.type === 'MEDICATION');
  const nonMedOrders = extractions.orders.filter((o) => o.type !== 'MEDICATION');
  const total =
    extractions.problems.length + extractions.orders.length + extractions.billingCodes.length;

  // Visit-level NHIA = consultation tariff. Lives in extractions.billingCodes
  // (problemId=null AND orderId=null) with codeType=NHIA.
  const visitNhia = extractions.billingCodes.find(
    (c) => c.codeType === 'NHIA' && c.isSelected
  );

  // Tally NHIA tariffs across visit + orders for a quick "claim total" preview.
  const claimTotal = [
    visitNhia?.tariffNgn ?? 0,
    ...extractions.orders.flatMap((o) =>
      (o.billingCodes ?? [])
        .filter((c) => c.codeType === 'NHIA' && c.isSelected)
        .map((c) => c.tariffNgn ?? 0)
    ),
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Something went wrong</p>
          <p className="text-xs text-red-700">{actionError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Diagnoses &amp; Orders</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {total === 0
              ? 'Nothing extracted yet'
              : `${total} item${total !== 1 ? 's' : ''} from this visit`}
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 print:hidden shrink-0"
          >
            {regenerating ? 'Re-extracting…' : 'Re-run extraction'}
          </button>
        )}
      </div>

      {/* NHIA visit-level + claim total */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            NHIA billing
          </span>
          {visitNhia ? (
            <NhiaChip
              code={visitNhia}
              onClick={!readOnly ? () => setNhiaPickerTarget({ kind: 'visit' }) : undefined}
              onRemove={!readOnly ? () => removeVisitNhia(visitNhia.id) : undefined}
              readOnly={readOnly}
            />
          ) : (
            !readOnly && (
              <button
                onClick={() => setNhiaPickerTarget({ kind: 'visit' })}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-amber-300 hover:border-amber-400 hover:bg-amber-100/50 px-2 py-1 text-[11px] text-amber-800 transition-colors"
              >
                <span className="text-sm leading-none">+</span> Add consultation tariff
              </button>
            )
          )}
          {claimTotal > 0 && (
            <span className="ml-auto text-xs text-amber-900">
              <span className="text-amber-600">Claim total:</span>{' '}
              <span className="font-semibold">{formatNgn(claimTotal)}</span>
            </span>
          )}
        </div>
      </section>

      {/* Diagnoses */}
      <section>
        <SectionHeader
          icon={<span className="text-red-600"><DiagnosisIcon /></span>}
          title="Diagnoses"
          count={extractions.problems.length}
          accent="bg-red-50 border border-red-100"
        />
        {extractions.problems.length === 0 ? (
          <p className="text-sm text-gray-400 pl-11">No diagnoses extracted.</p>
        ) : (
          <div className="space-y-2">
            {extractions.problems.map((p) => {
              const style = problemStatusStyle[p.status];
              return (
                <div
                  key={p.id}
                  className="border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${style.pill}`}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1 shrink-0 print:hidden">
                        <select
                          value={p.status}
                          onChange={(e) => updateProblemStatus(p, e.target.value as ProblemStatus)}
                          disabled={busyId === p.id}
                          className="text-[10px] bg-white border border-gray-200 rounded-lg px-1.5 py-1 cursor-pointer outline-none hover:border-gray-300"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="CHRONIC">Chronic</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="RULE_OUT">R/O</option>
                        </select>
                        <button
                          onClick={() => removeProblem(p.id)}
                          disabled={busyId === p.id}
                          className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors w-6 h-6 flex items-center justify-center"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <CodePicker
                    problem={p}
                    busyId={busyId}
                    readOnly={readOnly}
                    onSelect={selectCode}
                    onAdd={addCode}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Medications */}
      <section>
        <SectionHeader
          icon={<span className="text-blue-600"><PillIcon /></span>}
          title="Medications"
          count={medications.length}
          accent="bg-blue-50 border border-blue-100"
        />
        {medications.length === 0 ? (
          <p className="text-sm text-gray-400 pl-11">No medications prescribed.</p>
        ) : (
          <div className="space-y-2">
            {medications.map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 break-words">{o.name}</p>
                  {(o.dosage || o.frequency || o.duration) && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {o.dosage && (
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                          {o.dosage}
                        </span>
                      )}
                      {o.frequency && (
                        <span className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                          {o.frequency}
                        </span>
                      )}
                      {o.duration && (
                        <span className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                          for {o.duration}
                        </span>
                      )}
                    </div>
                  )}
                  {o.instructions && (
                    <p className="text-xs text-gray-500 mt-1.5 italic break-words">{o.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start">
                  {!readOnly ? (
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o, e.target.value as OrderStatus)}
                      disabled={busyId === o.id}
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 border-0 cursor-pointer outline-none ${orderStatusPill[o.status]} print:hidden`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ORDERED">Ordered</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${orderStatusPill[o.status]}`}>
                      {o.status}
                    </span>
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => removeOrder(o.id)}
                      disabled={busyId === o.id}
                      className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors w-6 h-6 flex items-center justify-center print:hidden"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Labs, Imaging, Procedures, Referrals */}
      <section>
        <SectionHeader
          icon={<span className="text-teal-600"><LabIcon /></span>}
          title="Labs, Imaging & Referrals"
          count={nonMedOrders.length}
          accent="bg-teal-50 border border-teal-100"
        />
        {nonMedOrders.length === 0 ? (
          <p className="text-sm text-gray-400 pl-11">No labs, imaging, or referrals ordered.</p>
        ) : (
          <div className="space-y-2">
            {nonMedOrders.map((o) => {
              const meta = nonMedMeta[o.type as NonMedType];
              const orderNhia = findNhiaCode(o.billingCodes);
              const isReferral = o.type === 'REFERRAL';
              return (
                <div
                  key={o.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 break-words mt-0.5">{o.name}</p>
                      {o.instructions && (
                        <p className="text-xs text-gray-500 mt-0.5 italic break-words">{o.instructions}</p>
                      )}
                      {!isReferral && (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {orderNhia ? (
                            <NhiaChip
                              code={orderNhia}
                              onClick={!readOnly ? () => setNhiaPickerTarget({ kind: 'order', orderId: o.id }) : undefined}
                              onRemove={!readOnly ? () => removeNhiaFromOrder(o.id, orderNhia.id) : undefined}
                              readOnly={readOnly}
                            />
                          ) : (
                            !readOnly && (
                              <button
                                onClick={() => setNhiaPickerTarget({ kind: 'order', orderId: o.id })}
                                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 px-2 py-1 text-[11px] text-amber-700 transition-colors"
                              >
                                <span className="text-sm leading-none">+</span> NHIA tariff
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start">
                    {!readOnly ? (
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o, e.target.value as OrderStatus)}
                        disabled={busyId === o.id}
                        className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 border-0 cursor-pointer outline-none ${orderStatusPill[o.status]} print:hidden`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${orderStatusPill[o.status]}`}>
                        {o.status}
                      </span>
                    )}
                    {!readOnly && (
                      <button
                        onClick={() => removeOrder(o.id)}
                        disabled={busyId === o.id}
                        className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors w-6 h-6 flex items-center justify-center print:hidden"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Visit-level non-NHIA codes (CPT etc.) — collapsible, secondary */}
      {extractions.billingCodes.filter((c) => c.codeType !== 'NHIA').length > 0 && (
        <section className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowCodes(!showCodes)}
            className="flex items-center gap-2.5 w-full group print:hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <span className="text-gray-500"><CodeIcon /></span>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
              Visit-level codes
            </span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">
              {extractions.billingCodes.filter((c) => c.codeType !== 'NHIA').length}
            </span>
            <svg
              className={`h-4 w-4 text-gray-400 ml-auto transition-transform ${showCodes ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCodes && (
            <div className="mt-3 space-y-2">
              {extractions.billingCodes.filter((c) => c.codeType !== 'NHIA').map((c: BillingCode) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {c.codeType}
                      </span>
                      <span className="font-mono text-xs font-semibold text-gray-900">{c.code}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 break-words">{c.description}</p>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => removeBillingCode(c.id)}
                      disabled={busyId === c.id}
                      className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors shrink-0 w-6 h-6 flex items-center justify-center print:hidden"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {nhiaPickerTarget && (
        <NhiaPickerDialog
          catalog={nhiaCatalog}
          catalogLoading={catalogLoading}
          onPick={pickNhia}
          onClose={() => setNhiaPickerTarget(null)}
        />
      )}
    </div>
  );
};
