/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Sun, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SolarPopup({ isOpen, onClose }) {
  const { liveData, theme, currentUser } = useApp();
  const [solarWatts, setSolarWatts] = useState(0);
  const [solarHistoryData, setSolarHistoryData] = useState([]);

  // Check if solar is active based on time (6 AM to 7 PM)
  const getIsSolarActive = () => {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 19;
  };

  const isGenerating = getIsSolarActive();

  // Simulating solar wattage generation
  useEffect(() => {
    const updateSolarPower = () => {
      if (getIsSolarActive()) {
        // Active: simulated random value between 800W and 2400W
        setSolarWatts(Math.floor(800 + Math.random() * 1600));
      } else {
        // Offline
        setSolarWatts(0);
      }
    };
    updateSolarPower();
    const interval = setInterval(updateSolarPower, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulating and persisting 7-day solar history data
  useEffect(() => {
    if (!currentUser) return;
    const dataKey = `solar_history_${currentUser.uid}`;
    let saved = localStorage.getItem(dataKey);
    if (!saved) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];
        const isToday = i === 0;
        // Simulated values between 4 and 12 kWh
        const val = parseFloat((4 + Math.random() * 8).toFixed(1));
        result.push({
          day: dayName,
          kwh: val,
          isToday
        });
      }
      localStorage.setItem(dataKey, JSON.stringify(result));
      setSolarHistoryData(result);
    } else {
      const parsed = JSON.parse(saved);
      const updated = parsed.map((item, idx) => {
        return {
          ...item,
          isToday: idx === parsed.length - 1
        };
      });
      setSolarHistoryData(updated);
    }
  }, [currentUser]);

  // Calculations
  const householdLoad = liveData?.totalWatts || 0;
  const netSaved = solarWatts - householdLoad;
  const gridConsuming = Math.max(0, householdLoad - solarWatts);

  // Solar history values
  const todayKwh = solarHistoryData.find(item => item.isToday)?.kwh || 8.5;
  const monthlyKwh = solarHistoryData.reduce((acc, item) => acc + item.kwh, 0) * 4; // simulated rest of month

  const savingsToday = Math.round(todayKwh * 6);
  const savingsMonth = Math.round(monthlyKwh * 6);

  // Solar contribution percentage
  const totalMonthlyUsage = (liveData?.monthlyKwh || 1) + monthlyKwh;
  const solarPercent = Math.min(100, Math.round((monthlyKwh / totalMonthlyUsage) * 100)) || 38;

  return (
    <div className="relative">
      <div 
        className={`absolute bottom-16 right-0 w-[320px] h-[460px] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Sun className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">Solar Energy Monitor</h3>
              <p className="text-[9px] text-slate-400 font-medium">Live solar contribution to your home</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 dark-scrollbar text-slate-800 dark:text-slate-200">
          
          {/* Top Card: Live Solar Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isGenerating 
                ? 'bg-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/30' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5'
            }`}>
              <Sun className={`w-6 h-6 ${isGenerating ? 'animate-pulse' : ''}`} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Solar Generation</p>
              <h4 className="text-lg font-black text-amber-550 dark:text-amber-400 tracking-tight leading-none">
                {solarWatts} W
              </h4>
              <p className="text-[9px] font-bold flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isGenerating ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                <span className={isGenerating ? 'text-emerald-500' : 'text-slate-400'}>
                  {isGenerating ? 'Generating' : 'Offline - No sunlight'}
                </span>
              </p>
            </div>
          </div>

          {/* Middle Card: Energy Balance Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 space-y-3">
            <h5 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Real-time Energy Balance</h5>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-amber-500/5 dark:bg-amber-500/2.5 p-2 rounded-lg border border-amber-500/10">
                <span className="block text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Generated</span>
                <span className="text-xs font-black text-amber-500 block mt-0.5">{solarWatts}W</span>
              </div>
              <div className="bg-cyan-500/5 dark:bg-cyan-500/2.5 p-2 rounded-lg border border-cyan-500/10">
                <span className="block text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Grid Input</span>
                <span className="text-xs font-black text-cyan-500 dark:text-cyan-400 block mt-0.5">{gridConsuming}W</span>
              </div>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/2.5 p-2 rounded-lg border border-emerald-500/10">
                <span className="block text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Net Saved</span>
                <span className={`text-xs font-black block mt-0.5 ${netSaved >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {netSaved > 0 ? `+${netSaved}` : netSaved}W
                </span>
              </div>
            </div>

            {/* Helper Message */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center space-x-1.5">
              <Zap className={`w-3.5 h-3.5 ${netSaved >= 0 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <p className={`text-[9px] font-bold ${netSaved >= 0 ? 'text-emerald-555 dark:text-emerald-400' : 'text-amber-555 dark:text-amber-400'}`}>
                {netSaved >= 0 
                  ? 'Running on solar! Grid not needed ✓' 
                  : 'Solar + Grid active'}
              </p>
            </div>
          </div>

          {/* Savings Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 space-y-3">
            <h5 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Solar Financial Savings</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Saved Today</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 block">₹{savingsToday}</span>
              </div>
              <div>
                <span className="block text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Saved This Month</span>
                <span className="text-sm font-black text-emerald-500 mt-0.5 block">₹{savingsMonth}</span>
              </div>
            </div>

            {/* Contribution Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
              <div className="flex justify-between text-[9px] text-slate-550 dark:text-slate-455 font-bold">
                <span>Solar covering {solarPercent}% of your usage</span>
                <span className="text-amber-555 dark:text-amber-400">{solarPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${solarPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Solar History 7 Days */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 space-y-2">
            <h5 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">7 Days Generation History (kWh)</h5>
            
            <div className="w-full h-[100px] text-[8px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solarHistoryData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0b0f19' : '#ffffff', 
                      border: '1px solid rgba(148, 163, 184, 0.2)', 
                      borderRadius: '6px',
                      fontSize: '8px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Bar dataKey="kwh" radius={[2, 2, 0, 0]} maxBarSize={16}>
                    {solarHistoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? '#fbbf24' : 'rgba(251, 191, 36, 0.3)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
