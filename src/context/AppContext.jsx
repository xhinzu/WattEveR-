import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login, logout, register, onAuthChanged, 
  getUserData, updateDeviceLimit, updateDeviceStatus, 
  updateUserBudget, flagHouseholdAnomaly, getAlerts, 
  getAllHouseholds, subscribeToLiveData, isMock,
  getPaymentHistory, recordPayment
} from '../firebase';
import { startSimulation } from '../simulator';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Homeowner specific state
  const [homeownerData, setHomeownerData] = useState(null);
  const [liveData, setLiveData] = useState({ ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 });
  const [alerts, setAlerts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  
  // Utility worker specific state
  const [allHouseholds, setAllHouseholds] = useState([]);

  // 1. Auth Change Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setHomeownerData(null);
        setLiveData({ ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 });
        setAlerts([]);
        setPaymentHistory([]);
        setAllHouseholds([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Homeowner & Utility Worker Real-Time Database Subscriptions
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeProfile = () => {};
    let unsubscribeLive = () => {};
    let unsubscribeAlerts = () => {};
    let unsubscribePayments = () => {};
    let unsubscribeAllHouseholds = () => {};

    if (currentUser.role === 'worker') {
      // Subscribe to all households for utility worker
      setLoading(true);
      unsubscribeAllHouseholds = getAllHouseholds((households) => {
        setAllHouseholds(households);
        setLoading(false);
      });
    } else {
      // Subscribe to homeowner profile, live data, alerts, and payments
      setLoading(true);
      
      // Get profile details (like device limits/statuses)
      unsubscribeProfile = getUserData(currentUser.uid, (snapshot) => {
        if (snapshot.exists) {
          setHomeownerData(snapshot.data());
        }
        setLoading(false);
      });

      // Stream Realtime Database live consumption
      unsubscribeLive = subscribeToLiveData(currentUser.uid, (data) => {
        if (data) {
          setLiveData(data);
        }
      });

      // Stream Firestore alerts
      unsubscribeAlerts = getAlerts(currentUser.uid, (alertList) => {
        setAlerts(alertList);
      });

      // Stream payment history
      unsubscribePayments = getPaymentHistory(currentUser.uid, (history) => {
        if (history) {
          setPaymentHistory(history);
        }
      });
    }

    return () => {
      unsubscribeProfile();
      unsubscribeLive();
      unsubscribeAlerts();
      unsubscribePayments();
      unsubscribeAllHouseholds();
    };
  }, [currentUser]);

  // 3. Start Background Power Simulation
  useEffect(() => {
    // In Mock mode, start the simulator for all households immediately
    // In Real mode, only simulate when a user is logged in
    let stopSim = () => {};
    
    if (isMock) {
      // Pass empty list since simulator will read mock households from localStorage directly
      stopSim = startSimulation(null, []);
    } else if (currentUser) {
      if (currentUser.role === 'worker') {
        stopSim = startSimulation(currentUser, allHouseholds);
      } else {
        stopSim = startSimulation(currentUser, []);
      }
    }

    return () => stopSim();
  }, [currentUser, allHouseholds.length]); // Re-simulate if worker loads more households

  // 4. API Wrapper Methods

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      return user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    await logout();
  };

  const registerUser = async (email, password, name, address) => {
    setLoading(true);
    try {
      const user = await register(email, password, name, address);
      return user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const toggleDevice = async (deviceId, isOn) => {
    if (!currentUser) return;
    await updateDeviceStatus(currentUser.uid, deviceId, isOn);
  };

  const setDeviceLimit = async (deviceId, limit) => {
    if (!currentUser) return;
    await updateDeviceLimit(currentUser.uid, deviceId, limit);
  };

  const setBudget = async (budget) => {
    if (!currentUser) return;
    await updateUserBudget(currentUser.uid, budget);
  };

  const toggleAnomaly = async (uid, isFlagged) => {
    if (currentUser?.role !== 'worker') return;
    await flagHouseholdAnomaly(uid, isFlagged);
  };

  const payBill = async (amount, paymentMethod) => {
    if (!currentUser) return;
    return await recordPayment(currentUser.uid, amount, paymentMethod);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      homeownerData,
      liveData,
      alerts,
      paymentHistory,
      allHouseholds,
      loading,
      isMockMode: isMock,
      loginUser,
      logoutUser,
      registerUser,
      toggleDevice,
      setDeviceLimit,
      setBudget,
      toggleAnomaly,
      payBill
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
