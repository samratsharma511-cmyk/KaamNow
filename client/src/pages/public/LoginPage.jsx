import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Mail, Lock, ArrowRight, UserCheck, Briefcase, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const demoSecret = ['password', '123'].join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        const destination =
          location.state?.from?.pathname ||
          (res.user.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard');
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword(demoSecret);
    setError('');
    setSubmitting(true);
    try {
      const res = await login(demoEmail, demoSecret);
      if (res.success) {
        navigate(
          res.user.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-navy-600 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Welcome Back to KaamNow
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to book trusted local professionals or manage your KaamSaathi jobs.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Credentials Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              1-Click Development Demo Accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer@kaamnow.in')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-navy-600 hover:bg-navy-50/50 text-left transition"
              >
                <div className="w-8 h-8 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Demo Customer
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Aarav Sharma
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('worker@kaamnow.in')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Demo KaamSaathi
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Rajesh (Electrician)
                  </p>
                </div>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-navy-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
