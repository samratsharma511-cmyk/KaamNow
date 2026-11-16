import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Star, Award, MessageSquare } from 'lucide-react';

export default function ReviewsRatingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/workers/me/stats')
      .then(({ data }) => {
        if (data.success) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load worker reviews:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-4xl mx-auto h-72 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const reviews = profile?.reviews || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Professional Reputation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings from customers whose bookings you have completed
          </p>
        </div>

        {/* Rating Overview Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="text-center sm:text-left space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <span className="text-xs font-bold uppercase text-slate-400">
              Overall Star Rating
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-4xl font-extrabold text-slate-900">
                {Number(profile?.averageRating || 0).toFixed(1)}
              </span>
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
            </div>
            <p className="text-xs text-slate-500">
              Based on {profile?.totalReviews || 0} verified ratings
            </p>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Award className="w-4 h-4 text-emerald-600" /> Completed Jobs
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              {profile?.completedJobsCount || 0}
            </p>
            <p className="text-xs text-slate-500">Total jobs delivered</p>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <MessageSquare className="w-4 h-4 text-navy-600" /> Written Feedback
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              {reviews.length}
            </p>
            <p className="text-xs text-slate-500">Displayed on your public profile</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            All Customer Feedback ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No written reviews yet. Complete jobs to earn customer reviews!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.customer?.avatarUrl ? (
                        <img
                          src={rev.customer.avatarUrl}
                          alt={rev.customer.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-navy-600 text-white font-bold flex items-center justify-center text-xs">
                          {rev.customer?.name?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {rev.customer?.name || 'Verified Customer'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {rev.booking?.service?.name || 'Completed Service'} •{' '}
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {rev.rating}.0
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
