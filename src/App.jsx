import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useApp } from './context/AppContext';

// Layouts
import HomeownerLayout from './components/HomeownerLayout';
import WorkerLayout from './components/WorkerLayout';

// Homeowner Pages
import Login from './pages/Homeowner/Login';
import Dashboard from './pages/Homeowner/Dashboard';
import Usage from './pages/Homeowner/Usage';
import Limits from './pages/Homeowner/Limits';
import Alerts from './pages/Homeowner/Alerts';
import Settings from './pages/Homeowner/Settings';
import Payment from './pages/Homeowner/Payment';
import PaymentHistory from './pages/Homeowner/PaymentHistory';

// Worker Pages
import WorkerLogin from './pages/Worker/WorkerLogin';
import WorkerDashboard from './pages/Worker/WorkerDashboard';
import BillingSummary from './pages/Worker/BillingSummary';

// Role-Based Router Guards
function RequireAuth({ children, allowedRole }) {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <span className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs tracking-wide">Securing session telemetry...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={allowedRole === 'worker' ? '/worker/login' : '/login'} replace />;
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'worker' ? '/worker/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Base Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* HOMEOWNER PORTAL ROUTES */}
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth allowedRole="homeowner">
                <HomeownerLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="usage" element={<Usage />} />
            <Route path="limits" element={<Limits />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route 
            path="/payment" 
            element={
              <RequireAuth allowedRole="homeowner">
                <HomeownerLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Payment />} />
            <Route path="history" element={<PaymentHistory />} />
          </Route>

          {/* UTILITY WORKER PORTAL ROUTES */}
          <Route path="/worker/login" element={<WorkerLogin />} />
          
          <Route 
            path="/worker" 
            element={
              <RequireAuth allowedRole="worker">
                <WorkerLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="billing" element={<BillingSummary />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}
