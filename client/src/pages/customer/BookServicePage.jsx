import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapView from '../../components/MapView';
import {
  MapPin,
  Navigation,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Camera,
  Zap,
} from 'lucide-react';

export default function BookServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedServiceId = searchParams.get('serviceId') || '';
  const preselectedWorkerId = searchParams.get('workerId') || '';
  const preselectedProfession = searchParams.get('profession') || '';

  const [categories, setCategories] = useState([]);
  const [preferredWorker, setPreferredWorker] = useState(null);

  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId);
  const [problemDescription, setProblemDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState(
    user?.address || '42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru'
  );
  const [latitude, setLatitude] = useState(user?.latitude || 12.9716);
  const [longitude, setLongitude] = useState(user?.longitude || 77.6412);
  const [isImmediate, setIsImmediate] = useState(true);
  const [scheduledAt, setScheduledAt] = useState(() => {
    const tomorrow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [problemPhotoUrl, setProblemPhotoUrl] = useState('');

  const [geoStatus, setGeoStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFormResources() {
      try {
        const { data } = await api.get('/services/categories');
        if (data.success) {
          setCategories(data.categories);
          if (!selectedServiceId && data.categories.length > 0) {
            if (preselectedProfession) {
              const matchingCat = data.categories.find(
                (c) => c.name.toLowerCase() === preselectedProfession.toLowerCase()
              );
              if (matchingCat?.services?.[0]) {
                setSelectedServiceId(String(matchingCat.services[0].id));
                return;
              }
            }
            if (data.categories[0]?.services?.[0]) {
              setSelectedServiceId(String(data.categories[0].services[0].id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    }
    loadFormResources();
  }, [preselectedProfession, selectedServiceId]);

  useEffect(() => {
    if (!preselectedWorkerId) return;
    api
      .get(`/workers/${preselectedWorkerId}`)
      .then(({ data }) => {
        if (data.success) setPreferredWorker(data.worker);
      })
      .catch(() => {});
  }, [preselectedWorkerId]);

  const allServices = categories.flatMap((cat) =>
    (cat.services || []).map((svc) => ({ ...svc, categoryName: cat.name }))
  );
  const activeService = allServices.find(
    (s) => String(s.id) === String(selectedServiceId)
  );

  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Browser Geolocation API is not available.');
      return;
    }
    setGeoStatus('Obtaining live GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setGeoStatus('GPS location pinned on map!');
      },
      () => {
        setGeoStatus(
          'Location permission denied. You can also click anywhere on the map to set your pin.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAttachSampleProblemPhoto = () => {
    const label = activeService?.name || 'Service Issue Snapshot';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" rx="18" fill="#1e293b"/><rect x="28" y="28" width="544" height="304" rx="12" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,8"/><text x="50%" y="46%" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" font-weight="700">Customer Problem Snapshot</text><text x="50%" y="58%" text-anchor="middle" fill="#fbbf24" font-family="Inter, sans-serif" font-size="16">${label}</text></svg>`;
    setProblemPhotoUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        serviceId: Number(selectedServiceId),
        problemDescription,
        serviceAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        isImmediate,
        scheduledAt: isImmediate ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
        problemPhotoUrl: problemPhotoUrl || null,
        preferredWorkerId: preferredWorker ? preferredWorker.id : null,
      };

      const { data } = await api.post('/bookings', payload);
      if (data.success && data.booking) {
        navigate(`/customer/bookings/${data.booking.id}/confirmation`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create booking. Please check all fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Managed Doorstep Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Book a Skilled Professional
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Submit your service requirements below. KaamNow will automatically locate and request the nearest online KaamSaathi within your radius.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Left Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            {preferredWorker && (
              <div className="p-4 rounded-2xl bg-navy-50 border border-navy-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={preferredWorker.avatarUrl}
                    alt={preferredWorker.name}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-navy-900">
                      Preferred KaamSaathi: {preferredWorker.name}
                    </p>
                    <p className="text-[11px] text-navy-700">
                      {preferredWorker.profession} • Visit Charge ₹{preferredWorker.visitCharge}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferredWorker(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  Change
                </button>
              </div>
            )}

            {/* 1. Select Service */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Select Service Required *
              </label>
              <select
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {(cat.services || []).map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} — ₹{svc.basePrice} ({svc.estimatedDuration})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* 2. Problem Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. Describe the Problem / Work Needed *
              </label>
              <textarea
                required
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Example: Living room 16A AC switchboard sparked and MCB is tripping repeatedly..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            {/* 3. Timing Selection: Immediate vs Scheduled */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Preferred Booking Time *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsImmediate(true)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition ${
                    isImmediate
                      ? 'bg-navy-600 border-navy-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Request Immediately (Now)
                </button>
                <button
                  type="button"
                  onClick={() => setIsImmediate(false)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition ${
                    !isImmediate
                      ? 'bg-navy-600 border-navy-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Schedule for Later
                </button>
              </div>

              {!isImmediate && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required={!isImmediate}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              )}
            </div>

            {/* 4. Service Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                4. Complete Doorstep Address *
              </label>
              <input
                type="text"
                required
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="House/Flat No., Floor, Building, Street, Landmark, City"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            {/* 5. Optional Problem Photograph */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  5. Optional Problem Photograph URL
                </label>
                <button
                  type="button"
                  onClick={handleAttachSampleProblemPhoto}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-600 hover:underline"
                >
                  <Camera className="w-3.5 h-3.5" /> Attach Sample Issue Snapshot
                </button>
              </div>
              <input
                type="text"
                value={problemPhotoUrl}
                onChange={(e) => setProblemPhotoUrl(e.target.value)}
                placeholder="Paste image URL or click 'Attach Sample Issue Snapshot'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
              {problemPhotoUrl && (
                <div className="mt-2 relative w-44 h-28 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={problemPhotoUrl}
                    alt="Problem preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              {submitting
                ? 'Creating Booking & Dispatching Nearest KaamSaathi...'
                : 'Confirm Booking & Find Nearest KaamSaathi'}
            </button>
          </div>

          {/* Right Column: Interactive Map Pin + Price Summary */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pin Exact Service Location
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click anywhere on the map or use browser GPS
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy-50 text-navy-700 hover:bg-navy-100 text-xs font-bold transition"
                >
                  <Navigation className="w-3.5 h-3.5" /> Detect GPS
                </button>
              </div>

              {geoStatus && (
                <p className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {geoStatus}
                </p>
              )}

              <MapView
                customerLocation={{ latitude, longitude }}
                customerLabel={serviceAddress}
                onSelectLocation={({ latitude: lat, longitude: lng }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                heightClass="h-64"
              />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Latitude
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {latitude}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Longitude
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {longitude}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimate Card */}
            <div className="bg-navy-900 text-white rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                Booking Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Service</span>
                  <span className="font-bold text-white">
                    {activeService?.name || 'Select a service'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Mode</span>
                  <span className="font-semibold text-emerald-400">
                    {isImmediate ? 'Immediate Auto-Dispatch' : 'Scheduled'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                  <span className="font-bold">Standard Visit Charge</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    ₹{preferredWorker?.visitCharge || activeService?.basePrice || 199}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                No advance online payment required. Pay your assigned KaamSaathi directly after the job is completed.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
