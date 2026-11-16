import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages (5)
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';

// Customer Dashboard Pages (9)
import CustomerHome from './pages/customer/CustomerHome';
import SearchResultsPage from './pages/customer/SearchResultsPage';
import WorkerProfilePage from './pages/customer/WorkerProfilePage';
import BookServicePage from './pages/customer/BookServicePage';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';
import LiveTrackingPage from './pages/customer/LiveTrackingPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingDetailsPage from './pages/customer/BookingDetailsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Worker Dashboard Pages (9)
import WorkerHome from './pages/worker/WorkerHome';
import EditWorkerProfilePage from './pages/worker/EditWorkerProfilePage';
import JobRequestsPage from './pages/worker/JobRequestsPage';
import ActiveJobDetailsPage from './pages/worker/ActiveJobDetailsPage';
import LiveNavigationPage from './pages/worker/LiveNavigationPage';
import MyJobsPage from './pages/worker/MyJobsPage';
import EarningsPage from './pages/worker/EarningsPage';
import ReviewsRatingsPage from './pages/worker/ReviewsRatingsPage';
import WorkerSettingsPage from './pages/worker/WorkerSettingsPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          {/* Public worker profile view */}
          <Route path="/customer/workers/:id" element={<WorkerProfilePage />} />

          {/* Customer Protected Pages */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/search"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <SearchResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/book"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <BookServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id/confirmation"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id/track"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <LiveTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Worker (KaamSaathi) Protected Pages */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile/edit"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <EditWorkerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/requests"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <JobRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/jobs/:id/active"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <ActiveJobDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/jobs/:id/navigate"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <LiveNavigationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/jobs"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/earnings"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <EarningsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/reviews"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <ReviewsRatingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/settings"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
