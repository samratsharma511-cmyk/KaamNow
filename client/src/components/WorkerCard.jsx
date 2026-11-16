import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function WorkerCard({ worker, showBookButton = true }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={worker.avatarUrl}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-navy-600"
            />
            <span
              title={worker.isOnline ? 'Online & Available' : 'Currently Offline'}
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                worker.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {worker.name}
              </h3>
              {worker.isVerified && (
                <span
                  title="Verified KaamSaathi"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-navy-600 mt-0.5">
              {worker.profession}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {worker.averageRating || 'New'}
                <span className="text-slate-500 font-normal">
                  ({worker.totalReviews || 0})
                </span>
              </span>

              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {worker.experienceYears} yrs exp
              </span>

              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {worker.completedJobsCount || 0} jobs
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {worker.bio}
        </p>

        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 text-[11px]">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-navy-600 shrink-0" />
            <span className="truncate">{worker.serviceArea}</span>
          </span>
          {worker.distanceKm !== null && worker.distanceKm !== undefined ? (
            <span className="font-semibold text-navy-600 bg-navy-50 px-2 py-0.5 rounded-md">
              {worker.distanceKm} km away
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {worker.isOnline ? 'Available Now' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-slate-500 block">Visit Charge</span>
          <span className="text-base font-extrabold text-slate-900">
            ₹{worker.visitCharge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/customer/workers/${worker.id}`}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-navy-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
          >
            View Profile
          </Link>
          {showBookButton && (
            <Link
              to={`/customer/book?workerId=${worker.id}&profession=${encodeURIComponent(
                worker.profession
              )}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-600 text-white hover:bg-navy-700 transition shadow-sm"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
