import React from 'react';
import { BOOKING_STATUS_CONFIG } from '../utils/constants';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const config = BOOKING_STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-4 py-1.5 text-sm'
      : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.badgeClass} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

const PROGRESS_STEPS = [
  { key: 'REQUESTED', label: 'Requested', step: 1 },
  { key: 'ACCEPTED', label: 'Assigned', step: 2 },
  { key: 'ON_THE_WAY', label: 'On the Way', step: 3 },
  { key: 'ARRIVED', label: 'Arrived', step: 4 },
  { key: 'IN_PROGRESS', label: 'In Progress', step: 5 },
  { key: 'COMPLETED', label: 'Completed', step: 6 },
];

export function BookingProgressStepper({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Booking Cancelled</p>
          <p className="text-xs text-rose-600">This service booking was cancelled.</p>
        </div>
      </div>
    );
  }

  if (status === 'NO_WORKER_FOUND') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800">
        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
        <div>
          <p className="font-semibold text-sm">No Nearby KaamSaathi Available Right Now</p>
          <p className="text-xs text-orange-700">
            All online professionals in your radius were busy. You can retry searching anytime.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = BOOKING_STATUS_CONFIG[status]?.step || 1;

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {PROGRESS_STEPS.map((item) => {
          const isCompleted = currentStep > item.step || status === 'COMPLETED';
          const isCurrent = currentStep === item.step && status !== 'COMPLETED';

          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-navy-600 border-navy-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                  {item.step}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
