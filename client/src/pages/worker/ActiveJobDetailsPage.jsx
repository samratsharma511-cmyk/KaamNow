import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge, BookingProgressStepper } from '../../components/StatusBadge';
import {
  Navigation,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Play,
  Flag,
  Truck,
} from 'lucide-react';

export default function ActiveJobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState(null);
  const [finalAmount, setFinalAmount] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadJob = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data.success) {
        setBooking(data.booking);
        setFinalAmount(String(data.booking.finalAmount || data.booking.visitCharge));
      }
    } catch (err) {
      console.error('Error loading active job:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
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
    return () => {
      socket.off('booking:updated', handleUpdate);
    };
  }, [socket, id]);

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, {
        status: nextStatus,
        note: statusNote || undefined,
        finalAmount: nextStatus === 'COMPLETED' ? Number(finalAmount) : undefined,
      });
      if (data.success) {
        setBooking(data.booking);
        setStatusNote('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-4xl mx-auto h-80 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <p className="text-base font-bold text-slate-800">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/worker/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-600"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Jobs
          </button>

          {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) && (
            <Link
              to={`/worker/jobs/${booking.id}/navigate`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition shadow-sm"
            >
              <Navigation className="w-4 h-4" /> Open Live Navigation & GPS Sharing
            </Link>
          )}
        </div>

        {/* Job Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Job #{booking.bookingNumber}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {booking.service?.name}
              </h1>
            </div>
            <StatusBadge status={booking.status} size="lg" />
          </div>

          <BookingProgressStepper status={booking.status} />

          {/* Customer & Service Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Customer Details
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {booking.customer?.name}
              </p>
              <p className="text-xs font-semibold text-navy-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {booking.customer?.phone}
              </p>
              <p className="text-xs text-slate-700 flex items-start gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                <span>{booking.serviceAddress}</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Problem Description & Visit Charge
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {booking.problemDescription}
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Visit Charge</span>
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{booking.finalAmount || booking.visitCharge}
                </span>
              </div>
            </div>
          </div>

          {/* Sequential Status Progression Controls */}
          {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(
            booking.status
          ) && (
            <div className="p-6 rounded-2xl bg-navy-900 text-white space-y-4">
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                Update Job Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional work note (e.g. Leaving now, Replaced 16A socket)..."
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none"
                />

                {booking.status === 'IN_PROGRESS' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 shrink-0">
                      Final Charge (₹):
                    </span>
                    <input
                      type="number"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleStatusUpdate('ON_THE_WAY')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition"
                  >
                    <Truck className="w-4 h-4" /> Mark as On The Way
                  </button>
                )}

                {booking.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => handleStatusUpdate('ARRIVED')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs transition"
                  >
                    <Flag className="w-4 h-4" /> Mark Arrived at Customer Location
                  </button>
                )}

                {booking.status === 'ARRIVED' && (
                  <button
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs transition"
                  >
                    <Play className="w-4 h-4" /> Start Service Work
                  </button>
                )}

                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Job & Record Earnings
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
