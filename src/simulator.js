import { isMock, writeLiveData, addAlert } from './firebase';

// Simulation ranges for devices
const DEVICE_RANGES = {
  ac: { min: 1200, max: 1600 },
  fridge: { min: 100, max: 200 },
  tv: { min: 80, max: 150 },
  washingMachine: { min: 400, max: 600 },
  fan: { min: 50, max: 75 }
};

const DEVICE_NAMES = {
  ac: "Air Conditioner",
  fridge: "Refrigerator",
  tv: "Television",
  washingMachine: "Washing Machine",
  fan: "Ceiling Fan"
};

// Simulation speed config:
// 5 seconds in real time = 5 minutes of simulated consumption.
// kWh = (Watts / 1000) * hours
// 5 minutes = 5 / 60 = 1/12 of an hour.
// So: kWh_increment = (totalWatts / 1000) * (1 / 12) = totalWatts / 12000.
const KWH_SCALE = 12000;

export const startSimulation = (activeUser, allHouseholdsList = []) => {
  const runSimulationIteration = async () => {
    // Determine which households to simulate
    let uidsToSimulate = [];

    if (isMock) {
      // In mock mode, we simulate all 5 seeded households so the worker and homeowner dashboards are active.
      const mockUsersData = localStorage.getItem("mock_users");
      if (mockUsersData) {
        uidsToSimulate = Object.keys(JSON.parse(mockUsersData));
      }
    } else {
      // In real Firebase mode:
      if (activeUser) {
        if (activeUser.role === 'worker') {
          // If utility worker is viewing, simulate all households in the list
          uidsToSimulate = allHouseholdsList.map(h => h.uid);
        } else {
          // If homeowner is viewing, simulate only their own household
          uidsToSimulate = [activeUser.uid];
        }
      }
    }

    if (uidsToSimulate.length === 0) return;

    // Load active configurations
    let usersMap = {};
    let liveDataMap = {};

    if (isMock) {
      usersMap = JSON.parse(localStorage.getItem("mock_users") || "{}");
      liveDataMap = JSON.parse(localStorage.getItem("mock_live_data") || "{}");
    } else {
      // For real mode, we assume the active config is passed in or we fetch/update in Firebase directly
      // Real mode writes will use writeLiveData and addAlert which are mapped to Firebase operations.
      // We will construct simulation from the current state.
      if (activeUser && activeUser.role !== 'worker') {
        usersMap[activeUser.uid] = activeUser;
      }
      // If we don't have user config details in this loop, we skip or use local fallback
    }

    for (const uid of uidsToSimulate) {
      const user = isMock ? usersMap[uid] : (activeUser && activeUser.uid === uid ? activeUser : null);
      if (!user) continue;

      const deviceLimits = user.deviceLimits || { ac: 1500, fridge: 180, tv: 120, washingMachine: 550, fan: 70 };
      const deviceStatuses = user.deviceStatuses || { ac: true, fridge: true, tv: true, washingMachine: false, fan: true };
      
      let currentLive = {};
      if (isMock) {
        currentLive = liveDataMap[uid] || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 };
      } else {
        // Real mode live data will be fetched/updated online.
        // We'll read from localStorage or local cache as a proxy to calculate next state.
        const localCacheKey = `real_live_cache_${uid}`;
        currentLive = JSON.parse(localStorage.getItem(localCacheKey) || JSON.stringify({
          ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 120
        }));
      }

      // Simulate device wattages
      const simulatedWatts = {};
      let totalWatts = 0;

      // Check if alerts are muted for this user
      const isMuted = localStorage.getItem(`alerts_muted_${uid}`) === 'true';

      const devices = ["ac", "fridge", "tv", "washingMachine", "fan"];
      devices.forEach(device => {
        const isOn = deviceStatuses[device];
        if (isOn) {
          const range = DEVICE_RANGES[device];
          const watts = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          simulatedWatts[device] = watts;
          totalWatts += watts;

          // Check if limit exceeded
          const limit = deviceLimits[device];
          if (watts > limit && !isMuted) {
            const exceededAmount = watts - limit;
            const alertData = {
              deviceId: device,
              deviceName: DEVICE_NAMES[device],
              value: watts,
              limit: limit,
              exceededAmount: exceededAmount,
              type: "limit_exceeded",
              message: `${DEVICE_NAMES[device]} is drawing ${watts}W, exceeding set limit of ${limit}W by ${exceededAmount}W!`
            };
            addAlert(uid, alertData);
          }
        } else {
          simulatedWatts[device] = 0;
        }
      });

      // Update Monthly kWh
      const kwhIncrement = totalWatts / KWH_SCALE;
      const newMonthlyKwh = Number((Number(currentLive.monthlyKwh || 0) + kwhIncrement).toFixed(2));

      // Check budget projection alert
      // Assume 100 hours of current load is the projected consumption addition
      const projectedKwh = newMonthlyKwh + (totalWatts / 1000) * 100;
      const projectedBill = Math.round(projectedKwh * 6);
      const monthlyBudget = user.monthlyBudget || 2000;

      if (projectedBill > monthlyBudget && !isMuted) {
        const exceededAmount = projectedBill - monthlyBudget;
        const alertData = {
          deviceId: "budget",
          deviceName: "Projected Bill",
          value: projectedBill,
          limit: monthlyBudget,
          exceededAmount: exceededAmount,
          type: "budget_exceeded",
          message: `Projected monthly bill (₹${projectedBill}) is on track to exceed your budget (₹${monthlyBudget}) by ₹${exceededAmount}!`
        };
        addAlert(uid, alertData);
      }

      // Initialize or load device level kWh
      const deviceKwh = currentLive.deviceKwh || { 
        ac: Number((newMonthlyKwh * 0.6).toFixed(2)), 
        fridge: Number((newMonthlyKwh * 0.15).toFixed(2)), 
        tv: Number((newMonthlyKwh * 0.1).toFixed(2)), 
        washingMachine: Number((newMonthlyKwh * 0.1).toFixed(2)), 
        fan: Number((newMonthlyKwh * 0.05).toFixed(2)) 
      };
      
      devices.forEach(device => {
        if (deviceStatuses[device]) {
          const devKwhInc = simulatedWatts[device] / KWH_SCALE;
          deviceKwh[device] = Number((Number(deviceKwh[device] || 0) + devKwhInc).toFixed(2));
        }
      });

      // Write updated live data
      const updatedData = {
        ...simulatedWatts,
        totalWatts,
        monthlyKwh: newMonthlyKwh,
        deviceKwh
      };

      if (!isMock) {
        const localCacheKey = `real_live_cache_${uid}`;
        localStorage.setItem(localCacheKey, JSON.stringify(updatedData));
      }

      await writeLiveData(uid, updatedData);
    }
  };

  // Run immediately, then every 5 seconds
  runSimulationIteration();
  const intervalId = setInterval(runSimulationIteration, 5000);
  return () => clearInterval(intervalId);
};
