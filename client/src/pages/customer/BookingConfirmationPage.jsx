import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge, BookingProgressStepper } from '../../components/StatusBadge';
import {
  CheckCircle2,
  Navigation,
  FileText,
  Clock,
  MapPin,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      console.error('Failed to load booking confirmation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('booking:join', { bookingId: Number(id) });

    const handleUpdated = (updated) => {
      if (updated.id === Number(id)) {
        setBooking(updated);
      }
    };

    socket.on('booking:updated', handleUpdated);
    socket.on('booking:accepted', handleUpdated);

    return () => {
      socket.off('booking:updated', handleUpdated);
      socket.off('booking:accepted', handleUpdated);
    };
  }, [socket, id]);

  const handleRetrySearch = async () => {
    setRetrying(true);
    try {
      const { data } = await api.post(`/bookings/${id}/retry`);
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto h-80 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <p className="text-base font-bold text-slate-800">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400">
                  Booking #{booking.bookingNumber}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Service Request Received!
                </h1>
              </div>
            </div>
            <StatusBadge status={booking.status} size="lg" />
          </div>

          <BookingProgressStepper status={booking.status} />

          {/* Live Dispatch Status Card */}
          {['SEARCHING', 'REQUESTED'].includes(booking.status) && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-950">
                    {booking.currentCandidateWorker
                      ? `Waiting for ${booking.currentCandidateWorker.user?.name} to accept...`
                      : 'Scanning nearby online KaamSaathis...'}
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    If the current worker does not respond within 45 seconds, KaamNow automatically routes to the next nearest professional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'NO_WORKER_FOUND' && (
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-orange-900">
                  No online worker accepted within the timeout window.
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Click retry to scan online KaamSaathis in your area again.
                </p>
              </div>
              <button
                onClick={handleRetrySearch}
                disabled={retrying}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {retrying ? 'Searching...' : 'Retry Dispatch'}
              </button>
            </div>
          )}

          {booking.workerProfile && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={booking.workerProfile.user?.avatarUrl}
                  alt={booking.workerProfile.user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-emerald-300"
                />
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-700">
                    <UserCheck className="w-3.5 h-3.5" /> Assigned KaamSaathi
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {booking.workerProfile.user?.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {booking.workerProfile.profession} • {booking.workerProfile.user?.phone}
                  </p>
                </div>
              </div>
              <Link
                to={`/customer/bookings/${booking.id}/track`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Navigation className="w-4 h-4 text-amber-400" /> Open Live Tracking
              </Link>
            </div>
          )}

          {/* Summary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Service Booked
              </span>
              <p className="text-sm font-bold text-slate-900">
                {booking.service?.name}
              </p>
              <p className="text-xs text-slate-600">{booking.problemDescription}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Service Location & Visit Charge
              </span>
              <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-navy-600 shrink-0" />
                {booking.serviceAddress}
              </p>
              <p className="text-sm font-extrabold text-navy-700 pt-1">
                Visit Charge: ₹{booking.visitCharge}
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/customer/bookings"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Go to My Bookings
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to={`/customer/bookings/${booking.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <FileText className="w-4 h-4" /> View Full Details
              </Link>
              <Link
                to={`/customer/bookings/${booking.id}/track`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Navigation className="w-4 h-4 text-amber-400" /> Track Live on Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
