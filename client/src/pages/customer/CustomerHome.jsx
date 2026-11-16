import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import CategoryIcon from '../../components/CategoryIcon';
import WorkerCard from '../../components/WorkerCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ACTIVE_BOOKING_STATUSES } from '../../utils/constants';
import {
  Search,
  Navigation,
  Calendar,
  ArrowRight,
  MapPin,
  Sparkles,
  Clock,
} from 'lucide-react';

export default function CustomerHome() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [catRes, workerRes, bookingRes] = await Promise.all([
        api.get('/services/categories'),
        api.get(
          `/workers?lat=${user?.latitude || 12.9716}&lng=${user?.longitude || 77.6412}`
        ),
        api.get('/bookings/my'),
      ]);

      if (catRes.data.success) setCategories(catRes.data.categories);
      if (workerRes.data.success) setTopWorkers(workerRes.data.workers.slice(0, 6));
      if (bookingRes.data.success) setBookings(bookingRes.data.bookings);
    } catch (err) {
      console.error('Error loading customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchDashboardData();
    };
    socket.on('booking:updated', handleUpdate);
    socket.on('booking:accepted', handleUpdate);
    return () => {
      socket.off('booking:updated', handleUpdate);
      socket.off('booking:accepted', handleUpdate);
    };
  }, [socket]);

  const activeBookings = bookings.filter((b) =>
    ACTIVE_BOOKING_STATUSES.includes(b.status)
  );

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/customer/search?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-600 rounded-3xl p-6 sm:p-10 text-white shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {user?.address || 'Indiranagar, Bengaluru'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Namaste, {user?.name?.split(' ')[0]}! What needs fixing today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                Search for a service or book an instant doorstep visit. KaamNow will automatically assign the nearest verified KaamSaathi.
              </p>

              <form
                onSubmit={handleSearch}
                className="bg-white p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-xl shadow-lg pt-1.5"
              >
                <div className="flex items-center gap-2 px-3 py-2 flex-1">
                  <Search className="w-4 h-4 text-navy-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Electrician, Plumber, AC Repair, Carpenter..."
                    className="w-full text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Find Workers
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/customer/book"
                className="flex items-center justify-between p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm"
              >
                <div>
                  <p className="text-sm font-extrabold">Request Service Now</p>
                  <p className="text-xs text-slate-900 font-medium">
                    Auto-assign nearest available professional
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>

              <Link
                to="/customer/bookings"
                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
              >
                <div>
                  <p className="text-sm font-bold">My Bookings ({bookings.length})</p>
                  <p className="text-xs text-slate-300">
                    Track active jobs & review completed visits
                  </p>
                </div>
                <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* Active Bookings Live Radar */}
        {activeBookings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Active Service Bookings ({activeBookings.length})
              </h2>
              <Link
                to="/customer/bookings"
                className="text-xs font-bold text-navy-600 hover:underline"
              >
                View All Bookings
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border-2 border-navy-600/20 p-5 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400">
                        #{booking.bookingNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {booking.service?.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                        {booking.serviceAddress}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {booking.workerProfile && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <img
                        src={booking.workerProfile.user?.avatarUrl}
                        alt={booking.workerProfile.user?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {booking.workerProfile.user?.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {booking.workerProfile.profession} • {booking.workerProfile.user?.phone}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{booking.visitCharge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      to={`/customer/bookings/${booking.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Booking Details
                    </Link>
                    <Link
                      to={`/customer/bookings/${booking.id}/track`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-600 hover:bg-navy-700 text-white transition shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      Track Live Location
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browse Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Browse Service Categories
            </h2>
            <Link
              to="/services"
              className="text-xs font-bold text-navy-600 hover:underline"
            >
              See All Services
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/customer/search?profession=${encodeURIComponent(cat.name)}`}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-navy-600 hover:shadow-sm transition text-center flex flex-col items-center gap-2 group"
              >
                <div className="w-11 h-11 rounded-2xl bg-navy-50 text-navy-600 group-hover:bg-navy-600 group-hover:text-amber-400 flex items-center justify-center transition">
                  <CategoryIcon name={cat.name} icon={cat.icon} className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Verified KaamSaathis */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Top-Rated KaamSaathis Near You
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by availability, customer ratings, and proximity to your address
              </p>
            </div>
            <Link
              to="/customer/search"
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:underline"
            >
              Filter & Search All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-60 rounded-2xl bg-white border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
