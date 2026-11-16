import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  MapPin,
  Zap,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero */}
        <div className="bg-navy-800 rounded-3xl p-8 sm:p-12 text-white space-y-4">
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase">
            About KaamNow
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Connecting Skills with Opportunities Across India
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            KaamNow is a managed on-demand service marketplace designed to solve two fundamental challenges: helping households reliably book verified local tradespeople in minutes, and giving India&apos;s skilled workers (**KaamSaathis**) a dignified digital professional identity.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Digital Professional Identity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every electrician, plumber, carpenter, painter, and mechanic gets a permanent online portfolio displaying their experience, verified customer reviews, and photos of completed work.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Managed Automatic Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of cold-calling directories, customers submit a request once. KaamNow calculates Haversine distances and automatically dispatches the nearest online KaamSaathi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Authorized Live GPS Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once a worker accepts a job, location updates stream over private, JWT-authenticated Socket.IO rooms exclusively to the customer who booked the service.
            </p>
          </div>
        </div>

        {/* Two-Sided Value Proposition */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              For Customers & Households
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Transparent starting visit charges before you book
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Filter workers by distance, star rating, price, and live availability
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Real-time booking status updates from Accepted to Completed
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Verified post-completion rating & review system
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:underline"
              >
                Browse Services <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              For Workers (KaamSaathis)
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                Receive instant neighborhood job alerts based on your GPS location
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                Full control to toggle Online/Offline and accept or decline requests
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                Track completed jobs, earnings ledger, and customer feedback
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                Build long-term career credibility with verified reviews
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/register?role=WORKER"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:underline"
              >
                Register as KaamSaathi <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
