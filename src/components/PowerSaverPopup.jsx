/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { Leaf, Shield, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playPaymentSuccess } from '../utils/sounds';

export default function PowerSaverPopup({ isOpen, onClose }) {
  const { homeownerData, liveData, toggleDevice } = useApp();
  const [selectedMode, setSelectedMode] = useState('eco'); // 'eco' or 'extreme'
  const [savings, setSavings] = useState(0);

  const getDeviceTypicalWatts = (device) => {
    const defaults = {
      ac: 1400,
      fridge: 150,
      tv: 115,
      washingMachine: 500,
      fan: 62.5
    };
    return defaults[device] || 0;
  };

  const getSavings = useCallback((mode) => {
    const devicesToTurnOff = mode === 'eco' 
      ? ['ac', 'washingMachine', 'tv'] 
      : ['ac', 'washingMachine', 'tv', 'fan'];
      
    let totalWattsSaved = 0;
    devicesToTurnOff.forEach(d => {
      const isOn = homeownerData?.deviceStatuses?.[d];
      if (isOn) {
        const watts = liveData?.[d] || getDeviceTypicalWatts(d);
        totalWattsSaved += watts;
      }
    });
    return (totalWattsSaved / 1000) * 6;
  }, [homeownerData, liveData]);

  useEffect(() => {
    setSavings(getSavings(selectedMode));
  }, [selectedMode, getSavings]);

  const handleActivate = async () => {
    playPaymentSuccess();

    // Cache original device states before toggling
    const prevStates = {
      ac: homeownerData?.deviceStatuses?.ac || false,
      fridge: homeownerData?.deviceStatuses?.fridge || false,
      tv: homeownerData?.deviceStatuses?.tv || false,
      washingMachine: homeownerData?.deviceStatuses?.washingMachine || false,
      fan: homeownerData?.deviceStatuses?.fan || false,
    };

    localStorage.setItem('power_saver_prev_states', JSON.stringify(prevStates));
    localStorage.setItem('power_saver_active_mode', selectedMode);

    const devicesToTurnOff = selectedMode === 'eco'
      ? ['ac', 'washingMachine', 'tv']
      : ['ac', 'washingMachine', 'tv', 'fan'];

    for (const d of devicesToTurnOff) {
      if (prevStates[d]) {
        await toggleDevice(d, false);
      }
    }

    alert(`Power Saver Active — Saving ₹${savings.toFixed(2)}/hr`);
    onClose();
  };

  return (
    <div className="relative">
      <div 
        className={`absolute bottom-16 right-0 w-[320px] h-[450px] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-4 h-4 fill-emerald-500/10" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">Power Saver Mode</h3>
              <p className="text-[9px] text-slate-400 font-medium">Reduce consumption instantly</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 dark-scrollbar">
          
          {/* ECO Mode Card */}
          <div 
            onClick={() => setSelectedMode('eco')}
            className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedMode === 'eco'
                ? 'bg-emerald-50/75 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/40 shadow-md shadow-emerald-500/5'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex space-x-2.5">
                <span className="text-lg">🌿</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Eco Mode</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Turns off AC, Washing Machine, and TV. Keeps essentials running (Fridge, Fan).
                  </p>
                </div>
              </div>
              {selectedMode === 'eco' && (
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-[10px]">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Hourly Savings</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Saves approx ₹{getSavings('eco').toFixed(2)}/hr
              </span>
            </div>
          </div>

          {/* EXTREME Mode Card */}
          <div 
            onClick={() => setSelectedMode('extreme')}
            className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedMode === 'extreme'
                ? 'bg-emerald-50/75 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/40 shadow-md shadow-emerald-500/5'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex space-x-2.5">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Extreme Save Mode</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Turns off all appliances except Refrigerator to protect food.
                  </p>
                </div>
              </div>
              {selectedMode === 'extreme' && (
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-[10px]">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Hourly Savings</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Saves approx ₹{getSavings('extreme').toFixed(2)}/hr
              </span>
            </div>
          </div>

        </div>

        {/* Footer Activate Button */}
        <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            type="button"
            onClick={handleActivate}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              Activate {selectedMode === 'eco' ? 'Eco Mode' : 'Extreme Save'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
