import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.message === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.message === 'auth/user-not-found') {
        setError('No homeowner account found with this email.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick select accounts for local simulation
  const QUICK_ACCOUNTS = [
    { name: 'Rajesh Kumar', email: 'rajesh@energy.com', password: 'password123', desc: 'Standard usage' },
    { name: 'Priya Sharma', email: 'priya@energy.com', password: 'password123', desc: 'High usage' },
    { name: 'Amit Patel', email: 'amit@energy.com', password: 'password123', desc: 'Flagged anomaly' },
    { name: 'Sneha Reddy', email: 'sneha@energy.com', password: 'password123', desc: 'High budget limit' },
    { name: 'Vikram Singh', email: 'vikram@energy.com', password: 'password123', desc: 'Economical fan/fridge' },
  ];

  const handleQuickLogin = async (acc) => {
    setLoading(true);
    setError('');
    try {
      await loginUser(acc.email, acc.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login with selected account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b0f19] border border-white/5 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <img src="/logo-text.png" alt="WattEveR" className="h-20 w-auto object-contain max-w-[85%] select-none pointer-events-none" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start space-x-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-sm transition flex items-center justify-center space-x-1 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#070b13] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Enter Dashboard &rarr;</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0b0f19] px-2 text-slate-550">Quick Testing Accounts</span>
          </div>
        </div>

        {/* Quick Accounts list */}
        <div className="grid grid-cols-1 gap-2">
          {QUICK_ACCOUNTS.map((acc, index) => {
            const isAnomaly = acc.desc === 'Flagged anomaly';
            return (
              <button
                key={index}
                onClick={() => handleQuickLogin(acc)}
                disabled={loading}
                className="text-left p-2.5 rounded-lg bg-white/3 border border-white/5 hover:border-cyan-500/40 hover:bg-white/5 transition flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div>
                  <p className="text-xs font-bold text-slate-200">{acc.name}</p>
                  <p className="text-[10px] text-slate-500">{acc.email}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  isAnomaly 
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                    : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                }`}>
                  {acc.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Utility portal redirect */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center text-xs">
          <Link 
            to="/worker/login" 
            className="text-slate-500 hover:text-cyan-400 flex items-center space-x-1.5 transition font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full border border-slate-500 inline-block"></span>
            <span>Are you a grid worker? Access Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
