import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import MapView from '../../components/MapView';
import { StatusBadge, BookingProgressStepper } from '../../components/StatusBadge';
import { calculateHaversineKm } from '../../utils/constants';
import {
  Navigation,
  Phone,
  ShieldCheck,
  Clock,
  MapPin,
  ArrowLeft,
  Star,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function LiveTrackingPage() {
  const { id } = useParams();
  const { socket, connected } = useSocket();
  const [booking, setBooking] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [roomJoined, setRoomJoined] = useState(false);
  const [trackingStoppedReason, setTrackingStoppedReason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`);
        if (data.success && data.booking) {
          setBooking(data.booking);
          if (data.booking.workerProfile?.location) {
            setWorkerLocation(data.booking.workerProfile.location);
          }
        }
      } catch (err) {
        console.error('Failed to load booking for tracking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('booking:join', { bookingId: Number(id) }, (ack) => {
      if (ack?.success) {
        setRoomJoined(true);
      }
    });

    const handleLocationUpdate = (payload) => {
      if (Number(payload.bookingId) === Number(id)) {
        setWorkerLocation({
          latitude: payload.latitude,
          longitude: payload.longitude,
          heading: payload.heading,
          speed: payload.speed,
          updatedAt: payload.updatedAt || new Date().toISOString(),
        });
      }
    };

    const handleBookingUpdated = (updated) => {
      if (Number(updated.id) === Number(id)) {
        setBooking(updated);
        if (updated.workerProfile?.location) {
          setWorkerLocation((prev) => prev || updated.workerProfile.location);
        }
      }
    };

    const handleTrackingStopped = (payload) => {
      if (Number(payload.bookingId) === Number(id)) {
        setTrackingStoppedReason(payload.reason);
      }
    };

    socket.on('booking:location', handleLocationUpdate);
    socket.on('booking:updated', handleBookingUpdated);
    socket.on('booking:accepted', handleBookingUpdated);
    socket.on('booking:tracking:stopped', handleTrackingStopped);

    return () => {
      socket.emit('booking:leave', { bookingId: Number(id) });
      socket.off('booking:location', handleLocationUpdate);
      socket.off('booking:updated', handleBookingUpdated);
      socket.off('booking:accepted', handleBookingUpdated);
      socket.off('booking:tracking:stopped', handleTrackingStopped);
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
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

  const distanceKm =
    workerLocation && booking.latitude && booking.longitude
      ? calculateHaversineKm(
          booking.latitude,
          booking.longitude,
          workerLocation.latitude,
          workerLocation.longitude
        )
      : null;

  const estimatedMinutes =
    distanceKm !== null ? Math.max(2, Math.round(distanceKm * 4)) : null;

  const isTrackingActive = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(
    booking.status
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to={`/customer/bookings/${booking.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-600 mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Booking #{booking.bookingNumber}
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Navigation className="w-6 h-6 text-navy-600" />
              Live Worker Location Tracking
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                connected && roomJoined && isTrackingActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  connected && roomJoined && isTrackingActive
                    ? 'text-emerald-600 animate-pulse'
                    : 'text-slate-400'
                }`}
              />
              {isTrackingActive
                ? 'Private Booking Room Connected'
                : `Tracking Inactive (${booking.status})`}
            </span>
            <StatusBadge status={booking.status} size="lg" />
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <BookingProgressStepper status={booking.status} />
        </div>

        {trackingStoppedReason && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            Live location sharing has automatically ended because this booking is now{' '}
            {trackingStoppedReason}.
          </div>
        )}

        {/* Map & Worker Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
            <MapView
              customerLocation={{
                latitude: booking.latitude,
                longitude: booking.longitude,
              }}
              workerLocation={isTrackingActive ? workerLocation : null}
              customerLabel={`Service Location: ${booking.serviceAddress}`}
              workerLabel={
                booking.workerProfile
                  ? `${booking.workerProfile.user?.name} (${booking.workerProfile.profession})`
                  : 'Assigned KaamSaathi'
              }
              heightClass="h-[440px]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <span>🏠</span> Customer Destination
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <span>🛵</span> Assigned KaamSaathi Live GPS
                </span>
              </div>
              {workerLocation?.updatedAt && (
                <span>
                  Last GPS update: {new Date(workerLocation.updatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Right Info Column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Live Distance & ETA Card */}
            <div className="bg-navy-900 text-white rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Live Telemetry
                </span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>

              {isTrackingActive && distanceKm !== null ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/10">
                    <span className="text-[11px] text-slate-300 block">
                      Distance Away
                    </span>
                    <span className="text-2xl font-extrabold text-white">
                      {distanceKm} km
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10">
                    <span className="text-[11px] text-slate-300 block">
                      Estimated Arrival
                    </span>
                    <span className="text-2xl font-extrabold text-amber-400">
                      ~{estimatedMinutes} mins
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {booking.status === 'COMPLETED'
                    ? 'This service has been completed. Location sharing is closed.'
                    : booking.status === 'SEARCHING' || booking.status === 'REQUESTED'
                    ? 'Waiting for a nearby KaamSaathi to accept the request...'
                    : 'Waiting for worker GPS signal...'}
                </p>
              )}

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Browser-based foreground GPS tracking updates automatically while your KaamSaathi has their navigation page open.
                </span>
              </div>
            </div>

            {/* Assigned Worker Card */}
            {booking.workerProfile ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Assigned Professional
                </span>

                <div className="flex items-center gap-4">
                  <img
                    src={booking.workerProfile.user?.avatarUrl}
                    alt={booking.workerProfile.user?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {booking.workerProfile.user?.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-navy-600">
                      {booking.workerProfile.profession}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {booking.workerProfile.averageRating}
                      </span>
                      <span>• {booking.workerProfile.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-navy-600" /> Contact Number
                  </span>
                  <span className="font-bold text-slate-900">
                    {booking.workerProfile.user?.phone}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/customer/workers/${booking.workerProfile.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    View Worker Profile
                  </Link>
                  <Link
                    to={`/customer/bookings/${booking.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-navy-600 text-white text-xs font-bold hover:bg-navy-700"
                  >
                    Booking Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Worker Assignment in Progress
                </h3>
                <p className="text-xs text-slate-500">
                  As soon as a nearby KaamSaathi accepts your request, their profile and live GPS coordinates will appear here automatically.
                </p>
              </div>
            )}

            {/* Service & Destination Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Service Destination
              </span>
              <p className="text-sm font-bold text-slate-900">
                {booking.service?.name}
              </p>
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                <span>{booking.serviceAddress}</span>
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Visit Charge</span>
                <span className="font-extrabold text-slate-900">
                  ₹{booking.visitCharge}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
