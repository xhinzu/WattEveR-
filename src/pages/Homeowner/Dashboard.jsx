import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Wind, Snowflake, Tv, Disc, Fan, AlertTriangle, ToggleLeft, ToggleRight, Zap, Plus, Flame, Cpu, MoreVertical, Trash2, Sliders } from 'lucide-react';
import { playToggleOn, playToggleOff } from '../../utils/sounds';
import ConnectDeviceWizard from '../../components/ConnectDeviceWizard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const DEVICE_ICONS = {
  ac: Wind,
  fridge: Snowflake,
  tv: Tv,
  washingMachine: Disc,
  fan: Fan,
  waterHeater: Flame,
  microwave: Cpu,
  other: Zap
};

export default function Dashboard() {
  const { homeownerData, liveData, toggleDevice, theme, simulated7DayData, removeDevice } = useApp();
  const [isPowerSaverActive, setIsPowerSaverActive] = React.useState(false);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [deviceToDelete, setDeviceToDelete] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showToast, setShowToast] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleClose = () => setActiveDropdown(null);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  const handleRemoveAttempt = (device) => {
    const isDefault = ['ac', 'fridge', 'tv', 'washingMachine', 'fan'].includes(device.id);
    if (isDefault) {
      setShowToast("Default device cannot be removed");
      setTimeout(() => setShowToast(null), 3000);
    } else {
      setDeviceToDelete(device);
      setShowDeleteConfirm(true);
    }
  };

  React.useEffect(() => {
    const checkStatus = () => {
      setIsPowerSaverActive(!!localStorage.getItem('power_saver_active_mode'));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const defaultDevices = [
    { id: 'ac', name: 'Air Conditioner', type: 'ac' },
    { id: 'fridge', name: 'Refrigerator', type: 'fridge' },
    { id: 'tv', name: 'Smart TV', type: 'tv' },
    { id: 'washingMachine', name: 'Washing Machine', type: 'washingMachine' },
    { id: 'fan', name: 'Ceiling Fan', type: 'fan' }
  ];

  const customDevices = homeownerData?.customDevices || [];
  const allDevices = [...defaultDevices, ...customDevices];

  const handleDeactivatePowerSaver = async () => {
    playToggleOff();
    const prevStatesStr = localStorage.getItem('power_saver_prev_states');
    if (prevStatesStr) {
      try {
        const prevStates = JSON.parse(prevStatesStr);
        const devices = ['ac', 'fridge', 'tv', 'washingMachine', 'fan'];
        for (const d of devices) {
          if (prevStates[d] !== undefined) {
            await toggleDevice(d, prevStates[d]);
          }
        }
      } catch (err) {
        console.error('Failed to restore device states:', err);
      }
    }
    localStorage.removeItem('power_saver_prev_states');
    localStorage.removeItem('power_saver_active_mode');
    setIsPowerSaverActive(false);
  };

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
      
      {/* Dynamic Header with Add Device button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Household Devices</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitor and manage smart sockets</p>
        </div>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Device</span>
        </button>
      </div>

      {/* Power Saver Active Banner */}
      {isPowerSaverActive && (
        <button
          type="button"
          onClick={handleDeactivatePowerSaver}
          className="w-full p-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold transition duration-200 cursor-pointer pointer-events-auto shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm">⚡</span>
            <span>Power Saver Mode Active</span>
          </div>
          <span className="text-[10px] font-semibold underline">Tap to deactivate</span>
        </button>
      )}

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

      {/* 7 Days Usage Graph */}
      <div className="p-4 rounded-2xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-lg space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last 7 Days Usage</h3>
        <div className="w-full h-[180px] text-[10px] font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simulated7DayData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#0b0f19' : '#ffffff', 
                  border: '1px solid rgba(148, 163, 184, 0.2)', 
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                }} 
                cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
              />
              <Bar dataKey="kwh" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {simulated7DayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? 'var(--accent-color, #00e5ff)' : 'rgba(148, 163, 184, 0.3)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
        {allDevices.map((device) => {
          const deviceId = device.id;
          const Icon = DEVICE_ICONS[device.type] || Zap;
          const name = device.name;
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
                    <p className="text-[10px] text-slate-500">Limit: {limit}W {device.room ? `• ${device.room}` : ''}</p>
                  </div>
                </div>

                {/* Control Group */}
                <div className="flex items-center space-x-2">
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

                  {/* ⋮ Dropdown Menu */}
                  <div className="relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        playToggleOn();
                        setActiveDropdown(activeDropdown === deviceId ? null : deviceId);
                      }}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition cursor-pointer"
                      aria-label="Device options"
                    >
                      <MoreVertical className="w-4.5 h-4.5" />
                    </button>

                    {activeDropdown === deviceId && (
                      <div className="absolute right-0 top-7 w-32 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl py-1 z-30 text-[11px] font-bold text-slate-700 dark:text-slate-350">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdown(null);
                            playToggleOn();
                            navigate('/dashboard/limits');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center space-x-2 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Edit Limit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdown(null);
                            playToggleOn();
                            handleRemoveAttempt(device);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-455 flex items-center space-x-2 cursor-pointer border-t border-slate-100 dark:border-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Device</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

      <ConnectDeviceWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#070b13] border border-red-500/40 text-rose-500 text-xs px-4 py-2.5 rounded-xl shadow-2xl font-bold flex items-center space-x-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#070b13]/85 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 p-5 rounded-2xl max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/35 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-5 h-5 text-rose-550" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Remove {deviceToDelete.name}?</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Remove {deviceToDelete.name}? This will stop monitoring this device.
              </p>
            </div>
            <div className="flex space-x-2.5">
              <button
                type="button"
                onClick={() => { playToggleOff(); setShowDeleteConfirm(false); }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-350 transition cursor-pointer text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  playToggleOff();
                  await removeDevice(deviceToDelete.id);
                  setShowDeleteConfirm(false);
                  setDeviceToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 transition cursor-pointer text-xs font-bold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
