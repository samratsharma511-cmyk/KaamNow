import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Award,
  Image as ImageIcon,
} from 'lucide-react';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWorker() {
      setLoading(true);
      try {
        const lat = user?.latitude || 12.9716;
        const lng = user?.longitude || 77.6412;
        const { data } = await api.get(`/workers/${id}?lat=${lat}&lng=${lng}`);
        if (data.success) {
          setWorker(data.worker);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load worker profile.');
      } finally {
        setLoading(false);
      }
    }
    loadWorker();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center space-y-4">
        <p className="text-lg font-bold text-slate-800">{error || 'Worker not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-navy-600 text-white text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </button>

        {/* Top Identity Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-600 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="relative">
                  <img
                    src={worker.avatarUrl}
                    alt={worker.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-lg bg-navy-700"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border-2 border-navy-900 ${
                      worker.isOnline
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-400 text-slate-950'
                    }`}
                  >
                    {worker.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold">
                      {worker.name}
                    </h1>
                    {worker.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified KaamSaathi
                      </span>
                    )}
                  </div>

                  <p className="text-amber-400 font-bold text-base mt-0.5">
                    {worker.profession}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-200 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {worker.averageRating} ({worker.totalReviews} reviews)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                      {worker.experienceYears} Years Experience
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {worker.completedJobsCount} Jobs Completed
                    </span>
                    {worker.distanceKm !== null && (
                      <span className="px-2 py-0.5 rounded bg-white/10 font-semibold">
                        {worker.distanceKm} km from you
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 w-full sm:w-auto text-left sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
                  Standard Visit Charge
                </span>
                <span className="text-2xl font-extrabold text-white">
                  ₹{worker.visitCharge}
                </span>
                <div className="mt-3">
                  <Link
                    to={`/customer/book?workerId=${worker.id}&profession=${encodeURIComponent(
                      worker.profession
                    )}`}
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md"
                  >
                    <Calendar className="w-4 h-4" /> Book {worker.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bio, Service Area & Availability */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  About This KaamSaathi
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {worker.bio}
                </p>
              </div>

              {/* Skills & Specializations */}
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Skills & Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(worker.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-50 text-navy-800 border border-navy-100 text-xs font-semibold"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services Provided */}
              {worker.services && worker.services.length > 0 && (
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Services Offered
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {worker.services.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                      >
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            {svc.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {svc.estimatedDuration}
                          </p>
                        </div>
                        <Link
                          to={`/customer/book?serviceId=${svc.id}&workerId=${worker.id}`}
                          className="px-3 py-1.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold shrink-0"
                        >
                          ₹{svc.customPrice || svc.basePrice} • Book
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Work Portfolio Photographs */}
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-navy-600" />
                  Previous Work Portfolio ({worker.portfolioImages?.length || 0})
                </h2>
                {worker.portfolioImages && worker.portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {worker.portfolioImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video"
                      >
                        <img
                          src={imgUrl}
                          alt={`${worker.name} portfolio work ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No portfolio photos uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Right Sidebar Details */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Service Coverage & Schedule
                </h3>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Service Area</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {worker.serviceArea} (up to {worker.serviceRadiusKm} km radius)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Working Hours</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {worker.availabilitySchedule}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Identity & Skill Status
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Verified KaamSaathi Professional Profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Customer Reviews ({worker.reviews?.length || 0})
              </h2>
              <p className="text-xs text-slate-500">
                Submitted by verified customers after completed bookings
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              {worker.averageRating} / 5.0
            </div>
          </div>

          {!worker.reviews || worker.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No written reviews yet for this professional.
            </p>
          ) : (
            <div className="space-y-4">
              {worker.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.customerAvatar ? (
                        <img
                          src={rev.customerAvatar}
                          alt={rev.customerName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-navy-600 text-white text-xs font-bold flex items-center justify-center">
                          {rev.customerName?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {rev.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-slate-700 leading-relaxed">
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
  );
}
