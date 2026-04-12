'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type {
  EhrExtractions,
  Problem,
  Order,
  BillingCode,
  ProblemStatus,
  OrderStatus,
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

// ─────────── Main component ───────────

export const ExtractionsPanel = ({ sessionId, extractions, onChange, readOnly }: Props) => {
  const [regenerating, setRegenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);

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
                  className="flex items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${style.pill}`}>
                        {style.label}
                      </span>
                      {p.icd10Code && (
                        <span className="font-mono text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                          {p.icd10Code}
                        </span>
                      )}
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

      {/* Billing Codes — collapsible, secondary */}
      {extractions.billingCodes.length > 0 && (
        <section className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowCodes(!showCodes)}
            className="flex items-center gap-2.5 w-full group print:hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <span className="text-gray-500"><CodeIcon /></span>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
              Billing codes
            </span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">
              {extractions.billingCodes.length}
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
              {extractions.billingCodes.map((c: BillingCode) => (
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
    </div>
  );
};
