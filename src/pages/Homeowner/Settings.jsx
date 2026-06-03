import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Settings as SettingsIcon, IndianRupee, Save, Check, User, MapPin, Mail, Activity, History, Sun, Moon } from 'lucide-react';
import { playButtonClick } from '../../utils/sounds';

const themesList = [
  { name: 'cyan', hex: '#00e5ff', label: 'Cyan' },
  { name: 'red', hex: '#ff4757', label: 'Red' },
  { name: 'blue', hex: '#1e90ff', label: 'Blue' },
  { name: 'violet', hex: '#a55eea', label: 'Violet' },
  { name: 'yellow', hex: '#ffa502', label: 'Yellow' },
  { name: 'green', hex: '#2ed573', label: 'Green' },
];

export default function Settings() {
  const { homeownerData, setBudget, theme, toggleTheme, themeColor, setThemeColor } = useApp();
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
    playButtonClick();
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
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          <span>Profile & Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage account thresholds & budget parameters</p>
      </div>

      {/* Interface Theme Toggle Card */}
      <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-4">
        {/* Toggle Mode Row */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interface Theme</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Active mode: <span className="font-semibold capitalize text-cyan-600 dark:text-cyan-400">{theme} Mode</span></p>
          </div>

          <button 
            onClick={() => { playButtonClick(); toggleTheme(); }}
            className="focus:outline-none cursor-pointer p-1 relative flex items-center"
            aria-label="Toggle Theme"
          >
            <div className="w-12 h-6 bg-slate-300 dark:bg-slate-800 rounded-full transition-colors relative">
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-cyan-400 shadow-md flex items-center justify-center transition-all transform duration-300 ${theme === 'dark' ? 'translate-x-6' : ''}`}>
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-[#070b13]" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-white/5" />

        {/* Theme Color selector Row */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">App Theme Color</h3>
          </div>

          {/* Color Circles Row */}
          <div className="flex items-center space-x-3.5">
            {themesList.map((t) => {
              const isSelected = themeColor === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setThemeColor(t.name);
                  }}
                  style={{ backgroundColor: t.hex }}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-300 relative focus:outline-none ${
                    isSelected 
                      ? 'border-2 border-white ring-2 ring-slate-400 dark:ring-white/20 scale-110 shadow-lg shadow-black/20' 
                      : 'border border-black/10 dark:border-white/10 hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  title={t.label}
                  aria-label={`Select ${t.label} Theme`}
                />
              );
            })}
          </div>

          {/* Active Label below */}
          <p className="text-[10px] text-slate-550 dark:text-slate-500 font-medium">
            Active: <span className="font-semibold" style={{ color: themesList.find(t => t.name === themeColor)?.hex || '#00e5ff' }}>
              {themesList.find(t => t.name === themeColor)?.label || 'Cyan'}
            </span>
          </p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connection details</h3>
        
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 text-xs">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 font-medium">Name:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{homeownerData?.name || 'Loading...'}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Mail className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 font-medium">Email:</span>
            <span className="text-slate-800 dark:text-slate-200">{homeownerData?.email || 'Loading...'}</span>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 font-medium">Address:</span>
            <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{homeownerData?.address || 'Loading...'}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs pt-1 border-t border-slate-200 dark:border-white/5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 font-medium">Grid Status:</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-bold">ACTIVE & CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <Link
        to="/payment/history"
        className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-cyan-500/20 transition flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
      >
        <span className="flex items-center space-x-2.5">
          <History className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400" />
          <span>View Payment History</span>
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">→</span>
      </Link>

      {/* Budget Set Card */}
      <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Bill Budget</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Define your monthly spending limit to trigger budget projection alerts.</p>
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <input
              type="number"
              min="500"
              max="20000"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              saved 
                ? 'bg-emerald-500 text-white dark:text-[#070b13]' 
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
