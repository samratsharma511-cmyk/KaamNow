import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CategoryIcon from '../../components/CategoryIcon';
import WorkerCard from '../../components/WorkerCard';
import {
  Search,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Zap,
  Award,
  Navigation,
  Users,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer, isWorker } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredWorkers, setFeaturedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, workerRes] = await Promise.all([
          api.get('/services/categories'),
          api.get('/workers?sortBy=rating'),
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (workerRes.data.success) {
          setFeaturedWorkers(workerRes.data.workers.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const target = isAuthenticated && isCustomer ? '/customer/search' : '/services';
    navigate(`${target}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 2 & 3. Hero Section + Search Bar */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                India&apos;s Managed On-Demand Service Marketplace
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Find Trusted Professionals.{' '}
                <span className="text-amber-400">Get Your Work Done.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                Book verified local electricians, plumbers, carpenters, mechanics, and AC technicians in minutes. KaamNow automatically assigns the nearest available{' '}
                <span className="text-white font-semibold">KaamSaathi</span> and lets you track their live arrival on the map.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-2.5 px-3 py-2 flex-1 text-slate-800">
                  <Search className="w-5 h-5 text-navy-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 'Electrician', 'AC Servicing', 'Tap Leak', 'Mechanic'..."
                    className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  Search Services <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Popular Tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="font-semibold text-amber-400">Popular:</span>
                {['Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Mechanic'].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        navigate(
                          `${
                            isAuthenticated && isCustomer
                              ? '/customer/search'
                              : '/services'
                          }?search=${encodeURIComponent(item)}`
                        )
                      }
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              {/* Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
                <div>
                  <p className="text-2xl font-extrabold text-amber-400">100%</p>
                  <p className="text-xs text-slate-300">Verified Profiles</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">&lt; 60s</p>
                  <p className="text-xs text-slate-300">Auto Worker Dispatch</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-400">Live GPS</p>
                  <p className="text-xs text-slate-300">Doorstep Tracking</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                      Live Dispatch Engine
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Managed Doorstep Workflow
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Real-Time Socket.IO
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Describe Problem & Pin Location
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Select your service and share your GPS coordinates or address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10">
                    <div className="w-9 h-9 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Automatic Nearest Worker Assignment
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        KaamNow matches online KaamSaathis by distance & skills and dispatches sequentially.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10">
                    <div className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Track Live Arrival & Rate Work
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Watch your assigned worker move on the live map until completion.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={
                      isAuthenticated
                        ? isWorker
                          ? '/worker/dashboard'
                          : '/customer/book'
                        : '/register?role=CUSTOMER'
                    }
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    Book a Service Now
                  </Link>
                  <Link
                    to={
                      isAuthenticated && isWorker
                        ? '/worker/dashboard'
                        : '/register?role=WORKER'
                    }
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition"
                  >
                    Join as KaamSaathi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Service Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              What Do You Need Fixed Today?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Popular Service Categories
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-600 hover:text-navy-800"
          >
            Explore All 24+ Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={
                isAuthenticated && isCustomer
                  ? `/customer/search?profession=${encodeURIComponent(cat.name)}`
                  : `/services?category=${encodeURIComponent(cat.slug)}`
              }
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-navy-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-600 group-hover:bg-navy-600 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                    <CategoryIcon name={cat.name} icon={cat.icon} className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {cat.onlineWorkersCount || 1}+ Online
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-navy-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-navy-600">
                <span>
                  Starts at ₹{cat.services?.[0]?.basePrice || 199}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Book <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. How KaamNow Works */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Simple, Fast & Reliable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How KaamNow Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Unlike traditional directories where you call ten numbers hoping someone picks up, KaamNow manages the entire booking lifecycle automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Request a Service',
                desc: 'Choose a service, describe the issue, and share your location for immediate or scheduled help.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Auto Worker Matching',
                desc: 'Our dispatch engine finds online KaamSaathis within your radius sorted by distance and rating.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Live Map Tracking',
                desc: 'Once accepted, track your assigned KaamSaathi moving in real time on an interactive map.',
                icon: Navigation,
              },
              {
                step: '04',
                title: 'Job Done & Review',
                desc: 'After the work is completed to your satisfaction, rate your KaamSaathi to build their reputation.',
                icon: Star,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/80"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-navy-600 text-amber-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Featured Professional Workers */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Verified Digital Identities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured KaamSaathi Professionals
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Browse real portfolios, skills, years of experience, and verified customer ratings.
            </p>
          </div>
          <Link
            to={isAuthenticated && isCustomer ? '/customer/search' : '/services'}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-600 hover:text-navy-800"
          >
            View All Professionals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Why Choose KaamNow? */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Built for Trust & Convenience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Why Households & Businesses Choose KaamNow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Verified Skill & Work Portfolios</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every KaamSaathi showcases their real work photographs, specializations, years of trade experience, and authentic customer reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Private & Secure Live Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time GPS coordinates are shared exclusively inside an authenticated private booking room between the assigned worker and customer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Zero-Friction Sequential Dispatch</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If one worker is busy or declines, KaamNow automatically routes your request to the next nearest online professional without manual rebooking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Opportunities for Workers (KaamSaathis) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-navy-800 to-navy-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase">
                <Award className="w-3.5 h-3.5" /> For Skilled Professionals (KaamSaathi)
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Build Your Digital Identity. Grow Your Daily Earnings.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Are you an electrician, plumber, carpenter, mechanic, painter, AC technician, or cleaning specialist? KaamNow gives you a permanent digital resume, direct nearby job requests, and complete freedom over your working hours.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Showcase photos of your past work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Set your own visit charge & service radius</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Go Online or Offline with a single tap</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Earn verified 5-star customer ratings</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  to="/register?role=WORKER"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-md"
                >
                  Register as a KaamSaathi <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/15">
                <Briefcase className="w-7 h-7 text-amber-400 mb-2" />
                <p className="text-2xl font-extrabold">8+ Trades</p>
                <p className="text-xs text-slate-300 mt-1">
                  Supported across home & vehicle repair categories
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/15">
                <TrendingUp className="w-7 h-7 text-emerald-400 mb-2" />
                <p className="text-2xl font-extrabold">Zero Cut</p>
                <p className="text-xs text-slate-300 mt-1">
                  Transparent visit charges paid directly for your skill
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/15 col-span-2">
                <Users className="w-7 h-7 text-sky-400 mb-2" />
                <p className="text-base font-bold">
                  &ldquo;Connecting Skills with Opportunities&rdquo;
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Empowering local technicians with dignified visibility, steady neighborhood jobs, and verifiable reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Call-To-Action Section */}
      <section className="py-14 bg-amber-50 border-t border-amber-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ready to Experience Hassle-Free Local Services?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Create your free Customer or KaamSaathi account in less than 60 seconds, or sign in with our pre-configured demo accounts to test live dispatch and tracking.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/register?role=CUSTOMER"
              className="px-6 py-3 rounded-xl bg-navy-600 hover:bg-navy-700 text-white font-bold text-sm transition shadow-sm"
            >
              Book a Service
            </Link>
            <Link
              to="/register?role=WORKER"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition shadow-sm"
            >
              Become a KaamSaathi
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm transition"
            >
              Try Demo Accounts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
