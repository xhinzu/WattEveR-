import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, IndianRupee, ShieldCheck, Clock } from 'lucide-react';
import { playButtonClick } from '../../utils/sounds';

export default function Alerts() {
  const { alerts, homeownerData, toggleAlertsMuted } = useApp();
  const isMuted = homeownerData?.alertsMuted || false;

  const handleToggleMute = async () => {
    playButtonClick();
    await toggleAlertsMuted(!isMuted);
  };

  // Format date nicely
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
             ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <span>Alerts & Notifications</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time load and budget warnings</p>
        </div>

        {alerts.length > 0 && (
          <span className="text-[10px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/35 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
            {alerts.length} Active
          </span>
        )}
      </div>

      {/* Mute Control Row */}
      <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Live Alerts</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Status: <span className={`font-semibold capitalize ${!isMuted ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-555'}`}>{!isMuted ? 'Active' : 'Muted'}</span>
            </p>
          </div>

          <button 
            type="button"
            onClick={handleToggleMute}
            className="focus:outline-none cursor-pointer p-1 relative flex items-center"
            aria-label="Toggle Live Alerts"
          >
            <div className={`w-12 h-6 rounded-full transition-colors relative ${!isMuted ? 'bg-cyan-500 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-slate-800'}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all transform duration-300 ${!isMuted ? 'translate-x-6' : ''}`} />
            </div>
          </button>
        </div>

        {/* Muted Warning Banner */}
        {isMuted && (
          <div className="p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 dark:border-amber-550/20 text-amber-800 dark:text-amber-400 text-xs font-medium flex items-start space-x-2 animate-pulse">
            <span className="shrink-0 text-sm">🔕</span>
            <span>Alerts are muted. New limit breaches will not be recorded.</span>
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        // Happy State
        <div className="p-8 rounded-2xl bg-[#f3f4f6] dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Grid Status Stable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All appliances are operating within limits, and your bill projections match your budget.</p>
          </div>
        </div>
      ) : (
        // Alerts List
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isBudget = alert.type === 'budget_exceeded';

            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isBudget 
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300' 
                    : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isBudget ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isBudget ? (
                      <IndianRupee className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wide">
                        {isBudget ? "Budget Overrun Warning" : `Appliance Overlimit: ${alert.deviceName}`}
                      </h4>
                      
                      <div className="flex items-center space-x-1 text-[9px] text-slate-550 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(alert.time)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 mt-2">
                      <span>Threshold: {alert.limit}{isBudget ? " ₹" : " W"}</span>
                      <span className={`font-semibold ${
                        isBudget ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        Exceeded by: +{alert.exceededAmount}{isBudget ? " ₹" : " W"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
