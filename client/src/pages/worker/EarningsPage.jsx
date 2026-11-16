import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { DollarSign, CheckCircle2, TrendingUp, Calendar, Star } from 'lucide-react';

export default function EarningsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/workers/me/stats')
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Error loading earnings:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto h-72 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const completedBookings = data?.completedBookings || [];
  const avgPerJob =
    stats.completedJobsCount > 0
      ? Math.round((stats.totalEarnings || 0) / stats.completedJobsCount)
      : data?.profile?.visitCharge || 199;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            KaamSaathi Financial Summary
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Earnings & Completed Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your cumulative earnings and completed service ledger
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-navy-900 text-white rounded-3xl p-6 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase">Cumulative Earnings</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold">
              ₹{(stats.totalEarnings || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-300">
              100% direct service earnings with transparent visit charges
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase text-slate-400">
                Total Jobs Completed
              </span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {stats.completedJobsCount || 0}
            </p>
            <p className="text-[11px] text-slate-500">
              Verified doorstep completions on KaamNow
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-navy-600">
              <span className="text-xs font-bold uppercase text-slate-400">
                Avg. Earning Per Job
              </span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">₹{avgPerJob}</p>
            <p className="text-[11px] text-slate-500">
              Standard Visit Charge: ₹{data?.profile?.visitCharge || 199}
            </p>
          </div>
        </div>

        {/* Completed Bookings Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Recent Completed Job Ledger
          </h2>

          {completedBookings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No completed jobs recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="py-3 pr-4">Booking #</th>
                    <th className="py-3 pr-4">Service</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Completed Date</th>
                    <th className="py-3 pr-4">Rating</th>
                    <th className="py-3 text-right">Amount Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {completedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-mono font-bold text-slate-600">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-slate-900">
                        {b.service?.name}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">
                        {b.customer?.name}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(b.completedAt || b.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        {b.review ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            {b.review.rating}.0
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-emerald-700">
                        +₹{b.finalAmount || b.visitCharge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
