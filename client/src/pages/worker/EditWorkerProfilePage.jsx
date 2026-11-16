import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PROFESSIONS } from '../../utils/constants';
import {
  User,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';

export default function EditWorkerProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profession, setProfession] = useState(
    user?.workerProfile?.profession || 'Electrician'
  );
  const [bio, setBio] = useState(user?.workerProfile?.bio || '');
  const [experienceYears, setExperienceYears] = useState(
    user?.workerProfile?.experienceYears ?? 5
  );
  const [visitCharge, setVisitCharge] = useState(
    user?.workerProfile?.visitCharge ?? 199
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    user?.workerProfile?.serviceRadiusKm ?? 15
  );
  const [serviceArea, setServiceArea] = useState(
    user?.workerProfile?.serviceArea || 'Indiranagar, Koramangala, Bengaluru'
  );
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    user?.workerProfile?.availabilitySchedule || 'Mon - Sun: 8:00 AM - 8:00 PM'
  );
  const [skills, setSkills] = useState(user?.workerProfile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioImages, setPortfolioImages] = useState(
    user?.workerProfile?.portfolioImages || []
  );
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api
      .get('/workers/me/stats')
      .then(({ data }) => {
        if (data.success && data.profile) {
          const p = data.profile;
          setProfession(p.profession);
          setBio(p.bio);
          setExperienceYears(p.experienceYears);
          setVisitCharge(p.visitCharge);
          setServiceRadiusKm(p.serviceRadiusKm);
          setServiceArea(p.serviceArea);
          setAvailabilitySchedule(p.availabilitySchedule);
          setSkills(p.skills || []);
          setPortfolioImages(p.portfolioImages || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddPortfolioCard = () => {
    if (newPortfolioUrl.trim()) {
      setPortfolioImages([...portfolioImages, newPortfolioUrl.trim()]);
      setNewPortfolioUrl('');
      return;
    }
    const title = newPortfolioTitle.trim() || `${profession} Completed Project`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><rect x="32" y="32" width="536" height="336" rx="18" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/><text x="56" y="185" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="700">${title}</text><text x="56" y="228" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="16">Completed by ${name} (${profession})</text><text x="56" y="320" fill="#fbbf24" font-family="Inter, sans-serif" font-size="13" font-weight="700">KAAMNOW VERIFIED WORK PORTFOLIO</text></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setPortfolioImages([...portfolioImages, dataUri]);
    setNewPortfolioTitle('');
  };

  const handleRemovePortfolio = (index) => {
    setPortfolioImages(portfolioImages.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data } = await api.put('/workers/profile', {
        name,
        phone,
        avatarUrl,
        profession,
        bio,
        experienceYears: Number(experienceYears),
        visitCharge: Number(visitCharge),
        serviceRadiusKm: Number(serviceRadiusKm),
        serviceArea,
        availabilitySchedule,
        skills,
        portfolioImages,
      });

      if (data.success) {
        await refreshUser();
        setSuccessMsg('Your KaamSaathi professional profile has been saved!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Digital Professional Identity
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Create & Edit KaamSaathi Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showcase your trade skills, experience, visit charge, and previous work photographs to customers
            </p>
          </div>

          {user?.workerProfile?.id && (
            <Link
              to={`/customer/workers/${user.workerProfile.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-navy-700 hover:bg-slate-100"
            >
              <Eye className="w-4 h-4" /> Preview Public Profile
            </Link>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Profession *
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience, Visit Charge, Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Standard Visit Charge (₹) *
              </label>
              <input
                type="number"
                min={99}
                max={5000}
                required
                value={visitCharge}
                onChange={(e) => setVisitCharge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Radius (km) *
              </label>
              <input
                type="number"
                min={2}
                max={50}
                required
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Service Area & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Area Neighborhoods *
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Indiranagar, Domlur, Koramangala"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Working Hours / Availability *
              </label>
              <input
                type="text"
                required
                value={availabilitySchedule}
                onChange={(e) => setAvailabilitySchedule(e.target.value)}
                placeholder="Mon - Sun: 8:00 AM - 8:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Professional Description / Bio *
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your trade certifications, tools carried, and types of jobs you specialize in..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* Skills Manager */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Skills & Specializations
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill (e.g. 3-Phase MCB Wiring, Inverter Repair)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-navy-600 text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-50 text-navy-800 border border-navy-200 text-xs font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Work Photographs */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-navy-600" />
              Previous Work Photographs (Portfolio)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newPortfolioTitle}
                onChange={(e) => setNewPortfolioTitle(e.target.value)}
                placeholder="Project title (e.g. Modular Switchboard Upgrade)"
                className="sm:col-span-5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={newPortfolioUrl}
                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                placeholder="Or paste photo URL (optional)"
                className="sm:col-span-4 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddPortfolioCard}
                className="sm:col-span-3 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Portfolio
              </button>
            </div>

            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {portfolioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >
                    <img
                      src={img}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolio(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100 shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-navy-600 hover:bg-navy-700 text-white font-extrabold text-sm transition shadow-md"
            >
              {saving ? 'Saving Profile...' : 'Save Professional Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
