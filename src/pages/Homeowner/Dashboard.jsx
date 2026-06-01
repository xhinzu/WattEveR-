import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wind, Snowflake, Tv, Disc, Fan, AlertTriangle, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { playToggleOn, playToggleOff } from '../../utils/sounds';

const DEVICE_ICONS = {
  ac: Wind,
  fridge: Snowflake,
  tv: Tv,
  washingMachine: Disc,
  fan: Fan
};

const DEVICE_NAMES = {
  ac: "Air Conditioner",
  fridge: "Refrigerator",
  tv: "Smart TV",
  washingMachine: "Washing Machine",
  fan: "Ceiling Fan"
};

export default function Dashboard() {
  const { homeownerData, liveData, toggleDevice } = useApp();

  if (!homeownerData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 space-y-3">
        <span className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-sm">Fetching household status...</p>
      </div>
    );
  }

  const limits = homeownerData.deviceLimits || {};
  const statuses = homeownerData.deviceStatuses || {};

  const handleDeviceToggle = async (deviceId) => {
    const nextStatus = !statuses[deviceId];
    if (nextStatus) {
      playToggleOn();
    } else {
      playToggleOff();
    }
    await toggleDevice(deviceId, nextStatus);
  };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-[#f3f4f6] dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/5 shadow-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
        
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Active Load</h3>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">
            {liveData?.totalWatts || 0}
          </span>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Watts</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 gap-4">
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Energy</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{liveData?.monthlyKwh || 0} kWh</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Est. Monthly Bill</span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">₹{Math.round((liveData?.monthlyKwh || 0) * 6)}</span>
          </div>
        </div>
      </div>

      {/* Devices List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Simulated Appliances</h3>
        <span className="text-[10px] text-cyan-600 dark:text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/30 px-2 py-0.5 rounded-full">
          Refreshes live (5s)
        </span>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 gap-4">
        {Object.keys(DEVICE_NAMES).map((deviceId) => {
          const Icon = DEVICE_ICONS[deviceId] || Zap;
          const name = DEVICE_NAMES[deviceId];
          const limit = limits[deviceId] || 100;
          const isOn = statuses[deviceId];
          const watts = isOn ? (liveData?.[deviceId] || 0) : 0;
          
          // Math calculations
          const usagePercent = limit > 0 ? Math.min(Math.round((watts / limit) * 100), 100) : 0;
          const isExceeded = watts > limit;

          // Color calculation
          let colorBarClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
          if (usagePercent >= 70 && usagePercent <= 100) {
            colorBarClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
          } else if (isExceeded) {
            colorBarClass = "bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]";
          }

          return (
            <div 
              key={deviceId} 
              className={`p-4 rounded-xl border transition-all ${
                isOn 
                  ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-md' 
                  : 'bg-white dark:bg-slate-950/30 border-slate-100 dark:border-white/5 opacity-60'
              }`}
            >
              
              {/* Card top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isOn 
                      ? 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5'
                  }`}>
                    <Icon className={`w-5 h-5 ${isOn && deviceId === 'washingMachine' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300">{name}</h4>
                    <p className="text-[10px] text-slate-500">Limit: {limit}W</p>
                  </div>
                </div>

                {/* Status Switch */}
                <button 
                  onClick={() => handleDeviceToggle(deviceId)}
                  className="focus:outline-none cursor-pointer p-1"
                >
                  {isOn ? (
                    <div className="flex items-center space-x-1 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold">
                      <span>ON</span>
                      <ToggleRight className="w-7 h-7 text-emerald-500 dark:text-emerald-400 fill-emerald-500/25 dark:fill-emerald-400/25" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                      <span>OFF</span>
                      <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-slate-600" />
                    </div>
                  )}
                </button>
              </div>

              {/* Card bottom (Wattage detail + Color bar) */}
              {isOn && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Current Consumption</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{watts} W</span>
                  </div>

                  {/* Limit color bar container */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span>Usage vs Limit</span>
                      <span className={isExceeded ? "text-rose-600 dark:text-rose-400 font-semibold" : ""}>{usagePercent}%</span>
                    </div>
                    
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${colorBarClass}`}
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Over-limit Warning */}
                  {isExceeded && (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-[10px] font-medium animate-pulse mt-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Wattage limit ({limit}W) exceeded by {watts - limit}W!</span>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
