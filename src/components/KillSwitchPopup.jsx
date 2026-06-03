/* eslint-disable react/prop-types */
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAlert, playButtonClick } from '../utils/sounds';

export default function KillSwitchPopup({ isOpen, onClose }) {
  const { triggerKillSwitch } = useApp();

  const handleConfirm = async () => {
    // Play warning beep sound
    playAlert();
    await triggerKillSwitch();
    onClose();
  };

  return (
    <div className="relative">
      <div 
        className={`absolute bottom-16 right-0 w-[300px] bg-[#0f0b0b] border border-red-500/35 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-red-950/40 via-red-900/10 to-transparent border-b border-red-500/20 flex items-center justify-between text-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-red-400 tracking-wide uppercase">Kill Switch</h3>
              <p className="text-[9px] text-slate-450 font-medium">Emergency Power Disconnect</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { playButtonClick(); onClose(); }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-red-450 leading-tight">
              This will immediately turn OFF all devices in your home.
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Only the Refrigerator will remain ON to protect your food.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2.5 pt-2">
            <button
              type="button"
              onClick={() => { playButtonClick(); onClose(); }}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-650 text-white shadow-md shadow-red-500/20 transition cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              Turn Off All
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
