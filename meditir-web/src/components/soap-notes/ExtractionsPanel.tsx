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

  const regenerate = async () => {
    setRegenerating(true);
    try {
      await api.post(`/ehr-extractions/session/${sessionId}/regenerate`);
      const res = await api.get(`/ehr-extractions/session/${sessionId}`);
      onChange(res.data.data);
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
                className={`group flex items-center gap-2 border rounded-full pl-3 pr-2 py-1 text-sm ${problemStatusColor[p.status]}`}
              >
                <span className="font-medium">{p.name}</span>
                {p.icd10Code && <span className="font-mono text-xs opacity-70">{p.icd10Code}</span>}
                {!readOnly && (
                  <>
                    <select
                      value={p.status}
                      onChange={(e) => updateProblemStatus(p, e.target.value as ProblemStatus)}
                      disabled={busyId === p.id}
                      className="text-[10px] bg-transparent border-l border-current/20 pl-1.5 cursor-pointer outline-none print:hidden"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CHRONIC">Chronic</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="RULE_OUT">R/O</option>
                    </select>
                    <button
                      onClick={() => removeProblem(p.id)}
                      disabled={busyId === p.id}
                      className="opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded-full w-4 h-4 flex items-center justify-center text-xs transition-opacity print:hidden"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </>
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
                className="group flex items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white"
              >
                <span
                  className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${orderTypeColor[o.type]}`}
                >
                  {o.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{o.name}</p>
                  {(o.dosage || o.frequency || o.duration) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[o.dosage, o.frequency, o.duration].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {o.instructions && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{o.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-lg leading-none transition-opacity print:hidden"
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
                className="group flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-2.5 py-1.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {c.codeType}
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900">{c.code}</span>
                <span className="text-xs text-gray-600">{c.description}</span>
                {!readOnly && (
                  <button
                    onClick={() => removeBillingCode(c.id)}
                    disabled={busyId === c.id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-sm leading-none transition-opacity print:hidden"
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
