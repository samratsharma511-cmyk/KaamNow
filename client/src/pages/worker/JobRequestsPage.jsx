import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
} from 'lucide-react';

export default function JobRequestsPage() {
  const { socket, clearJobOffer } = useSocket();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/workers/me/stats');
      if (data.success) {
        setRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error('Failed to load job requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => loadRequests();
    socket.on('job:request', handleEvent);
    socket.on('job:request:expired', handleEvent);
    socket.on('booking:updated', handleEvent);
    return () => {
      socket.off('job:request', handleEvent);
      socket.off('job:request:expired', handleEvent);
      socket.off('booking:updated', handleEvent);
    };
  }, [socket, loadRequests]);

  const handleAccept = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      const { data } = await api.post(`/bookings/${bookingId}/accept`);
      if (data.success) {
        clearJobOffer();
        navigate(`/worker/jobs/${bookingId}/active`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to accept job request.');
      loadRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/reject`);
      clearJobOffer();
      loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to reject job request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Real-Time Dispatch Queue
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Incoming Job Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept nearby service requests within the response window to get assigned immediately
          </p>
        </div>

        {loading ? (
          <div className="h-56 rounded-3xl bg-white border border-slate-200 animate-pulse" />
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Pending Job Requests Right Now
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When a customer in your service area books a service matching your trade, it will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((reqItem) => (
              <div
                key={reqItem.id}
                className="bg-white rounded-3xl border-2 border-amber-400 p-6 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                      NEW JOB REQUEST • #{reqItem.bookingNumber}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {reqItem.service?.name}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">
                      Visit Charge
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      ₹{reqItem.visitCharge}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Customer Problem Description
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {reqItem.problemDescription}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5 pt-1">
                      <User className="w-3.5 h-3.5 text-navy-600" />
                      Customer: <strong className="text-slate-800">{reqItem.customer?.name}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Service Address & Timing
                    </span>
                    <p className="text-slate-800 font-semibold flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                      <span>{reqItem.serviceAddress}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {reqItem.isImmediate
                        ? 'Immediate Requirement (Now)'
                        : new Date(reqItem.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleAccept(reqItem.id)}
                    disabled={processingId === reqItem.id}
                    className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {processingId === reqItem.id ? 'Accepting...' : 'Accept Job Request'}
                  </button>
                  <button
                    onClick={() => handleReject(reqItem.id)}
                    disabled={processingId === reqItem.id}
                    className="px-6 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
