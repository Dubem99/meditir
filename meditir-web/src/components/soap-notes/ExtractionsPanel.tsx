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

const problemStatusColor: Record<ProblemStatus, string> = {
  ACTIVE: 'bg-red-50 text-red-700 border-red-200',
  CHRONIC: 'bg-purple-50 text-purple-700 border-purple-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  RULE_OUT: 'bg-gray-50 text-gray-600 border-gray-200',
};

const orderTypeColor: Record<Order['type'], string> = {
  MEDICATION: 'bg-blue-50 text-blue-700 border-blue-200',
  LAB: 'bg-teal-50 text-teal-700 border-teal-200',
  IMAGING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PROCEDURE: 'bg-amber-50 text-amber-700 border-amber-200',
  REFERRAL: 'bg-pink-50 text-pink-700 border-pink-200',
};

const orderStatusColor: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ORDERED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-400 line-through',
};

export const ExtractionsPanel = ({ sessionId, extractions, onChange, readOnly }: Props) => {
  const [regenerating, setRegenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
      setActionError(describeError(err, 'Regenerate extractions'));
    } finally {
      setRegenerating(false);
    }
  };

  const removeProblem = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/ehr-extractions/problems/${id}`);
      onChange({ ...extractions, problems: extractions.problems.filter((p) => p.id !== id) });
    } finally {
      setBusyId(null);
    }
  };

  const removeOrder = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/ehr-extractions/orders/${id}`);
      onChange({ ...extractions, orders: extractions.orders.filter((o) => o.id !== id) });
    } finally {
      setBusyId(null);
    }
  };

  const removeBillingCode = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/ehr-extractions/billing-codes/${id}`);
      onChange({ ...extractions, billingCodes: extractions.billingCodes.filter((c) => c.id !== id) });
    } finally {
      setBusyId(null);
    }
  };

  const updateProblemStatus = async (p: Problem, status: ProblemStatus) => {
    setBusyId(p.id);
    try {
      const res = await api.patch(`/ehr-extractions/problems/${p.id}`, { status });
      onChange({
        ...extractions,
        problems: extractions.problems.map((x) => (x.id === p.id ? res.data.data : x)),
      });
    } finally {
      setBusyId(null);
    }
  };

  const updateOrderStatus = async (o: Order, status: OrderStatus) => {
    setBusyId(o.id);
    try {
      const res = await api.patch(`/ehr-extractions/orders/${o.id}`, { status });
      onChange({
        ...extractions,
        orders: extractions.orders.map((x) => (x.id === o.id ? res.data.data : x)),
      });
    } finally {
      setBusyId(null);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Structured Data</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {total === 0 ? 'No items extracted yet' : `${total} item${total !== 1 ? 's' : ''} extracted from this note`}
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 print:hidden"
          >
            {regenerating ? 'Re-extracting…' : 'Re-run extraction'}
          </button>
        )}
      </div>

      {/* Problems */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Problems · Diagnoses
        </h4>
        {extractions.problems.length === 0 ? (
          <p className="text-sm text-gray-400">None extracted.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {extractions.problems.map((p) => (
              <div
                key={p.id}
                className={`flex items-start gap-2 border rounded-2xl px-3 py-2 text-sm w-full sm:w-auto sm:max-w-full ${problemStatusColor[p.status]}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium break-words">{p.name}</span>
                    {p.icd10Code && (
                      <span className="font-mono text-xs opacity-70 shrink-0">{p.icd10Code}</span>
                    )}
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-1 shrink-0 print:hidden">
                    <select
                      value={p.status}
                      onChange={(e) => updateProblemStatus(p, e.target.value as ProblemStatus)}
                      disabled={busyId === p.id}
                      className="text-[10px] bg-transparent border border-current/20 rounded px-1 py-0.5 cursor-pointer outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CHRONIC">Chronic</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="RULE_OUT">R/O</option>
                    </select>
                    <button
                      onClick={() => removeProblem(p.id)}
                      disabled={busyId === p.id}
                      className="hover:bg-white/50 rounded-full w-5 h-5 flex items-center justify-center text-sm leading-none transition-colors"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Orders · Medications · Labs
        </h4>
        {extractions.orders.length === 0 ? (
          <p className="text-sm text-gray-400">None extracted.</p>
        ) : (
          <div className="space-y-2">
            {extractions.orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 border border-gray-200 rounded-xl p-3 bg-white"
              >
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${orderTypeColor[o.type]}`}
                  >
                    {o.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">{o.name}</p>
                    {(o.dosage || o.frequency || o.duration) && (
                      <p className="text-xs text-gray-500 mt-0.5 break-words">
                        {[o.dosage, o.frequency, o.duration].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {o.instructions && (
                      <p className="text-xs text-gray-400 mt-0.5 italic break-words">{o.instructions}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {!readOnly ? (
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o, e.target.value as OrderStatus)}
                      disabled={busyId === o.id}
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 border-0 cursor-pointer outline-none ${orderStatusColor[o.status]} print:hidden`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ORDERED">Ordered</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 ${orderStatusColor[o.status]}`}
                    >
                      {o.status}
                    </span>
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => removeOrder(o.id)}
                      disabled={busyId === o.id}
                      className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors print:hidden"
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

      {/* Billing codes */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Billing Codes
        </h4>
        {extractions.billingCodes.length === 0 ? (
          <p className="text-sm text-gray-400">None extracted.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {extractions.billingCodes.map((c: BillingCode) => (
              <div
                key={c.id}
                className="flex items-start gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2 w-full sm:w-auto sm:max-w-full"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">
                      {c.codeType}
                    </span>
                    <span className="font-mono text-xs font-semibold text-gray-900 shrink-0">{c.code}</span>
                    <span className="text-xs text-gray-600 break-words">{c.description}</span>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => removeBillingCode(c.id)}
                    disabled={busyId === c.id}
                    className="text-gray-300 hover:text-red-500 text-base leading-none transition-colors shrink-0 print:hidden"
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
    </div>
  );
};
