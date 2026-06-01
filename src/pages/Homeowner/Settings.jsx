import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Settings as SettingsIcon, IndianRupee, Save, Check, User, MapPin, Mail, Activity, History } from 'lucide-react';

export default function Settings() {
  const { homeownerData, setBudget } = useApp();
  const [budgetVal, setBudgetVal] = useState(2000);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (homeownerData?.monthlyBudget) {
      setBudgetVal(homeownerData.monthlyBudget);
    }
  }, [homeownerData]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await setBudget(Number(budgetVal));
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>Profile & Settings</span>
        </h2>
        <p className="text-xs text-slate-400">Manage account thresholds & budget parameters</p>
      </div>

      {/* Profile Details Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connection details</h3>
        
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 text-xs">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 w-16 shrink-0 font-medium">Name:</span>
            <span className="text-slate-200 font-semibold">{homeownerData?.name || 'Loading...'}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Mail className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 w-16 shrink-0 font-medium">Email:</span>
            <span className="text-slate-200">{homeownerData?.email || 'Loading...'}</span>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
            <span className="text-slate-400 w-16 shrink-0 font-medium">Address:</span>
            <span className="text-slate-200 leading-relaxed">{homeownerData?.address || 'Loading...'}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs pt-1 border-t border-white/5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400 w-16 shrink-0 font-medium">Grid Status:</span>
            <span className="text-emerald-400 font-bold">ACTIVE & CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <Link
        to="/payment/history"
        className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-between text-xs font-bold text-slate-200"
      >
        <span className="flex items-center space-x-2.5">
          <History className="w-4.5 h-4.5 text-cyan-400" />
          <span>View Payment History</span>
        </span>
        <span className="text-[10px] text-slate-500 font-semibold">→</span>
      </Link>

      {/* Budget Set Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Bill Budget</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Define your monthly spending limit to trigger budget projection alerts.</p>
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="number"
              min="500"
              max="20000"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-slate-200 text-sm font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              saved 
                ? 'bg-emerald-500 text-[#070b13]' 
                : 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13]'
            }`}
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-[#070b13] border-t-transparent rounded-full animate-spin"></span>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                <span>Budget Updated Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Budget</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
