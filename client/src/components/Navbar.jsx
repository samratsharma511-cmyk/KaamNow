import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Wrench,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Briefcase,
  Search,
  Calendar,
  DollarSign,
  Star,
  Settings,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isWorker, logout } = useAuth();
  const { incomingJobOffer, clearJobOffer } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-navy-50 text-navy-700 font-semibold'
        : 'text-slate-600 hover:text-navy-700 hover:bg-slate-100'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to={
              isAuthenticated
                ? isWorker
                  ? '/worker/dashboard'
                  : '/customer/dashboard'
                : '/'
            }
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-navy-600 flex items-center justify-center text-white shadow-sm group-hover:bg-navy-700 transition">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-800">
                Kaam<span className="text-amber-500">Now</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 -mt-1">
                Connecting Skills with Opportunities
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated && (
              <>
                <NavLink to="/" end className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/services" className={navLinkClass}>
                  Services
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                  About
                </NavLink>
              </>
            )}

            {isCustomer && (
              <>
                <NavLink to="/customer/dashboard" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/customer/search" className={navLinkClass}>
                  Find Workers
                </NavLink>
                <NavLink to="/customer/book" className={navLinkClass}>
                  Book a Service
                </NavLink>
                <NavLink to="/customer/bookings" className={navLinkClass}>
                  My Bookings
                </NavLink>
                <NavLink to="/services" className={navLinkClass}>
                  All Categories
                </NavLink>
              </>
            )}

            {isWorker && (
              <>
                <NavLink to="/worker/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/worker/requests" className={navLinkClass}>
                  Job Requests
                </NavLink>
                <NavLink to="/worker/jobs" className={navLinkClass}>
                  My Jobs
                </NavLink>
                <NavLink to="/worker/earnings" className={navLinkClass}>
                  Earnings
                </NavLink>
                <NavLink to="/worker/reviews" className={navLinkClass}>
                  Reviews
                </NavLink>
                <NavLink to="/worker/profile/edit" className={navLinkClass}>
                  Professional Profile
                </NavLink>
                <NavLink to="/worker/settings" className={navLinkClass}>
                  Settings
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-navy-700 hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-navy-600 text-white hover:bg-navy-700 shadow-sm transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={isWorker ? '/worker/profile/edit' : '/customer/profile'}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 transition"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-navy-600" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase mt-0.5">
                      {isWorker ? 'KaamSaathi' : 'Customer'}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Services
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  About KaamNow
                </Link>
                <div className="pt-2 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-navy-600 text-white"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}

            {isCustomer && (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Briefcase className="w-4 h-4" /> Customer Home
                </Link>
                <Link
                  to="/customer/search"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Search className="w-4 h-4" /> Search Workers
                </Link>
                <Link
                  to="/customer/book"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4" /> Book a Service
                </Link>
                <Link
                  to="/customer/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <ShieldCheck className="w-4 h-4" /> My Bookings
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}

            {isWorker && (
              <>
                <Link
                  to="/worker/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Briefcase className="w-4 h-4" /> Worker Home
                </Link>
                <Link
                  to="/worker/requests"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Bell className="w-4 h-4" /> Job Requests
                </Link>
                <Link
                  to="/worker/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4" /> My Jobs
                </Link>
                <Link
                  to="/worker/earnings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <DollarSign className="w-4 h-4" /> Earnings
                </Link>
                <Link
                  to="/worker/reviews"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Star className="w-4 h-4" /> Reviews & Ratings
                </Link>
                <Link
                  to="/worker/profile/edit"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="w-4 h-4" /> Professional Profile
                </Link>
                <Link
                  to="/worker/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Global Real-Time Incoming Job Offer Banner for Online KaamSaathis */}
      {isWorker && incomingJobOffer?.booking && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-lg border-b border-amber-600">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-slate-950 text-amber-400 animate-bounce">
                <Bell className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">
                  New Service Request Nearby: {incomingJobOffer.booking.service?.name}
                </p>
                <p className="text-xs font-medium text-slate-900 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {incomingJobOffer.booking.serviceAddress}
                  {incomingJobOffer.distanceKm && (
                    <span className="px-2 py-0.5 rounded bg-slate-950/10 font-bold">
                      {incomingJobOffer.distanceKm} km away
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  clearJobOffer();
                  navigate('/worker/requests');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition"
              >
                Review & Accept Job
              </button>
              <button
                onClick={clearJobOffer}
                className="p-1.5 rounded-lg hover:bg-amber-600/40 text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
