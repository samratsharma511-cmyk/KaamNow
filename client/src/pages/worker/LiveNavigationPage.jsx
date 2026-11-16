import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MapView from '../../components/MapView';
import { StatusBadge } from '../../components/StatusBadge';
import { calculateHaversineKm } from '../../utils/constants';
import {
  Navigation,
  Radio,
  Play,
  Square,
  MapPin,
  Phone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LiveNavigationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [booking, setBooking] = useState(null);
  const [workerCoords, setWorkerCoords] = useState({
    latitude: user?.workerProfile?.location?.latitude || user?.latitude || 12.9784,
    longitude: user?.workerProfile?.location?.longitude || user?.longitude || 77.6408,
  });
  const [isSharingGps, setIsSharingGps] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState('');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [lastSentAt, setLastSentAt] = useState(null);

  const watchIdRef = useRef(null);
  const simIntervalRef = useRef(null);

  const loadBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data.success && data.booking) {
        setBooking(data.booking);
        if (data.booking.workerProfile?.location) {
          setWorkerCoords({
            latitude: data.booking.workerProfile.location.latitude,
            longitude: data.booking.workerProfile.location.longitude,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load navigation booking:', err);
    }
  };

  useEffect(() => {
    loadBooking();
    return () => {
      stopAllTracking();
    };
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('booking:join', { bookingId: Number(id) });

    const handleUpdated = (updated) => {
      if (Number(updated.id) === Number(id)) {
        setBooking(updated);
        if (['COMPLETED', 'CANCELLED'].includes(updated.status)) {
          stopAllTracking();
          setGpsStatusMsg(
            `Booking is ${updated.status}. Live GPS sharing has automatically stopped.`
          );
        }
      }
    };

    socket.on('booking:updated', handleUpdated);
    return () => {
      socket.off('booking:updated', handleUpdated);
    };
  }, [socket, id]);

  const stopAllTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSharingGps(false);
    setIsSimulating(false);
  };

  const broadcastCoordinates = (lat, lng, heading = 0, speed = 25) => {
    setWorkerCoords({ latitude: lat, longitude: lng });
    setLastSentAt(new Date());

    if (socket && connected) {
      socket.emit('worker:location:update', {
        bookingId: Number(id),
        latitude: lat,
        longitude: lng,
        heading,
        speed,
      });
    } else {
      api
        .patch('/workers/location', {
          bookingId: Number(id),
          latitude: lat,
          longitude: lng,
          heading,
          speed,
        })
        .catch(() => {});
    }
  };

  const startBrowserGpsSharing = () => {
    setGpsErrorMsg('');
    if (!navigator.geolocation) {
      setGpsErrorMsg(
        'Browser Geolocation API is not supported on this device. You can use the Simulate Route movement button below.'
      );
      return;
    }

    stopAllTracking();
    setIsSharingGps(true);
    setGpsStatusMsg('Requesting browser GPS permission and broadcasting live coordinates...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        broadcastCoordinates(lat, lng, pos.coords.heading || 0, pos.coords.speed || 20);
        setGpsStatusMsg('Live browser GPS sharing is active.');
      },
      (err) => {
        setIsSharingGps(false);
        setGpsErrorMsg(
          `Location permission denied or unavailable (${err.message}). You can click "Simulate En-Route Movement" to test live map tracking.`
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  };

  const startSimulatedRouteMovement = () => {
    if (!booking) return;
    stopAllTracking();
    setGpsErrorMsg('');
    setIsSimulating(true);
    setGpsStatusMsg(
      'Simulating smooth GPS movement toward the customer location every 2 seconds...'
    );

    simIntervalRef.current = setInterval(() => {
      setWorkerCoords((prev) => {
        const targetLat = booking.latitude;
        const targetLng = booking.longitude;
        const dLat = targetLat - prev.latitude;
        const dLng = targetLng - prev.longitude;

        if (Math.abs(dLat) < 0.0002 && Math.abs(dLng) < 0.0002) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
          setIsSimulating(false);
          setGpsStatusMsg('Reached customer coordinates!');
          return { latitude: targetLat, longitude: targetLng };
        }

        const nextLat = Number((prev.latitude + dLat * 0.22).toFixed(6));
        const nextLng = Number((prev.longitude + dLng * 0.22).toFixed(6));
        broadcastCoordinates(nextLat, nextLng, 135, 28);
        return { latitude: nextLat, longitude: nextLng };
      });
    }, 2000);
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, {
        status: nextStatus,
      });
      if (data.success) {
        setBooking(data.booking);
        if (nextStatus === 'COMPLETED') {
          stopAllTracking();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <p className="text-sm font-bold text-slate-700">Loading navigation...</p>
      </div>
    );
  }

  const distanceKm = calculateHaversineKm(
    booking.latitude,
    booking.longitude,
    workerCoords.latitude,
    workerCoords.longitude
  );

  const isTrackable = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(
    booking.status
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to={`/worker/jobs/${booking.id}/active`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-600 mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Active Job Details
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-amber-500" />
              KaamSaathi Live GPS Navigation & Location Sharing
            </h1>
          </div>

          <StatusBadge status={booking.status} size="lg" />
        </div>

        {gpsErrorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{gpsErrorMsg}</span>
          </div>
        )}

        {gpsStatusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{gpsStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
            <MapView
              customerLocation={{
                latitude: booking.latitude,
                longitude: booking.longitude,
              }}
              workerLocation={workerCoords}
              customerLabel={`Customer: ${booking.customer?.name} (${booking.serviceAddress})`}
              workerLabel={`Your Location (${user?.name})`}
              onSelectLocation={
                isTrackable
                  ? ({ latitude, longitude }) => {
                      broadcastCoordinates(latitude, longitude);
                      setGpsStatusMsg(
                        `Updated your GPS position to (${latitude}, ${longitude}) and streamed to customer.`
                      );
                    }
                  : null
              }
              heightClass="h-[440px]"
            />
            <p className="text-[11px] text-slate-500 px-2">
              Tip: You can also click anywhere on the map to manually move your KaamSaathi pin and broadcast the new coordinates to the customer&apos;s live tracking map immediately.
            </p>
          </div>

          {/* Right Controls Column */}
          <div className="lg:col-span-4 space-y-5">
            {/* GPS Sharing Controls */}
            <div className="bg-navy-900 text-white rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Live GPS Transmitter
                </span>
                <Radio
                  className={`w-4 h-4 ${
                    isSharingGps || isSimulating
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/10">
                  <span className="text-[10px] text-slate-300 block">
                    Distance to Customer
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    {distanceKm !== null ? `${distanceKm} km` : '—'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10">
                  <span className="text-[10px] text-slate-300 block">
                    Last Ping Sent
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {lastSentAt ? lastSentAt.toLocaleTimeString() : 'Ready'}
                  </span>
                </div>
              </div>

              {isTrackable ? (
                <div className="space-y-2.5">
                  {!isSharingGps ? (
                    <button
                      onClick={startBrowserGpsSharing}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Start Browser GPS Sharing
                    </button>
                  ) : (
                    <button
                      onClick={stopAllTracking}
                      className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Square className="w-4 h-4" /> Stop GPS Sharing
                    </button>
                  )}

                  {!isSimulating ? (
                    <button
                      onClick={startSimulatedRouteMovement}
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Simulate En-Route Movement
                    </button>
                  ) : (
                    <button
                      onClick={stopAllTracking}
                      className="w-full py-2.5 rounded-xl bg-white/15 text-white font-bold text-xs transition"
                    >
                      Stop Route Simulation
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  Location sharing is disabled because this booking is {booking.status}.
                </p>
              )}
            </div>

            {/* Quick Status Action Buttons */}
            {isTrackable && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Quick Job Status Actions
                </span>

                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleQuickStatusChange('ON_THE_WAY')}
                    className="w-full py-3 rounded-xl bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs transition"
                  >
                    Mark as On The Way
                  </button>
                )}

                {booking.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => handleQuickStatusChange('ARRIVED')}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                  >
                    Mark Arrived at Customer Location
                  </button>
                )}

                {booking.status === 'ARRIVED' && (
                  <button
                    onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
                  >
                    Start Service Work
                  </button>
                )}

                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleQuickStatusChange('COMPLETED')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    Mark Job Completed
                  </button>
                )}
              </div>
            )}

            {/* Customer Destination Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Customer Destination
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {booking.customer?.name}
              </h3>
              <p className="text-xs font-semibold text-navy-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {booking.customer?.phone}
              </p>
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                <span>{booking.serviceAddress}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
