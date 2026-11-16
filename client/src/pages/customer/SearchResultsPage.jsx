import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import WorkerCard from '../../components/WorkerCard';
import { PROFESSIONS } from '../../utils/constants';
import { Search, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

export default function SearchResultsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [profession, setProfession] = useState(searchParams.get('profession') || 'ALL');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [maxDistance, setMaxDistance] = useState(searchParams.get('maxDistance') || '');
  const [onlineOnly, setOnlineOnly] = useState(
    searchParams.get('onlineOnly') === 'true'
  );
  const [sortBy, setSortBy] = useState('recommended');

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (profession && profession !== 'ALL') params.set('profession', profession);
      if (minRating) params.set('minRating', minRating);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (maxDistance) params.set('maxDistance', maxDistance);
      if (onlineOnly) params.set('onlineOnly', 'true');
      if (sortBy) params.set('sortBy', sortBy);
      params.set('lat', user?.latitude || 12.9716);
      params.set('lng', user?.longitude || 77.6412);

      const { data } = await api.get(`/workers?${params.toString()}`);
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error('Error searching workers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, profession, minRating, maxPrice, maxDistance, onlineOnly, sortBy, user]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleResetFilters = () => {
    setSearch('');
    setProfession('ALL');
    setMinRating('');
    setMaxPrice('');
    setMaxDistance('');
    setOnlineOnly(false);
    setSortBy('recommended');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header + Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Search Skilled Professionals (KaamSaathis)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter by trade, distance, star rating, starting visit charge, and live availability
              </p>
            </div>
            <Link
              to="/customer/book"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Auto-Assign Nearest Worker
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skill, service, or name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            {/* Profession Filter */}
            <div className="md:col-span-2">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="ALL">All Professions</option>
                {PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div className="md:col-span-2">
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="">Any Distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="15">Within 15 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="md:col-span-2">
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="">Any Rating</option>
                <option value="4.8">4.8★ & above</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.0">4.0★ & above</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="md:col-span-2">
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="">Any Visit Charge</option>
                <option value="200">Up to ₹200</option>
                <option value="250">Up to ₹250</option>
                <option value="300">Up to ₹300</option>
                <option value="500">Up to ₹500</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded border-slate-300 text-navy-600 focus:ring-navy-600"
                />
                Show Online Workers Only
              </label>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-600"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="recommended">Recommended</option>
                <option value="distance">Nearest Distance</option>
                <option value="rating">Highest Rating</option>
                <option value="price_low">Lowest Visit Charge</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {loading
              ? 'Searching database...'
              : `${workers.length} Verified Professional${workers.length === 1 ? '' : 's'} Found`}
          </p>
        </div>

        {/* Worker Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-800">
              No KaamSaathis matched your current filters
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try expanding your maximum distance, clearing the price ceiling, or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-navy-600 text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
