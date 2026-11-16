import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Power,
  Bell,
  Briefcase,
  DollarSign,
  Star,
  CheckCircle2,
  Navigation,
  MapPin,
  ArrowRight,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export default function WorkerHome() {
  const { user, refreshUser } = useAuth();
  const { socket, clearJobOffer } = useSocket();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/workers/me/stats');
      if (data.success) {
        setDashboard(data);
      }
    } catch (err) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => {
      fetchDashboard();
    };
    socket.on('job:request', handleEvent);
    socket.on('job:request:expired', handleEvent);
    socket.on('booking:updated', handleEvent);
    socket.on('review:created', handleEvent);

    return () => {
      socket.off('job:request', handleEvent);
      socket.off('job:request:expired', handleEvent);
      socket.off('booking:updated', handleEvent);
      socket.off('review:created', handleEvent);
    };
  }, [socket, fetchDashboard]);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const currentOnline = dashboard?.profile?.isOnline ?? true;
      const { data } = await api.patch('/workers/availability', {
        isOnline: !currentOnline,
      });
      if (data.success) {
        await fetchDashboard();
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptRequest = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const { data } = await api.post(`/bookings/${bookingId}/accept`);
      if (data.success) {
        clearJobOffer();
        navigate(`/worker/jobs/${bookingId}/active`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept job.');
      fetchDashboard();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/reject`);
      clearJobOffer();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not decline job.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-7xl mx-auto h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const profile = dashboard?.profile;
  const stats = dashboard?.stats || {};
  const pendingRequests = dashboard?.pendingRequests || [];
  const activeJobs = dashboard?.activeJobs || [];
  const completedBookings = dashboard?.completedBookings || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top KaamSaathi Control Banner */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatarUrl}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    KaamSaathi Workspace
                  </span>
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  {user?.name}
                </h1>
                <p className="text-xs text-slate-300">
                  {profile?.profession} • {profile?.serviceArea} • Visit Charge ₹
                  {profile?.visitCharge}
                </p>
              </div>
            </div>

            {/* Online / Offline Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleOnline}
                disabled={toggling}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-xs transition shadow-md ${
                  profile?.isOnline
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                <Power className="w-4 h-4" />
                {profile?.isOnline ? 'STATUS: ONLINE (Receiving Jobs)' : 'STATUS: OFFLINE'}
              </button>

              <Link
                to="/worker/profile/edit"
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{(stats.totalEarnings || 0).toLocaleString('en-IN')}
            </p>
            <Link
              to="/worker/earnings"
              className="text-[11px] font-bold text-navy-600 hover:underline mt-1 inline-block"
            >
              View Earnings Ledger →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Completed Jobs</span>
              <CheckCircle2 className="w-5 h-5 text-navy-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.completedJobsCount || 0}
            </p>
            <Link
              to="/worker/jobs"
              className="text-[11px] font-bold text-navy-600 hover:underline mt-1 inline-block"
            >
              View Job History →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Average Rating</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.averageRating || 'New'}{' '}
              <span className="text-xs font-medium text-slate-500">
                ({stats.totalReviews || 0} reviews)
              </span>
            </p>
            <Link
              to="/worker/reviews"
              className="text-[11px] font-bold text-navy-600 hover:underline mt-1 inline-block"
            >
              Read Customer Reviews →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Pending Offers</span>
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {pendingRequests.length}
            </p>
            <Link
              to="/worker/requests"
              className="text-[11px] font-bold text-navy-600 hover:underline mt-1 inline-block"
            >
              Open Job Queue →
            </Link>
          </div>
        </div>

        {/* Incoming Pending Job Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              Incoming Job Requests ({pendingRequests.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((reqItem) => (
                <div
                  key={reqItem.id}
                  className="bg-amber-50/90 rounded-3xl border-2 border-amber-400 p-6 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-amber-800">
                        #{reqItem.bookingNumber} • NEW DISPATCH OFFER
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {reqItem.service?.name}
                      </h3>
                      <p className="text-xs text-slate-700 mt-1">
                        {reqItem.problemDescription}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{reqItem.visitCharge}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-navy-600 shrink-0" />
                    {reqItem.serviceAddress}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleAcceptRequest(reqItem.id)}
                      disabled={actionLoadingId === reqItem.id}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm"
                    >
                      {actionLoadingId === reqItem.id ? 'Processing...' : 'Accept Job'}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(reqItem.id)}
                      disabled={actionLoadingId === reqItem.id}
                      className="px-5 py-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Assigned Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Active Assigned Jobs ({activeJobs.length})
            </h2>
            <Link
              to="/worker/jobs"
              className="text-xs font-bold text-navy-600 hover:underline"
            >
              View All Jobs
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-800">
                No active jobs in progress right now
              </p>
              <p className="text-xs text-slate-500">
                Stay ONLINE to automatically receive service requests from customers in your area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border-2 border-navy-600/20 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{job.bookingNumber}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {job.service?.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Customer: <span className="font-bold">{job.customer?.name}</span> (
                        {job.customer?.phone})
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                    <span>{job.serviceAddress}</span>
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <Link
                      to={`/worker/jobs/${job.id}/active`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition"
                    >
                      Manage Job Status
                    </Link>
                    <Link
                      to={`/worker/jobs/${job.id}/navigate`}
                      className="inline-flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Live GPS Navigation
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed Jobs & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Completed Jobs
              </h3>
              <Link
                to="/worker/earnings"
                className="text-xs font-bold text-navy-600 hover:underline"
              >
                Earnings →
              </Link>
            </div>

            {completedBookings.length === 0 ? (
              <p className="text-xs text-slate-500">No completed jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {completedBookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {b.service?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Customer: {b.customer?.name} •{' '}
                        {new Date(b.completedAt || b.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-700">
                      +₹{b.finalAmount || b.visitCharge}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Customer Reviews
              </h3>
              <Link
                to="/worker/reviews"
                className="text-xs font-bold text-navy-600 hover:underline"
              >
                All Reviews →
              </Link>
            </div>

            {!profile?.reviews || profile.reviews.length === 0 ? (
              <p className="text-xs text-slate-500">No customer reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.reviews.slice(0, 3).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.customer?.name || 'Customer'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {rev.rating}.0
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-600 line-clamp-2">
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
    </div>
  );
}
