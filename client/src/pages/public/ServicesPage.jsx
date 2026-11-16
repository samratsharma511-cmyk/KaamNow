import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CategoryIcon from '../../components/CategoryIcon';
import { Search, Clock, ArrowRight, Users } from 'lucide-react';

export default function ServicesPage() {
  const { isAuthenticated, isCustomer } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get('/services/categories');
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories
    .filter((cat) =>
      selectedCategorySlug === 'ALL' ? true : cat.slug === selectedCategorySlug
    )
    .map((cat) => {
      if (!searchText.trim()) return cat;
      const q = searchText.trim().toLowerCase();
      const catMatches =
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q);
      const matchingServices = (cat.services || []).filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
      if (catMatches) return cat;
      return { ...cat, services: matchingServices };
    })
    .filter((cat) => (cat.services || []).length > 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="bg-navy-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              KaamNow Service Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Professional Home & Vehicle Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Choose a service below to book an automatic nearby KaamSaathi dispatch or compare verified worker profiles.
            </p>
          </div>

          <div className="w-full md:w-80 bg-white rounded-2xl p-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Filter services..."
              className="w-full text-sm text-slate-900 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategorySlug === 'ALL'
                ? 'bg-navy-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories ({categories.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategorySlug === cat.slug
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CategoryIcon name={cat.name} icon={cat.icon} className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category & Services Sections */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-base font-bold text-slate-800">
              No matching services found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try clearing your filter or searching for another trade.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
                      <CategoryIcon name={cat.name} icon={cat.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {cat.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Users className="w-3 h-3" /> {cat.onlineWorkersCount || 1}+ Online KaamSaathis
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                    </div>
                  </div>

                  <Link
                    to={`/customer/search?profession=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-navy-700 bg-navy-50 hover:bg-navy-100 transition shrink-0"
                  >
                    Browse {cat.name}s <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(cat.services || []).map((svc) => (
                    <div
                      key={svc.id}
                      className="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-navy-500 transition bg-slate-50/50"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {svc.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Base Visit Charge
                          </span>
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{svc.basePrice}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {svc.estimatedDuration}
                          </span>
                        </div>

                        <Link
                          to={
                            isAuthenticated && isCustomer
                              ? `/customer/book?serviceId=${svc.id}&profession=${encodeURIComponent(
                                  cat.name
                                )}`
                              : `/customer/book?serviceId=${svc.id}`
                          }
                          className="px-4 py-2 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Book Service
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
