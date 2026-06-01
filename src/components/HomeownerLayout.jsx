import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, BarChart2, Sliders, Bell, Settings, LogOut, AlertTriangle } from 'lucide-react';

export default function HomeownerLayout() {
  const { currentUser, homeownerData, liveData, alerts, logoutUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const activeAlertsCount = alerts.length;
  const isAnomaly = homeownerData?.anomalyFlagged;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex justify-center selection:bg-cyan-500/30">
      {/* Mobile-first constraints: centered viewport mimicking a high-end app */}
      <div className="w-full max-w-md bg-[#0b0f19] shadow-2xl min-h-screen flex flex-col pb-20 border-x border-white/5 relative overflow-x-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4 fill-cyan-400/20" />
            </div>
            <div>
              <h1 className="text-xs text-slate-400 font-medium">WattEveR</h1>
              <h2 className="text-sm font-bold text-slate-200 tracking-tight leading-none">
                {homeownerData?.name || currentUser?.name || 'Loading...'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live wattage indicator */}
            <div className="px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/25 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-semibold text-cyan-400">{liveData?.totalWatts || 0} W</span>
            </div>

            {/* Anomaly banner if flagged */}
            {isAnomaly && (
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400" title="Grid operator flagged anomaly review">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
            )}

            {/* Logout button */}
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Flagged Anomaly Alert Banner */}
        {isAnomaly && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-400">Grid Anomaly Alert</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">Your utility provider has flagged this account for anomaly review. Please audit your high wattage limit settings.</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0a0e17]/90 backdrop-blur-lg border-t border-white/10 px-6 py-2.5 flex justify-between items-center z-50">
          
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 transition-all ${
                isActive ? 'text-cyan-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">Devices</span>
          </NavLink>

          <NavLink 
            to="/dashboard/usage" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 transition-all ${
                isActive ? 'text-cyan-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px]">Usage</span>
          </NavLink>

          <NavLink 
            to="/dashboard/limits" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 transition-all ${
                isActive ? 'text-cyan-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px]">Limits</span>
          </NavLink>

          <NavLink 
            to="/dashboard/alerts" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 transition-all relative ${
                isActive ? 'text-cyan-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </NavLink>

          <NavLink 
            to="/dashboard/settings" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 transition-all ${
                isActive ? 'text-cyan-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Budget</span>
          </NavLink>
          
        </nav>

      </div>
    </div>
  );
}
