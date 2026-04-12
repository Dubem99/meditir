'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { addDays, format, isSameDay, isToday, isTomorrow, startOfDay } from 'date-fns';
import type { ConsultationSession } from '@/types/entities.types';

interface Props {
  sessions: ConsultationSession[];
}

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
  // Offset in days from today. 0 = start at today, -7 = previous 7 days, +7 = next 7 days.
  const [dayOffset, setDayOffset] = useState(0);

  const { weekStart, days } = useMemo(() => {
    const ws = addDays(startOfDay(new Date()), dayOffset);
    return {
      weekStart: ws,
      days: Array.from({ length: 7 }, (_, i) => addDays(ws, i)),
    };
  }, [dayOffset]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, ConsultationSession[]>();
    for (const day of days) {
      const key = day.toDateString();
      const daySessions = sessions
        .filter((s) => isSameDay(new Date(s.scheduledAt), day))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      map.set(key, daySessions);
    }
    return map;
  }, [sessions, days]);

  const totalThisWeek = Array.from(sessionsByDay.values()).reduce((n, arr) => n + arr.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">
            {dayOffset === 0 ? 'Next 7 Days' : 'Upcoming'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')} ·{' '}
            {totalThisWeek} consultation{totalThisWeek !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setDayOffset((o) => o - 7)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Previous 7 days"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setDayOffset(0)}
            disabled={dayOffset === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setDayOffset((o) => o + 7)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Next 7 days"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {days.map((day) => {
          const daySessions = sessionsByDay.get(day.toDateString()) ?? [];
          const today = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] md:min-h-[200px] ${isWeekend ? 'bg-gray-50/30' : ''}`}
            >
              {/* Day header */}
              <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-start gap-2 px-3 pt-3 pb-2 md:text-center">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-widest ${
                    today ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {today ? 'Today' : isTomorrow(day) ? 'Tomorrow' : format(day, 'EEE')}
                </p>
                <div
                  className={`text-lg md:text-xl font-bold md:mt-0.5 ${
                    today
                      ? 'text-primary-600'
                      : isWeekend
                      ? 'text-gray-400'
                      : 'text-gray-900'
                  }`}
                >
                  {today ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm">
                      {format(day, 'd')}
                    </span>
                  ) : (
                    format(day, 'd MMM')
                  )}
                </div>
                <span className="md:hidden text-xs text-gray-400 ml-auto">
                  {daySessions.length === 0 ? 'No consultations' : `${daySessions.length} consultation${daySessions.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              {/* Sessions list */}
              <div className="px-2 pb-3 space-y-1.5">
                {daySessions.length === 0 ? (
                  <p className="hidden md:block text-[11px] text-gray-300 text-center py-4">
                    —
                  </p>
                ) : (
                  daySessions.map((s) => {
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
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
