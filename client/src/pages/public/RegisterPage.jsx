import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PROFESSIONS, BENGALURU_DEFAULT_CENTER } from '../../utils/constants';
import {
  User,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'WORKER' ? 'WORKER' : 'CUSTOMER';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: 'Indiranagar, Bengaluru, Karnataka',
    latitude: BENGALURU_DEFAULT_CENTER.latitude,
    longitude: BENGALURU_DEFAULT_CENTER.longitude,
    profession: 'Electrician',
    experienceYears: 3,
    visitCharge: 199,
    serviceArea: 'Indiranagar, Koramangala, Domlur',
    skillsInput: 'MCB Wiring, Ceiling Fan Installation, Inverter Setup',
    bio: '',
  });

  const [geoStatus, setGeoStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }
    setGeoStatus('Detecting GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setGeoStatus('GPS coordinates captured!');
      },
      () => {
        setGeoStatus('Location permission denied. Using default Bengaluru coordinates.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      if (role === 'WORKER') {
        payload.profession = formData.profession;
        payload.experienceYears = Number(formData.experienceYears);
        payload.visitCharge = Number(formData.visitCharge);
        payload.serviceArea = formData.serviceArea;
        payload.skills = formData.skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        payload.bio = formData.bio;
      }

      const res = await register(payload);
      if (res.success) {
        navigate(
          res.user.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Create Your KaamNow Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connecting Skills with Opportunities across India
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              role === 'CUSTOMER'
                ? 'bg-navy-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> I am a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('WORKER')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              role === 'WORKER'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" /> I am a Worker (KaamSaathi)
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'WORKER' ? 'e.g. Ramesh Kumar' : 'e.g. Aarav Sharma'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98450 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min 6 chars) *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Primary Address / Neighborhood
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-600 hover:text-navy-800"
              >
                <Navigation className="w-3 h-3" /> Use My Current GPS
              </button>
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
            {geoStatus && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {geoStatus} ({formData.latitude},{' '}
                {formData.longitude})
              </p>
            )}
          </div>

          {/* Worker-Specific Professional Fields */}
          {role === 'WORKER' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                KaamSaathi Professional Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Profession *
                  </label>
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {PROFESSIONS.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    min={0}
                    max={50}
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visit Charge (₹)
                  </label>
                  <input
                    type="number"
                    name="visitCharge"
                    min={99}
                    max={5000}
                    value={formData.visitCharge}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Areas Covered
                </label>
                <input
                  type="text"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  placeholder="e.g. Indiranagar, Koramangala, HSR Layout"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills & Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleChange}
                  placeholder="MCB Repair, Inverter Wiring, Ceiling Fan Installation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Professional Description
                </label>
                <textarea
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell customers about your trade experience, tools, and work quality..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition shadow-sm ${
              role === 'WORKER'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-navy-600 hover:bg-navy-700 text-white'
            }`}
          >
            {submitting
              ? 'Creating Account...'
              : role === 'WORKER'
              ? 'Register as KaamSaathi'
              : 'Create Customer Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-navy-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
