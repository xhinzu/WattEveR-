/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BarChart3, Wind, Snowflake, Tv, Disc, Fan, IndianRupee, Flame, Cpu, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = [
  'var(--accent-color, #00e5ff)',
  '#1e90ff',
  '#ff4757',
  '#ffa502',
  '#a55eea',
  '#2ed573',
  '#fd79a8',
  '#eccc68',
  '#70a1ff'
];

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

export default function Usage() {
  const { liveData, homeownerData, theme } = useApp();

  const totalKwh = liveData?.monthlyKwh || 0;
  const estimatedBill = Math.round(totalKwh * 6);
  const deviceKwh = liveData?.deviceKwh || {};

  const defaultDevices = [
    { id: 'ac', name: 'Air Conditioner', type: 'ac' },
    { id: 'fridge', name: 'Refrigerator', type: 'fridge' },
    { id: 'tv', name: 'Smart TV', type: 'tv' },
    { id: 'washingMachine', name: 'Washing Machine', type: 'washingMachine' },
    { id: 'fan', name: 'Ceiling Fan', type: 'fan' }
  ];

  const customDevices = homeownerData?.customDevices || [];
  const allDevices = [...defaultDevices, ...customDevices];

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

      {/* Donut Chart Card */}
      <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex flex-col items-center space-y-4">
        <div className="relative w-full h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={(() => {
                  const chartData = allDevices.map((device) => {
                    const kwh = deviceKwh[device.id] || 0;
                    const percentOfTotal = totalKwh > 0 ? parseFloat(((kwh / totalKwh) * 100).toFixed(1)) : 0;
                    return {
                      name: device.name,
                      value: kwh,
                      percent: percentOfTotal,
                      id: device.id
                    };
                  }).filter(item => item.value > 0);
                  return chartData.length > 0 ? chartData : [{ name: 'No Usage', value: 1, percent: 0 }];
                })()}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {(() => {
                  const chartData = allDevices.map((device) => {
                    const kwh = deviceKwh[device.id] || 0;
                    const percentOfTotal = totalKwh > 0 ? parseFloat(((kwh / totalKwh) * 100).toFixed(1)) : 0;
                    return {
                      name: device.name,
                      value: kwh,
                      percent: percentOfTotal,
                      id: device.id
                    };
                  }).filter(item => item.value > 0);
                  const displayData = chartData.length > 0 ? chartData : [{ name: 'No Usage', value: 1, percent: 0 }];
                  const hasConsumption = chartData.length > 0;
                  return displayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={hasConsumption ? COLORS[index % COLORS.length] : 'rgba(148, 163, 184, 0.2)'} 
                    />
                  ));
                })()}
              </Pie>
              {(() => {
                const chartData = allDevices.map((device) => {
                  const kwh = deviceKwh[device.id] || 0;
                  const percentOfTotal = totalKwh > 0 ? parseFloat(((kwh / totalKwh) * 100).toFixed(1)) : 0;
                  return {
                    name: device.name,
                    value: kwh,
                    percent: percentOfTotal,
                    id: device.id
                  };
                }).filter(item => item.value > 0);
                return chartData.length > 0 && (
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} kWh (${props.payload.percent}%)`, name]}
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0b0f19' : '#ffffff', 
                      border: '1px solid rgba(148, 163, 184, 0.2)', 
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }} 
                  />
                );
              })()}
            </PieChart>
          </ResponsiveContainer>
          
          {/* Total kWh text in the center of the donut */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{totalKwh}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Total kWh</span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
          {(() => {
            const chartData = allDevices.map((device) => {
              const kwh = deviceKwh[device.id] || 0;
              const percentOfTotal = totalKwh > 0 ? parseFloat(((kwh / totalKwh) * 100).toFixed(1)) : 0;
              return {
                name: device.name,
                value: kwh,
                percent: percentOfTotal,
                id: device.id
              };
            }).filter(item => item.value > 0);
            return chartData.map((device, index) => (
              <div key={device.id} className="flex items-center space-x-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="truncate max-w-[90px]">{device.name}</span>
                <span className="text-slate-400 dark:text-slate-550 font-normal">({device.percent}%)</span>
              </div>
            ));
          })()}
          {(() => {
            const chartData = allDevices.map((device) => {
              const kwh = deviceKwh[device.id] || 0;
              return {
                value: kwh
              };
            }).filter(item => item.value > 0);
            return chartData.length === 0 && (
              <div className="col-span-2 text-center text-slate-400 py-1 font-normal italic">
                No consumption recorded yet this month.
              </div>
            );
          })()}
        </div>
      </div>
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Consumption breakdown</h3>

      {/* Appliance usage cards */}
      <div className="space-y-3">
        {allDevices.map((device) => {
          const deviceId = device.id;
          const Icon = DEVICE_ICONS[device.type] || BarChart3;
          const name = device.name;
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
