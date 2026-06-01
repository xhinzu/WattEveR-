import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, LayoutDashboard, Receipt, LogOut, Radio } from 'lucide-react';

export default function WorkerLayout() {
  const { currentUser, logoutUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/worker/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200">
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/10">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">WattEveR Grid Portal</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Grid Operator: {currentUser?.name || 'Authorized Session'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full font-medium">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-ping" />
            <span>Telemetry Link: Live (5s)</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50/50 px-3.5 py-2 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] shrink-0 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1.5">
          <NavLink
            to="/worker/dashboard"
            className={({ isActive }) => 
              `w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Grid Monitor</span>
          </NavLink>

          <NavLink
            to="/worker/billing"
            className={({ isActive }) => 
              `w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Receipt className="w-4.5 h-4.5" />
            <span>Billing Reports</span>
          </NavLink>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
