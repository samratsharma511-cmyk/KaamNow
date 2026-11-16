import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ACTIVE_BOOKING_STATUSES } from '../../utils/constants';
import {
  Navigation,
  FileText,
  Star,
  Calendar,
  MapPin,
  PlusCircle,
  XCircle,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => loadBookings();
    socket.on('booking:updated', handleUpdate);
    socket.on('booking:accepted', handleUpdate);
    return () => {
      socket.off('booking:updated', handleUpdate);
      socket.off('booking:accepted', handleUpdate);
    };
  }, [socket]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer from My Bookings.',
      });
      if (data.success) {
        loadBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'ACTIVE') return ACTIVE_BOOKING_STATUSES.includes(b.status);
    if (filterTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (filterTab === 'CANCELLED')
      return ['CANCELLED', 'NO_WORKER_FOUND'].includes(b.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              My Service Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track active service visits, view history, cancel eligible requests, and rate completed work
            </p>
          </div>
          <Link
            to="/customer/book"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" /> Book New Service
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: `All (${bookings.length})` },
            {
              key: 'ACTIVE',
              label: `Active (${
                bookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status)).length
              })`,
            },
            {
              key: 'COMPLETED',
              label: `Completed (${
                bookings.filter((b) => b.status === 'COMPLETED').length
              })`,
            },
            {
              key: 'CANCELLED',
              label: `Cancelled / Other (${
                bookings.filter((b) =>
                  ['CANCELLED', 'NO_WORKER_FOUND'].includes(b.status)
                ).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterTab === tab.key
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-800">
              No bookings in this view
            </p>
            <p className="text-xs text-slate-500">
              Need an electrician, plumber, or technician? Book a verified KaamSaathi in seconds.
            </p>
            <Link
              to="/customer/book"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy-600 text-white text-xs font-bold"
            >
              Book a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isTrackable = ACTIVE_BOOKING_STATUSES.includes(booking.status);
              const isCancellable = [
                'SEARCHING',
                'REQUESTED',
                'ACCEPTED',
                'ON_THE_WAY',
                'NO_WORKER_FOUND',
              ].includes(booking.status);
              const canReview = booking.status === 'COMPLETED' && !booking.review;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{booking.bookingNumber}
                      </span>
                      <StatusBadge status={booking.status} />
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(booking.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {booking.service?.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {booking.problemDescription}
                    </p>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-navy-600 shrink-0" />
                      {booking.serviceAddress}
                    </p>

                    {booking.workerProfile && (
                      <div className="inline-flex items-center gap-2.5 pt-1">
                        <img
                          src={booking.workerProfile.user?.avatarUrl}
                          alt={booking.workerProfile.user?.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          KaamSaathi: {booking.workerProfile.user?.name} (
                          {booking.workerProfile.profession})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-end justify-between gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Visit / Service Charge
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{booking.finalAmount || booking.visitCharge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/customer/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> Details
                      </Link>

                      {isTrackable && (
                        <Link
                          to={`/customer/bookings/${booking.id}/track`}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-400" /> Track Live
                        </Link>
                      )}

                      {canReview && (
                        <Link
                          to={`/customer/bookings/${booking.id}#review`}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                        >
                          <Star className="w-3.5 h-3.5" /> Rate Worker
                        </Link>
                      )}

                      {isCancellable && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
