import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Wind, Snowflake, Tv, Disc, Fan, Save, Check, Flame, Cpu, Zap } from 'lucide-react';
import { playButtonClick } from '../../utils/sounds';

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

const DEVICE_MAX_LIMITS = {
  ac: 3000,
  fridge: 800,
  tv: 500,
  washingMachine: 1500,
  fan: 200,
  waterHeater: 4000,
  microwave: 2500,
  other: 3000
};

export default function Limits() {
  const { homeownerData, setDeviceLimit } = useApp();
  const [limits, setLimits] = useState({});
  const [savingState, setSavingState] = useState({}); // { [deviceId]: 'idle' | 'saving' | 'saved' }

  // Sync with Firestore data when loaded
  useEffect(() => {
    if (homeownerData?.deviceLimits) {
      setLimits(homeownerData.deviceLimits);
    }
  }, [homeownerData]);

  const defaultDevices = [
    { id: 'ac', name: 'Air Conditioner', type: 'ac' },
    { id: 'fridge', name: 'Refrigerator', type: 'fridge' },
    { id: 'tv', name: 'Smart TV', type: 'tv' },
    { id: 'washingMachine', name: 'Washing Machine', type: 'washingMachine' },
    { id: 'fan', name: 'Ceiling Fan', type: 'fan' }
  ];

  const customDevices = homeownerData?.customDevices || [];
  const allDevices = [...defaultDevices, ...customDevices];

  const handleSliderChange = (deviceId, value) => {
    setLimits(prev => ({
      ...prev,
      [deviceId]: Number(value)
    }));
  };

  const handleSaveLimit = async (deviceId) => {
    playButtonClick();
    setSavingState(prev => ({ ...prev, [deviceId]: 'saving' }));
    try {
      await setDeviceLimit(deviceId, limits[deviceId]);
      setSavingState(prev => ({ ...prev, [deviceId]: 'saved' }));
      setTimeout(() => {
        setSavingState(prev => ({ ...prev, [deviceId]: 'idle' }));
      }, 1500);
    } catch (err) {
      console.error(err);
      setSavingState(prev => ({ ...prev, [deviceId]: 'idle' }));
    }
  };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          <span>Wattage Limits</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure alert thresholds for each appliance</p>
      </div>

      {/* Info Warning */}
      <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/25 text-[11px] text-slate-700 dark:text-slate-300">
        When an active device&apos;s live wattage draws more than its set limit, a warning alert will instantly be recorded.
      </div>

      {/* Limits Form list */}
      <div className="space-y-4">
        {allDevices.map((device) => {
          const deviceId = device.id;
          const Icon = DEVICE_ICONS[device.type] || Sliders;
          const name = device.name;
          const currentLimit = limits[deviceId] || 0;
          const maxVal = DEVICE_MAX_LIMITS[device.type] || 2000;
          const state = savingState[deviceId] || 'idle';

          return (
            <div key={deviceId} className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-3">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</h4>
                </div>

                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="10"
                    max={maxVal}
                    value={currentLimit}
                    onChange={(e) => handleSliderChange(deviceId, e.target.value)}
                    className="w-16 px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-right text-xs font-bold text-cyan-600 dark:text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">W</span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="50"
                  max={maxVal}
                  step="10"
                  value={currentLimit}
                  onChange={(e) => handleSliderChange(deviceId, e.target.value)}
                  className="flex-1 h-1.5 bg-slate-350 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                
                {/* Save Button */}
                <button
                  onClick={() => handleSaveLimit(deviceId)}
                  disabled={state === 'saving'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0 ${
                    state === 'saved' 
                      ? 'bg-emerald-500 text-white dark:text-[#070b13]' 
                      : 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13]'
                  }`}
                >
                  {state === 'saving' ? (
                    <span className="w-3.5 h-3.5 border-2 border-[#070b13] border-t-transparent rounded-full animate-spin"></span>
                  ) : state === 'saved' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
