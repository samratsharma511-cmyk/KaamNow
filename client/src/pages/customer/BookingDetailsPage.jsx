import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge, BookingProgressStepper } from '../../components/StatusBadge';
import { ACTIVE_BOOKING_STATUSES } from '../../utils/constants';
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Star,
  Phone,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [error, setError] = useState('');

  const loadBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('booking:join', { bookingId: Number(id) });

    const handleUpdate = (updated) => {
      if (Number(updated.id) === Number(id)) {
        setBooking(updated);
      }
    };
    socket.on('booking:updated', handleUpdate);
    socket.on('booking:accepted', handleUpdate);
    return () => {
      socket.off('booking:updated', handleUpdate);
      socket.off('booking:accepted', handleUpdate);
    };
  }, [socket, id]);

  const handleCancelBooking = async () => {
    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`, {
        reason: 'Cancelled by customer.',
      });
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleRetrySearch = async () => {
    try {
      const { data } = await api.post(`/bookings/${id}/retry`);
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retry search.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/reviews', {
        bookingId: booking.id,
        rating,
        comment,
      });
      if (data.success) {
        setReviewMessage('Thank you! Your review has been published on the worker profile.');
        loadBooking();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-4xl mx-auto h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <p className="text-base font-bold text-slate-800">{error || 'Booking not found'}</p>
      </div>
    );
  }

  const isTrackable = ACTIVE_BOOKING_STATUSES.includes(booking.status);
  const isCancellable = [
    'SEARCHING',
    'REQUESTED',
    'ACCEPTED',
    'ON_THE_WAY',
    'NO_WORKER_FOUND',
  ].includes(booking.status);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customer/bookings')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-600"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </button>

          {isTrackable && (
            <Link
              to={`/customer/bookings/${booking.id}/track`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" /> Open Live Map Tracking
            </Link>
          )}
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Booking #{booking.bookingNumber}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {booking.service?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Requested for {new Date(booking.scheduledAt).toLocaleString()}
              </p>
            </div>
            <StatusBadge status={booking.status} size="lg" />
          </div>

          <BookingProgressStepper status={booking.status} />

          {booking.status === 'NO_WORKER_FOUND' && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-orange-900">
                No nearby online worker accepted within the timeout window. Would you like to dispatch again?
              </p>
              <button
                onClick={handleRetrySearch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Dispatch
              </button>
            </div>
          )}

          {/* Problem & Location Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Service & Problem Description
              </span>
              <p className="text-sm font-bold text-slate-900">
                {booking.service?.category?.name} — {booking.service?.name}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {booking.problemDescription}
              </p>
              {booking.problemPhotoUrl && (
                <div className="pt-2">
                  <img
                    src={booking.problemPhotoUrl}
                    alt="Problem snapshot"
                    className="w-48 h-28 rounded-xl object-cover border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Address & Pricing
              </span>
              <p className="text-xs font-semibold text-slate-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                <span>{booking.serviceAddress}</span>
              </p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Standard Visit Charge</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{booking.visitCharge}
                </span>
              </div>
              {booking.finalAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">
                    Final Completed Amount
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{booking.finalAmount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Worker Details */}
          {booking.workerProfile && (
            <div className="p-5 rounded-2xl bg-navy-50/60 border border-navy-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={booking.workerProfile.user?.avatarUrl}
                  alt={booking.workerProfile.user?.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {booking.workerProfile.user?.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-navy-700">
                    {booking.workerProfile.profession} • {booking.workerProfile.experienceYears} yrs exp
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {booking.workerProfile.user?.phone}
                  </p>
                </div>
              </div>

              <Link
                to={`/customer/workers/${booking.workerProfile.id}`}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-navy-700 hover:bg-slate-50"
              >
                View Full Profile
              </Link>
            </div>
          )}

          {/* Cancel Button if Eligible */}
          {isCancellable && (
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCancelBooking}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
              >
                <XCircle className="w-4 h-4" /> Cancel Booking
              </button>
            </div>
          )}
        </div>

        {/* Review Section (Only after COMPLETED) */}
        {booking.status === 'COMPLETED' && (
          <div
            id="review"
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              {booking.review ? 'Your Submitted Review' : 'Rate & Review Your KaamSaathi'}
            </h2>

            {booking.review ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < booking.review.rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs font-bold text-emerald-800">
                    {booking.review.rating} / 5 Stars
                  </span>
                </div>
                {booking.review.comment && (
                  <p className="text-xs text-slate-700">
                    &ldquo;{booking.review.comment}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {reviewMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Star Rating (1 to 5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2.5 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                          rating >= star
                            ? 'bg-amber-50 border-amber-400 text-amber-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            rating >= star
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Written Feedback (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how punctual, skilled, and helpful your KaamSaathi was..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-sm"
                >
                  {reviewSubmitting ? 'Submitting Review...' : 'Submit Verified Review'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Booking Status History Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-navy-600" />
            Booking Status History
          </h2>

          <div className="space-y-3">
            {(booking.statusHistory || []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <StatusBadge status={entry.status} size="sm" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{entry.note}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
