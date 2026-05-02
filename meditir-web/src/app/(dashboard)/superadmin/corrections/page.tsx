'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

interface Analytics {
  windowDays: number;
  generatedAt: string;
  totalCorrections: number;
  byKind: Record<string, number>;
  byArtifactType: Record<string, number>;
  bySoapField: Record<string, number>;
  byBillingCodeType: Record<string, number>;
  weeklyTrend: { week: string; count: number }[];
  perHospitalAnonymized: { label: string; count: number }[];
  insights: {
    estimatedAccuracy: number | null;
    aiRejectionRate: number | null;
    manualAddRate: number | null;
    swapRate: number | null;
  };
}

const WINDOW_OPTIONS = [7, 30, 90];

const KIND_LABELS: Record<string, string> = {
  EDIT: 'Edited',
  REJECT_AI: 'Rejected AI',
  MANUAL_ADD: 'Manually added',
  CODE_SWAP: 'Swapped code',
  STATUS_CHANGE: 'Status change',
};

const ARTIFACT_LABELS: Record<string, string> = {
  SOAP_SECTION: 'SOAP sections',
  PROBLEM: 'Diagnoses',
  ORDER: 'Orders',
  BILLING_CODE: 'Billing codes',
};

const fmtPercent = (n: number | null) =>
  n == null ? '—' : `${(n * 100).toFixed(1)}%`;

export default function CorrectionsAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/admin/analytics/corrections?days=${days}`)
      .then((r) => setData(r.data.data))
      .catch((err) => {
        const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        setError(e?.response?.data?.message || e?.message || 'Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, [days]);

  const maxWeeklyCount = data
    ? Math.max(1, ...data.weeklyTrend.map((w) => w.count))
    : 1;
  const maxHospitalCount = data
    ? Math.max(1, ...data.perHospitalAnonymized.map((h) => h.count))
    : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Correction Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Aggregate signal from doctor corrections — no patient data shown. Hospitals anonymized.
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {WINDOW_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                days === d
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data ? (
        <>
          {/* Headline numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total corrections</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{data.totalCorrections}</p>
              <p className="text-xs text-gray-400 mt-1">last {data.windowDays} days</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">SOAP accuracy</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2 tabular-nums">{fmtPercent(data.insights.estimatedAccuracy)}</p>
              <p className="text-xs text-gray-400 mt-1">notes left untouched</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">AI rejection rate</p>
              <p className="text-3xl font-bold text-amber-700 mt-2 tabular-nums">{fmtPercent(data.insights.aiRejectionRate)}</p>
              <p className="text-xs text-gray-400 mt-1">of all corrections</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Manual code add</p>
              <p className="text-3xl font-bold text-rose-700 mt-2 tabular-nums">{fmtPercent(data.insights.manualAddRate)}</p>
              <p className="text-xs text-gray-400 mt-1">codes AI missed</p>
            </Card>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <BreakdownCard title="By correction kind" entries={data.byKind} labels={KIND_LABELS} />
            <BreakdownCard title="By artifact type" entries={data.byArtifactType} labels={ARTIFACT_LABELS} />
            <BreakdownCard title="SOAP section edits" entries={data.bySoapField} labels={{}} />
            <BreakdownCard title="Code corrections by system" entries={data.byBillingCodeType} labels={{}} />
          </div>

          {/* Weekly trend */}
          <Card padding="none">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Weekly trend</h3>
            </div>
            <div className="p-5">
              {data.weeklyTrend.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No correction data yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.weeklyTrend.map((w) => (
                    <div key={w.week} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-gray-500 w-20">{w.week}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary-500"
                          style={{ width: `${(w.count / maxWeeklyCount) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-gray-700 w-10 text-right">{w.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Per-hospital anonymized */}
          <Card padding="none">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">By hospital (anonymized)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sorted by count. Hospital names redacted by design — labels stable per session, not per identity.</p>
            </div>
            <div className="p-5">
              {data.perHospitalAnonymized.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hospital data yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.perHospitalAnonymized.map((h) => (
                    <div key={h.label} className="flex items-center gap-3 text-xs">
                      <span className="text-gray-700 font-medium w-24">{h.label}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-amber-400"
                          style={{ width: `${(h.count / maxHospitalCount) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-gray-700 w-10 text-right">{h.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <p className="text-xs text-gray-400">
            Generated {new Date(data.generatedAt).toLocaleString()} · Access logged to AuditLog ·
            Aggregate metrics only — no PHI returned to client.
          </p>
        </>
      ) : null}
    </div>
  );
}

const BreakdownCard = ({
  title,
  entries,
  labels,
}: {
  title: string;
  entries: Record<string, number>;
  labels: Record<string, string>;
}) => {
  const sorted = Object.entries(entries).sort(([, a], [, b]) => b - a);
  const max = Math.max(1, ...sorted.map(([, c]) => c));

  return (
    <Card padding="none">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No data.</p>
        ) : (
          <div className="space-y-1.5">
            {sorted.map(([key, count]) => (
              <div key={key} className="flex items-center gap-3 text-xs">
                <span className="text-gray-700 font-medium w-32 truncate" title={labels[key] ?? key}>
                  {labels[key] ?? key}
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-400"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="font-mono tabular-nums text-gray-700 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
