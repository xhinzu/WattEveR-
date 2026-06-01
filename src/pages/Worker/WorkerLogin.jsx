import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Shield, Mail, Lock, Home, ArrowRight, AlertCircle } from 'lucide-react';
import { playButtonClick } from '../../utils/sounds';

export default function WorkerLogin() {
  const { loginUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    playButtonClick();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginUser(email, password);
      navigate('/worker/dashboard');
    } catch (err) {
      console.error(err);
      if (err.message === 'auth/wrong-password' || err.message === 'auth/user-not-found') {
        setError('Invalid worker credentials. Please check details.');
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    playButtonClick();
    setLoading(true);
    setError('');
    try {
      await loginUser('worker@grid.com', 'worker123');
      navigate('/worker/dashboard');
    } catch (err) {
      setError('Failed to login with grid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b13] text-slate-700 dark:text-slate-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-xl rounded-2xl p-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold mt-3 tracking-tight text-slate-900 dark:text-slate-100">
            WattEveR Grid Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Utility Operations & Telemetry Center</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 flex items-start space-x-2 text-red-655 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Worker Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                placeholder="worker@grid.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition flex items-center justify-center space-x-1 shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Operator Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#0b0f19] px-2 text-slate-400 dark:text-slate-505">Operator Sandbox</span>
          </div>
        </div>

        {/* Quick Login for developers */}
        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full py-2 rounded-lg border border-dashed border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
        >
          <span>Auto-fill Operator Credentials</span>
        </button>

        {/* Homeowner portal redirect */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-center text-xs">
          <Link 
            to="/login" 
            onClick={playButtonClick}
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 transition font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Homeowner Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
