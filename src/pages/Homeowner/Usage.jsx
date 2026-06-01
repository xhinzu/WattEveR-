import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BarChart3, Wind, Snowflake, Tv, Disc, Fan, IndianRupee } from 'lucide-react';

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

export default function Usage() {
  const { liveData } = useApp();

  const totalKwh = liveData?.monthlyKwh || 0;
  const estimatedBill = Math.round(totalKwh * 6);
  const deviceKwh = liveData?.deviceKwh || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0 };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          <span>Estimated Usage</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Monthly projected power consumption & billing</p>
      </div>

      {/* Bill summary card */}
      <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-gradient-to-br dark:from-cyan-950/40 dark:to-slate-950 border border-cyan-200 dark:border-cyan-500/10 shadow-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Household Energy</span>
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight mt-0.5 block">{totalKwh} <span className="text-base font-normal text-slate-400 dark:text-slate-500">kWh</span></span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Estimated Monthly Bill</span>
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight mt-0.5 flex items-center justify-end">
              <IndianRupee className="w-6 h-6 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>{estimatedBill}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span>Rate: ₹6.00 per kWh</span>
          <span>Simulation active</span>
        </div>

        {/* Pay Bill Action */}
        {estimatedBill > 0 ? (
          <Link
            to="/payment"
            className="mt-4 block w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-xs text-center rounded-lg transition-all"
          >
            Pay Bill Now
          </Link>
        ) : (
          <div className="mt-4 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/35 p-2.5 rounded-lg">
            Bill Settled / ₹0 Due
          </div>
        )}
      </div>

      {/* Device Breakdown Header */}
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Consumption breakdown</h3>

      {/* Appliance usage cards */}
      <div className="space-y-3">
        {Object.keys(DEVICE_NAMES).map((deviceId) => {
          const Icon = DEVICE_ICONS[deviceId] || BarChart3;
          const name = DEVICE_NAMES[deviceId];
          const kwh = deviceKwh[deviceId] || 0;
          const cost = Math.round(kwh * 6);
          const percentOfTotal = totalKwh > 0 ? Math.min(Math.round((kwh / totalKwh) * 100), 100) : 0;

          return (
            <div key={deviceId} className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</h4>
                    <p className="text-[10px] text-slate-500">{percentOfTotal}% of total power</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{kwh} kWh</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400">₹{cost}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-cyan-500 transition-all duration-1000"
                    style={{ width: `${percentOfTotal}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
