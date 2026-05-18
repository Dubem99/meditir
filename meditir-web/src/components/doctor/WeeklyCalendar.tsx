'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { ConsultationSession } from '@/types/entities.types';

interface Props {
  sessions: ConsultationSession[];
}

type ViewMode = 'week' | 'month';

// Weeks run Monday → Sunday.
const WEEK_OPTS = { weekStartsOn: 1 } as const;

const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  SCHEDULED: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  COMPLETED: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  CANCELLED: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-300',
  },
};

export const WeeklyCalendar = ({ sessions }: Props) => {
  const [view, setView] = useState<ViewMode>('week');
  // A date that lives inside the period currently shown. Defaults to today.
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  // The contiguous list of days to render, plus the period's label range.
  const { days, rangeStart, rangeEnd } = useMemo(() => {
    if (view === 'week') {
      const ws = startOfWeek(anchor, WEEK_OPTS);
      return {
        days: Array.from({ length: 7 }, (_, i) => addDays(ws, i)),
        rangeStart: ws,
        rangeEnd: addDays(ws, 6),
      };
    }
    // Month view: full weeks (Mon–Sun) covering the anchor's month.
    const gridStart = startOfWeek(startOfMonth(anchor), WEEK_OPTS);
    const gridEnd = endOfWeek(endOfMonth(anchor), WEEK_OPTS);
    return {
      days: eachDayOfInterval({ start: gridStart, end: gridEnd }),
      rangeStart: startOfMonth(anchor),
      rangeEnd: endOfMonth(anchor),
    };
  }, [view, anchor]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, ConsultationSession[]>();
    for (const day of days) {
      const key = day.toDateString();
      map.set(
        key,
        sessions
          .filter((s) => isSameDay(new Date(s.scheduledAt), day))
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
      );
    }
    return map;
  }, [sessions, days]);

  const total = useMemo(
    () =>
      days.reduce((n, day) => {
        if (view === 'month' && !isSameMonth(day, anchor)) return n;
        return n + (sessionsByDay.get(day.toDateString())?.length ?? 0);
      }, 0),
    [days, sessionsByDay, view, anchor],
  );

  const step = (dir: 1 | -1) =>
    setAnchor((a) => (view === 'week' ? addWeeks(a, dir) : addMonths(a, dir)));

  const heading =
    view === 'week'
      ? isSameDay(startOfWeek(new Date(), WEEK_OPTS), startOfWeek(anchor, WEEK_OPTS))
        ? 'This Week'
        : 'Week'
      : format(anchor, 'MMMM yyyy');

  const subLabel =
    view === 'week'
      ? `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
      : `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d')}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{heading}</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {subLabel} · {total} consultation{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
            {(['week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => step(-1)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label={view === 'week' ? 'Previous week' : 'Previous month'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setAnchor(new Date())}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => step(1)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label={view === 'week' ? 'Next week' : 'Next month'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Weekday labels (desktop) */}
      <div className="hidden md:grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-100 ${
          view === 'month' ? 'md:[&>*:nth-child(7n+1)]:border-l-0' : ''
        }`}
      >
        {days.map((day) => {
          const daySessions = sessionsByDay.get(day.toDateString()) ?? [];
          const today = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const outsideMonth = view === 'month' && !isSameMonth(day, anchor);
          const cap = view === 'month' ? 3 : daySessions.length;
          const shown = daySessions.slice(0, cap);
          const overflow = daySessions.length - shown.length;

          return (
            <div
              key={day.toISOString()}
              className={`${
                view === 'month' ? 'min-h-[112px]' : 'min-h-[140px] md:min-h-[200px]'
              } ${isWeekend ? 'bg-gray-50/30' : ''} ${outsideMonth ? 'bg-gray-50/60' : ''}`}
            >
              {/* Day header */}
              <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-start gap-2 px-3 pt-3 pb-2 md:text-center">
                <p
                  className={`md:hidden text-[10px] font-semibold uppercase tracking-widest ${
                    today ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {today ? 'Today' : isTomorrow(day) ? 'Tomorrow' : format(day, 'EEE')}
                </p>
                <div
                  className={`text-lg md:text-base font-bold ${
                    today
                      ? 'text-primary-600'
                      : outsideMonth
                      ? 'text-gray-300'
                      : isWeekend
                      ? 'text-gray-400'
                      : 'text-gray-900'
                  }`}
                >
                  {today ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm">
                      {format(day, 'd')}
                    </span>
                  ) : view === 'month' ? (
                    format(day, 'd')
                  ) : (
                    format(day, 'd MMM')
                  )}
                </div>
                <span className="md:hidden text-xs text-gray-400 ml-auto">
                  {daySessions.length === 0
                    ? 'No consultations'
                    : `${daySessions.length} consultation${daySessions.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              {/* Sessions list */}
              <div className="px-2 pb-3 space-y-1.5">
                {daySessions.length === 0 ? (
                  <p className="hidden md:block text-[11px] text-gray-300 text-center py-4">—</p>
                ) : (
                  <>
                    {shown.map((s) => {
                      const style = statusStyles[s.status] ?? statusStyles.SCHEDULED;
                      return (
                        <Link
                          key={s.id}
                          href={`/doctor/sessions/${s.id}`}
                          className={`block rounded-lg border ${style.border} ${style.bg} px-2 py-1.5 hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span className={`text-[10px] font-semibold tabular-nums ${style.text}`}>
                              {format(new Date(s.scheduledAt), 'h:mm a')}
                            </span>
                          </div>
                          <p className={`text-xs font-medium truncate ${style.text}`}>
                            {s.patient.firstName} {s.patient.lastName}
                          </p>
                        </Link>
                      );
                    })}
                    {overflow > 0 && (
                      <p className="text-[10px] font-medium text-gray-400 px-1">
                        +{overflow} more
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
