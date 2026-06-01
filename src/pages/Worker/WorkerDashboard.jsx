import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Wind, Snowflake, Tv, Disc, Fan, AlertTriangle, CheckCircle, Search, MapPin, User, Activity } from 'lucide-react';

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

export default function WorkerDashboard() {
  const { allHouseholds, toggleAnomaly } = useApp();
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select the first household on load if nothing is selected
  useEffect(() => {
    if (allHouseholds.length > 0 && !selectedHouseId) {
      setSelectedHouseId(allHouseholds[0].uid);
    }
  }, [allHouseholds, selectedHouseId]);

  const filteredHouseholds = allHouseholds.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedHousehold = allHouseholds.find(h => h.uid === selectedHouseId);

  const handleToggleAnomaly = async (uid, currentVal) => {
    await toggleAnomaly(uid, !currentVal);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Grid Telemetry Dashboard</h2>
          <p className="text-xs text-slate-500">Real-time household smart meter polling and load distribution</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Households Table Pane */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">Connected Households</h3>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {filteredHouseholds.length} online
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Household / Address</th>
                  <th className="py-3 px-4 text-right">Live Load</th>
                  <th className="py-3 px-4 text-right">Usage</th>
                  <th className="py-3 px-4 text-right">Est. Bill</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHouseholds.map((house) => {
                  const isSelected = house.uid === selectedHouseId;
                  const live = house.live || { totalWatts: 0, monthlyKwh: 0 };
                  const estBill = Math.round(live.monthlyKwh * 6);

                  return (
                    <tr 
                      key={house.uid}
                      onClick={() => setSelectedHouseId(house.uid)}
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{house.name}</span>
                          {house.anomalyFlagged && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" title="Anomaly Flagged"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{house.address}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        <span className="text-blue-600 font-bold">{live.totalWatts}</span> W
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {live.monthlyKwh} kWh
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{estBill}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {house.anomalyFlagged ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Anomaly
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Normal
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

        {/* Detailed Pane */}
        <div className="lg:col-span-1">
          {selectedHousehold ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{selectedHousehold.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Household Metrics</p>
                  </div>
                </div>

                <div className="flex items-start space-x-1.5 text-[10px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{selectedHousehold.address}</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Total Load</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {selectedHousehold.live?.totalWatts || 0} W
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Projected Bill</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    ₹{Math.round((selectedHousehold.live?.monthlyKwh || 0) * 6)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Status</h4>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    selectedHousehold.billingStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {selectedHousehold.billingStatus || 'Unpaid'}
                  </span>
                </div>
                {selectedHousehold.lastPaymentDate && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Last Paid:</span>
                      <span className="font-semibold text-slate-700">₹{selectedHousehold.lastPaymentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Date:</span>
                      <span className="text-slate-600">
                        {new Date(selectedHousehold.lastPaymentDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Appliance level breakdown */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Appliance Load</h4>
                
                <div className="space-y-2">
                  {Object.keys(DEVICE_NAMES).map((deviceId) => {
                    const Icon = DEVICE_ICONS[deviceId] || Activity;
                    const name = DEVICE_NAMES[deviceId];
                    const isOn = selectedHousehold.deviceStatuses?.[deviceId];
                    const watts = isOn ? (selectedHousehold.live?.[deviceId] || 0) : 0;
                    const limit = selectedHousehold.deviceLimits?.[deviceId] || 100;
                    const isExceeded = watts > limit;

                    return (
                      <div 
                        key={deviceId} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                          isOn 
                            ? isExceeded 
                              ? 'bg-rose-50 border-rose-200 text-rose-800' 
                              : 'bg-slate-50 border-slate-100 text-slate-800'
                            : 'bg-slate-100/50 border-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${isOn && isExceeded ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
                          <span className="font-semibold">{name}</span>
                        </div>
                        <div className="text-right">
                          {isOn ? (
                            <div className="space-y-0.5">
                              <span className="font-bold">{watts} W</span>
                              {isExceeded && (
                                <p className="text-[9px] text-rose-500 font-semibold">Exceeded ({limit}W)</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">OFF</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleToggleAnomaly(selectedHousehold.uid, selectedHousehold.anomalyFlagged)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    selectedHousehold.anomalyFlagged
                      ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  }`}
                >
                  {selectedHousehold.anomalyFlagged ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Resolve & Clear Anomaly</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag Account for Anomaly</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-slate-400 py-16">
              Select a household from the telemetry list to audit device-level power draw.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
