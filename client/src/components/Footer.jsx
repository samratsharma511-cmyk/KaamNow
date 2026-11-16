import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Kaam<span className="text-amber-400">Now</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Connecting Skills with Opportunities
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s trusted on-demand service marketplace connecting households with verified local electricians, plumbers, carpenters, mechanics, and technicians.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Popular Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/services?category=electrician" className="hover:text-amber-400 transition">
                  Electrician & Wiring
                </Link>
              </li>
              <li>
                <Link to="/services?category=plumber" className="hover:text-amber-400 transition">
                  Plumber & Leak Repair
                </Link>
              </li>
              <li>
                <Link to="/services?category=ac-technician" className="hover:text-amber-400 transition">
                  AC Servicing & Repair
                </Link>
              </li>
              <li>
                <Link to="/services?category=carpenter" className="hover:text-amber-400 transition">
                  Carpenter & Woodwork
                </Link>
              </li>
              <li>
                <Link to="/services?category=mechanic" className="hover:text-amber-400 transition">
                  Doorstep Bike & Car Mechanic
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-amber-400 transition">
                  About KaamNow
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-400 transition">
                  All Service Categories
                </Link>
              </li>
              <li>
                <Link to="/register?role=CUSTOMER" className="hover:text-amber-400 transition">
                  Register as Customer
                </Link>
              </li>
              <li>
                <Link to="/register?role=WORKER" className="hover:text-amber-400 transition">
                  Join as a KaamSaathi (Worker)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Sign In to Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Contact */}
          <div className="space-y-2.5 text-xs text-slate-400">
            <h4 className="text-sm font-bold text-white mb-3">Trust & Support</h4>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Verified KaamSaathi Digital Profiles
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              Indiranagar, Bengaluru, Karnataka 560038
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              +91 80 4567 8900 (8 AM – 9 PM)
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              support@kaamnow.in
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} KaamNow Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Built for India&apos;s Skilled Workforce & Households</p>
        </div>
      </div>
    </footer>
  );
}
