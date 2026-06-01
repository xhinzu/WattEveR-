import React from 'react';
import { useApp } from '../../context/AppContext';
import { IndianRupee, Activity, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function BillingSummary() {
  const { allHouseholds } = useApp();

  // Aggregate Grid Stats
  const totalLiveLoad = allHouseholds.reduce((acc, h) => acc + (h.live?.totalWatts || 0), 0);
  const totalKwh = allHouseholds.reduce((acc, h) => acc + (h.live?.monthlyKwh || 0), 0);
  const totalRevenue = Math.round(totalKwh * 6);
  const avgKwh = allHouseholds.length > 0 ? Math.round(totalKwh / allHouseholds.length) : 0;

  // High usage threshold (e.g., 300 kWh)
  const HIGH_USAGE_THRESHOLD = 300;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Utility Billing & Grid Summary</h2>
        <p className="text-xs text-slate-500 font-medium">Monthly accumulated consumption auditing and grid metrics</p>
      </div>

      {/* Grid Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Grid Load</span>
          <span className="text-xl font-extrabold text-blue-600 mt-1 block">{(totalLiveLoad / 1000).toFixed(2)} <span className="text-xs font-semibold text-slate-500">kW</span></span>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Live polling from 5 smart meters</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supplied Energy</span>
          <span className="text-xl font-extrabold text-slate-950 mt-1 block">{totalKwh.toFixed(1)} <span className="text-xs font-semibold text-slate-500">kWh</span></span>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Accumulated billing cycle total</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projected Revenue</span>
          <span className="text-xl font-extrabold text-slate-950 mt-1 block flex items-center">
            <IndianRupee className="w-4.5 h-4.5 text-slate-600" />
            <span>{totalRevenue}</span>
          </span>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Calculated at flat ₹6.00/kWh</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Household Usage</span>
          <span className="text-xl font-extrabold text-slate-950 mt-1 block">{avgKwh} <span className="text-xs font-semibold text-slate-500">kWh</span></span>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Cycle normal: &lt; {HIGH_USAGE_THRESHOLD} kWh</p>
        </div>

      </div>

      {/* Grid Audit Alert Banner if any household exceeds normal usage */}
      {allHouseholds.some(h => (h.live?.monthlyKwh || 0) > HIGH_USAGE_THRESHOLD) && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-800 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900">Grid Load Threshold Warning</h4>
            <p className="mt-0.5 leading-relaxed text-slate-600 font-medium">One or more households have exceeded the normal usage limit of {HIGH_USAGE_THRESHOLD} kWh for this billing cycle. These accounts have been highlighted below for auditing.</p>
          </div>
        </div>
      )}

      {/* Billing Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 text-left">Consumer Billing Audit Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-5">Homeowner Account</th>
                <th className="py-3 px-5">Registered Address</th>
                <th className="py-3 px-5 text-right">Consumption</th>
                <th className="py-3 px-5 text-right">Calculated Bill</th>
                <th className="py-3 px-5 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allHouseholds.map((house) => {
                const kwh = house.live?.monthlyKwh || 0;
                const bill = Math.round(kwh * 6);
                const isOverUsage = kwh > HIGH_USAGE_THRESHOLD;

                return (
                  <tr 
                    key={house.uid}
                    className={`hover:bg-slate-50 transition-all ${
                      isOverUsage ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{house.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{house.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">
                      {house.address}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-slate-800">
                      <span className={isOverUsage ? "text-rose-600 font-bold" : "text-slate-800"}>
                        {kwh} kWh
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">
                      ₹{bill}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {isOverUsage ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>Audit Required</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Clear / Approved</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
