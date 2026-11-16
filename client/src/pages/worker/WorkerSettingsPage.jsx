import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Power,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WorkerSettingsPage() {
  const { user, refreshUser } = useAuth();

  const [isOnline, setIsOnline] = useState(
    user?.workerProfile?.isOnline ?? true
  );
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    user?.workerProfile?.availabilitySchedule || 'Mon - Sun: 8:00 AM - 8:00 PM'
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    user?.workerProfile?.serviceRadiusKm ?? 15
  );
  const [latitude, setLatitude] = useState(
    user?.workerProfile?.location?.latitude || user?.latitude || 12.9784
  );
  const [longitude, setLongitude] = useState(
    user?.workerProfile?.location?.longitude || user?.longitude || 77.6408
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/workers/me/stats')
      .then(({ data }) => {
        if (data.success && data.profile) {
          setIsOnline(data.profile.isOnline);
          setAvailabilitySchedule(data.profile.availabilitySchedule);
          setServiceRadiusKm(data.profile.serviceRadiusKm);
          if (data.profile.location) {
            setLatitude(data.profile.location.latitude);
            setLongitude(data.profile.location.longitude);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(Number(pos.coords.latitude.toFixed(6)));
      setLongitude(Number(pos.coords.longitude.toFixed(6)));
      setMessage('Detected current GPS coordinates! Click Save Settings to apply.');
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/workers/availability', {
        isOnline,
        availabilitySchedule,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      await api.put('/workers/profile', {
        serviceRadiusKm: Number(serviceRadiusKm),
        availabilitySchedule,
        isOnline,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      await refreshUser();
      setMessage('KaamSaathi availability & dispatch settings saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Dispatch & Availability Preferences
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            KaamSaathi Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your online availability, working hours, maximum travel radius, and base GPS location
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Online / Offline Switch */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Power
                  className={`w-4 h-4 ${
                    isOnline ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                Online Dispatch Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When ONLINE, KaamNow automatically routes nearby customer service requests to you
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                isOnline
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-navy-600" />
                Working Schedule
              </label>
              <input
                type="text"
                value={availabilitySchedule}
                onChange={(e) => setAvailabilitySchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-navy-600" />
                Max Service Radius (km)
              </label>
              <input
                type="number"
                min={2}
                max={50}
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Current Base GPS Coordinates
              </span>
              <button
                type="button"
                onClick={handleDetectGps}
                className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:underline"
              >
                <Navigation className="w-3.5 h-3.5" /> Update from Browser GPS
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
