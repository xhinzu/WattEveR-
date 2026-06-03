/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { 
  Wind, Snowflake, Tv, Disc, Fan, Flame, Cpu, Zap, 
  X, Check, Smartphone, Wifi, ArrowLeft, ArrowRight, Cable, Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playButtonClick } from '../utils/sounds';

const DEVICE_TYPES = [
  { id: 'ac', name: 'Air Conditioner', icon: Wind, typicalWatts: 1400, defaultLimit: 1500 },
  { id: 'fridge', name: 'Refrigerator', icon: Snowflake, typicalWatts: 150, defaultLimit: 180 },
  { id: 'tv', name: 'Smart TV', icon: Tv, typicalWatts: 115, defaultLimit: 120 },
  { id: 'washingMachine', name: 'Washing Machine', icon: Disc, typicalWatts: 500, defaultLimit: 550 },
  { id: 'fan', name: 'Ceiling Fan', icon: Fan, typicalWatts: 62.5, defaultLimit: 70 },
  { id: 'waterHeater', name: 'Water Heater', icon: Flame, typicalWatts: 2000, defaultLimit: 2200 },
  { id: 'microwave', name: 'Microwave', icon: Cpu, typicalWatts: 1200, defaultLimit: 1400 },
  { id: 'other', name: 'Other', icon: Zap, typicalWatts: 500, defaultLimit: 600 }
];

const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Other'];

export default function ConnectDeviceWizard({ isOpen, onClose }) {
  const { addDevice } = useApp();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('ac');
  
  // Form fields
  const [deviceName, setDeviceName] = useState('');
  const [room, setRoom] = useState('Living Room');
  const [limitWatts, setLimitWatts] = useState('');
  
  // Connection animation state
  const [isSearching, setIsSearching] = useState(true);

  // Sync default name & limit wattage when selected type changes
  useEffect(() => {
    const typeDetails = DEVICE_TYPES.find(t => t.id === selectedType);
    if (typeDetails) {
      setDeviceName(typeDetails.name);
      setLimitWatts(typeDetails.defaultLimit.toString());
    }
  }, [selectedType]);

  // Handle step 3 search simulation
  useEffect(() => {
    if (step === 3) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  const typeDetails = DEVICE_TYPES.find(t => t.id === selectedType) || DEVICE_TYPES[0];

  const handleNextStep = () => {
    playButtonClick();
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    playButtonClick();
    setStep(prev => prev - 1);
  };

  const handleSelectType = (typeId) => {
    playButtonClick();
    setSelectedType(typeId);
  };

  const handleSubmit = async () => {
    playButtonClick();
    const uniqueId = `${selectedType}_${Date.now()}`;
    await addDevice({
      id: uniqueId,
      name: deviceName || typeDetails.name,
      type: selectedType,
      room: room,
      limit: Number(limitWatts) || typeDetails.defaultLimit
    });
    // Reset and close
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#070b13]/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 pointer-events-auto">
      <div className="w-full max-w-sm bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] transition-all transform duration-300 scale-100">
        
        {/* Header with dots */}
        <div className="px-5 py-4 border-b border-slate-250/60 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4].map((dot) => (
              <span 
                key={dot} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === dot 
                    ? 'bg-cyan-500 shadow-md shadow-cyan-500/20 w-5' 
                    : step > dot 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          {step < 4 && (
            <button 
              onClick={() => { playButtonClick(); onClose(); }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Wizard Step Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
          
          {/* STEP 1: Choose Device Type */}
          {step === 1 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">What are you connecting?</h3>
                <div className="grid grid-cols-2 gap-3.5">
                  {DEVICE_TYPES.map((type) => {
                    const IconComp = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <div 
                        key={type.id}
                        onClick={() => handleSelectType(type.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-cyan-500/10 dark:bg-cyan-950/20 border-cyan-500 text-cyan-600 dark:text-cyan-400 scale-102 shadow-md shadow-cyan-500/5' 
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          isSelected ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'bg-slate-200/50 dark:bg-white/5'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wide">{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={handleNextStep}
                className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-xs tracking-wide transition flex items-center justify-center space-x-1.5"
              >
                <span>Proceed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: Enter Details */}
          {step === 2 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Device Details</h3>
                
                {/* Device Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g. Living Room AC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Room */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Room</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {ROOMS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Max Wattage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Max Limit (Watts)</label>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Typical: {typeDetails.typicalWatts}W</span>
                  </div>
                  <input
                    type="number"
                    value={limitWatts}
                    onChange={(e) => setLimitWatts(e.target.value)}
                    placeholder={typeDetails.defaultLimit.toString()}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-white/5 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handlePrevStep}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-xs tracking-wide transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={handleNextStep}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-xs tracking-wide transition flex items-center justify-center space-x-1.5"
                >
                  <span>Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Connect to WattEveR Plug */}
          {step === 3 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Connect Your WattEveR Plug</h3>
                
                {/* Animated Chain Illustration */}
                <div className="py-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center space-x-2">
                  <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 animate-pulse">
                    <Cable className="w-5 h-5 text-cyan-500" />
                    <span className="text-[10px]">→</span>
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px]">→</span>
                    <Wifi className={`w-5 h-5 ${isSearching ? 'text-slate-450 animate-ping' : 'text-emerald-500'}`} />
                    <span className="text-[10px]">→</span>
                    <Smartphone className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>

                {/* Instructions */}
                <ol className="text-[10px] text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside pl-1 leading-normal font-medium">
                  <li>Plug your device into the WattEveR smart socket.</li>
                  <li>Make sure the WattEveR strip is connected to Wi-Fi.</li>
                  <li>Press the sync button on the strip for 3 seconds.</li>
                  <li>Wait for the indicator light to turn green.</li>
                </ol>

                {/* Scanning Animation */}
                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col items-center justify-center space-y-2">
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-[10px] font-bold text-slate-500">Searching for WattEveR device...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-450 font-bold text-xs animate-bounce">
                      <span>Device Found! ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handlePrevStep}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-xs tracking-wide transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={isSearching}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center space-x-1.5 ${
                    isSearching 
                      ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                      : 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] cursor-pointer'
                  }`}
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between text-center">
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                
                {/* Success Checkmark Ring */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Device Connected Successfully!</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Your <span className="font-bold text-cyan-600 dark:text-cyan-400">{deviceName || typeDetails.name}</span> in <span className="font-bold text-slate-700 dark:text-slate-300">{room}</span> is now being monitored in real time.
                  </p>
                </div>

                {/* Details Card */}
                <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-450 space-y-1.5 text-left font-medium">
                  <div className="flex justify-between">
                    <span>Device:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{deviceName || typeDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threshold Limit:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{limitWatts} W</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
