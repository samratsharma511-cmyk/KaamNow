import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Navigation, MapPin, Calendar, Phone, FileText } from 'lucide-react';

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data } = await api.get('/bookings/my');
        if (data.success) {
          setJobs(data.bookings || []);
        }
      } catch (err) {
        console.error('Error loading worker jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'ACTIVE') {
      return ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(j.status);
    }
    if (filter === 'COMPLETED') {
      return j.status === 'COMPLETED';
    }
    if (filter === 'CANCELLED') {
      return j.status === 'CANCELLED';
    }
    return j.status !== 'REQUESTED';
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            KaamSaathi Job Log
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">My Jobs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your active assignments and view your completed service history
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: 'All Assigned Jobs' },
            { key: 'ACTIVE', label: 'Active Jobs' },
            { key: 'COMPLETED', label: 'Completed Jobs' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-56 rounded-3xl bg-white border border-slate-200 animate-pulse" />
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
            <p className="text-base font-bold text-slate-800">No jobs in this view</p>
            <p className="text-xs text-slate-500">
              Check your Job Requests queue to accept new customer bookings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isActive = [
                'ACCEPTED',
                'ON_THE_WAY',
                'ARRIVED',
                'IN_PROGRESS',
              ].includes(job.status);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{job.bookingNumber}
                      </span>
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(job.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {job.service?.name}
                    </h3>

                    <p className="text-xs text-slate-600">{job.problemDescription}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="font-bold text-slate-800">
                        Customer: {job.customer?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-navy-600" />
                        {job.customer?.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-navy-600" />
                        {job.serviceAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-end justify-between gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Job Payout
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{job.finalAmount || job.visitCharge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/worker/jobs/${job.id}/active`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <FileText className="w-3.5 h-3.5" /> Job Details
                      </Link>
                      {isActive && (
                        <Link
                          to={`/worker/jobs/${job.id}/navigate`}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Navigate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
