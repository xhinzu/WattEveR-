import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';

// Firebase environment configuration check
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Check if all essential keys are provided to determine if we run in Real vs Mock mode
const hasValidConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.databaseURL;

let app, auth, db, rtdb;
const isMock = !hasValidConfig;

if (!isMock) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
  } catch (error) {
    console.error("Failed to initialize real Firebase, falling back to mock mode:", error);
  }
}

// -------------------------------------------------------------
// MOCK DATABASE INITIAL SEED
// -------------------------------------------------------------
const INITIAL_HOUSEHOLDS = {
  "user-rajesh": {
    uid: "user-rajesh",
    email: "rajesh@energy.com",
    name: "Rajesh Kumar",
    address: "12, Park Street, Kolkata",
    monthlyBudget: 2000,
    anomalyFlagged: false,
    role: "homeowner",
    deviceLimits: { ac: 1500, fridge: 180, tv: 120, washingMachine: 550, fan: 70 },
    deviceStatuses: { ac: true, fridge: true, tv: true, washingMachine: false, fan: true },
    billingStatus: "Unpaid",
    lastPaymentDate: "2026-05-15T14:32:00.000Z",
    lastPaymentAmount: 1400
  },
  "user-priya": {
    uid: "user-priya",
    email: "priya@energy.com",
    name: "Priya Sharma",
    address: "45, MG Road, Bengaluru",
    monthlyBudget: 3500,
    anomalyFlagged: false,
    role: "homeowner",
    deviceLimits: { ac: 1600, fridge: 200, tv: 150, washingMachine: 600, fan: 75 },
    deviceStatuses: { ac: true, fridge: true, tv: false, washingMachine: true, fan: true },
    billingStatus: "Unpaid",
    lastPaymentDate: "2026-05-12T09:15:00.000Z",
    lastPaymentAmount: 2200
  },
  "user-amit": {
    uid: "user-amit",
    email: "amit@energy.com",
    name: "Amit Patel",
    address: "88, Link Road, Mumbai",
    monthlyBudget: 1500,
    anomalyFlagged: true,
    role: "homeowner",
    deviceLimits: { ac: 1300, fridge: 150, tv: 100, washingMachine: 500, fan: 60 },
    deviceStatuses: { ac: false, fridge: true, tv: true, washingMachine: false, fan: true },
    billingStatus: "Unpaid",
    lastPaymentDate: "2026-05-18T18:45:00.000Z",
    lastPaymentAmount: 800
  },
  "user-sneha": {
    uid: "user-sneha",
    email: "sneha@energy.com",
    name: "Sneha Reddy",
    address: "101, Jubilee Hills, Hyderabad",
    monthlyBudget: 4000,
    anomalyFlagged: false,
    role: "homeowner",
    deviceLimits: { ac: 1600, fridge: 200, tv: 150, washingMachine: 600, fan: 75 },
    deviceStatuses: { ac: true, fridge: true, tv: true, washingMachine: true, fan: true },
    billingStatus: "Unpaid",
    lastPaymentDate: "2026-05-10T11:20:00.000Z",
    lastPaymentAmount: 3100
  },
  "user-vikram": {
    uid: "user-vikram",
    email: "vikram@energy.com",
    name: "Vikram Singh",
    address: "23, Ring Road, New Delhi",
    monthlyBudget: 2500,
    anomalyFlagged: false,
    role: "homeowner",
    deviceLimits: { ac: 1400, fridge: 180, tv: 120, washingMachine: 550, fan: 70 },
    deviceStatuses: { ac: false, fridge: true, tv: false, washingMachine: false, fan: false },
    billingStatus: "Unpaid",
    lastPaymentDate: "2026-05-20T16:10:00.000Z",
    lastPaymentAmount: 1100
  }
};

const INITIAL_LIVE_DATA = {
  "user-rajesh": { ac: 1350, fridge: 120, tv: 95, washingMachine: 0, fan: 55, totalWatts: 1620, monthlyKwh: 245, deviceKwh: { ac: 147.0, fridge: 36.75, tv: 24.5, washingMachine: 24.5, fan: 12.25 }, lastUpdated: new Date().toISOString() },
  "user-priya": { ac: 1420, fridge: 145, tv: 0, washingMachine: 480, fan: 62, totalWatts: 2107, monthlyKwh: 412, deviceKwh: { ac: 247.2, fridge: 61.8, tv: 41.2, washingMachine: 41.2, fan: 20.6 }, lastUpdated: new Date().toISOString() },
  "user-amit": { ac: 0, fridge: 110, tv: 85, washingMachine: 0, fan: 52, totalWatts: 247, monthlyKwh: 124, deviceKwh: { ac: 0, fridge: 50.0, tv: 30.0, washingMachine: 30.0, fan: 14.0 }, lastUpdated: new Date().toISOString() },
  "user-sneha": { ac: 1550, fridge: 180, tv: 110, washingMachine: 520, fan: 68, totalWatts: 2428, monthlyKwh: 580, deviceKwh: { ac: 348.0, fridge: 87.0, tv: 58.0, washingMachine: 58.0, fan: 29.0 }, lastUpdated: new Date().toISOString() },
  "user-vikram": { ac: 0, fridge: 130, tv: 0, washingMachine: 0, fan: 0, totalWatts: 130, monthlyKwh: 198, deviceKwh: { ac: 0, fridge: 120.0, tv: 40.0, washingMachine: 25.0, fan: 13.0 }, lastUpdated: new Date().toISOString() }
};

const INITIAL_ALERTS = [
  { id: "a1", userId: "user-rajesh", deviceId: "ac", deviceName: "AC", time: new Date(Date.now() - 3600000).toISOString(), value: 1550, limit: 1500, exceededAmount: 50, type: "limit_exceeded", message: "AC exceeded wattage limit by 50W" },
  { id: "a2", userId: "user-amit", deviceId: "tv", deviceName: "TV", time: new Date(Date.now() - 7200000).toISOString(), value: 130, limit: 100, exceededAmount: 30, type: "limit_exceeded", message: "TV exceeded wattage limit by 30W" },
  { id: "a3", userId: "user-sneha", deviceId: "budget", deviceName: "Projected Bill", time: new Date(Date.now() - 18000000).toISOString(), value: 4120, limit: 4000, exceededAmount: 120, type: "budget_exceeded", message: "Projected bill (₹4120) exceeded monthly budget (₹4000)" }
];

const INITIAL_PAYMENTS = [
  { id: "p1", userId: "user-rajesh", amount: 1400, date: "2026-05-15T14:32:00.000Z", transactionId: "TXN-827391", status: "Paid", paymentMethod: "Card" },
  { id: "p2", userId: "user-priya", amount: 2200, date: "2026-05-12T09:15:00.000Z", transactionId: "TXN-391823", status: "Paid", paymentMethod: "UPI" },
  { id: "p3", userId: "user-amit", amount: 800, date: "2026-05-18T18:45:00.000Z", transactionId: "TXN-291834", status: "Paid", paymentMethod: "Net Banking" },
  { id: "p4", userId: "user-sneha", amount: 3100, date: "2026-05-10T11:20:00.000Z", transactionId: "TXN-948123", status: "Paid", paymentMethod: "Card" },
  { id: "p5", userId: "user-vikram", amount: 1100, date: "2026-05-20T16:10:00.000Z", transactionId: "TXN-491823", status: "Paid", paymentMethod: "UPI" }
];

// Helper to initialize local storage
const getStorageItem = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize Mock Databases
let mockUsers = getStorageItem("mock_users", INITIAL_HOUSEHOLDS);
let mockLiveData = getStorageItem("mock_live_data", INITIAL_LIVE_DATA);
let mockAlerts = getStorageItem("mock_alerts", INITIAL_ALERTS);
let mockPayments = getStorageItem("mock_payments", INITIAL_PAYMENTS);
let mockCurrentUser = getStorageItem("mock_current_user", null);

// Store change listeners
const listeners = {
  users: [],       // Array of { uid, callback }
  alerts: [],      // Array of { uid, callback }
  liveData: [],    // Array of { uid, callback }
  payments: [],    // Array of { uid, callback }
  allHouseholds: [], // Array of callbacks
  auth: []         // Array of callbacks
};

// Helper to trigger listeners
const triggerListeners = (type, uid) => {
  if (type === "auth") {
    listeners.auth.forEach(cb => cb(mockCurrentUser));
  } else if (type === "users") {
    listeners.users.forEach(item => {
      if (item.uid === uid) {
        item.callback({ exists: true, data: () => mockUsers[uid] });
      }
    });
    // Trigger all households listeners as well since user data changed
    listeners.allHouseholds.forEach(cb => {
      cb(Object.values(mockUsers).map(u => ({ ...u, live: mockLiveData[u.uid] })));
    });
  } else if (type === "liveData") {
    listeners.liveData.forEach(item => {
      if (item.uid === uid) {
        item.callback(mockLiveData[uid]);
      }
    });
    listeners.allHouseholds.forEach(cb => {
      cb(Object.values(mockUsers).map(u => ({ ...u, live: mockLiveData[u.uid] })));
    });
  } else if (type === "alerts") {
    listeners.alerts.forEach(item => {
      if (item.uid === uid) {
        const userAlerts = mockAlerts.filter(a => a.userId === uid);
        item.callback(userAlerts);
      }
    });
  } else if (type === "payments") {
    listeners.payments.forEach(item => {
      if (item.uid === uid) {
        const userPayments = mockPayments.filter(p => p.userId === uid);
        item.callback(userPayments);
      }
    });
  } else if (type === "allHouseholds") {
    listeners.allHouseholds.forEach(cb => {
      cb(Object.values(mockUsers).map(u => ({ ...u, live: mockLiveData[u.uid] })));
    });
  }
};

// -------------------------------------------------------------
// UNIFIED API IMPLEMENTATION (CHOOSE BETWEEN REAL & MOCK)
// -------------------------------------------------------------

export { isMock };

// 1. AUTHENTICATION

export const login = async (email, password) => {
  if (isMock) {
    // Utility worker login check
    if (email === "worker@grid.com") {
      if (password === "worker123") {
        const workerUser = { uid: "worker-admin", email: "worker@grid.com", role: "worker", name: "Grid Operator" };
        mockCurrentUser = workerUser;
        setStorageItem("mock_current_user", workerUser);
        triggerListeners("auth");
        return workerUser;
      } else {
        throw new Error("auth/wrong-password");
      }
    }

    // Standard User login check
    const matchedUser = Object.values(mockUsers).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      // For ease of testing, accept any password or check if it matches simple format
      mockCurrentUser = matchedUser;
      setStorageItem("mock_current_user", matchedUser);
      triggerListeners("auth");
      return matchedUser;
    } else {
      // Simulate registering new user automatically or throwing error
      throw new Error("auth/user-not-found");
    }
  } else {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch user details from Firestore to verify role
    const userDoc = await getDoc(doc(db, "users", credential.user.uid));
    if (userDoc.exists()) {
      return { uid: credential.user.uid, email: credential.user.email, ...userDoc.data() };
    }
    return { uid: credential.user.uid, email: credential.user.email };
  }
};

export const logout = async () => {
  if (isMock) {
    mockCurrentUser = null;
    setStorageItem("mock_current_user", null);
    triggerListeners("auth");
    return true;
  } else {
    await signOut(auth);
  }
};

export const register = async (email, password, name, address) => {
  if (isMock) {
    const uid = "user-" + Math.random().toString(36).substr(2, 9);
    const newUser = {
      uid,
      email,
      name,
      address,
      monthlyBudget: 2000,
      anomalyFlagged: false,
      role: "homeowner",
      deviceLimits: { ac: 1500, fridge: 180, tv: 120, washingMachine: 550, fan: 70 },
      deviceStatuses: { ac: true, fridge: true, tv: true, washingMachine: false, fan: true }
    };
    
    mockUsers[uid] = newUser;
    setStorageItem("mock_users", mockUsers);
    
    // Seed initial live data
    mockLiveData[uid] = { ac: 1300, fridge: 120, tv: 90, washingMachine: 0, fan: 55, totalWatts: 1565, monthlyKwh: 0, lastUpdated: new Date().toISOString() };
    setStorageItem("mock_live_data", mockLiveData);
    
    mockCurrentUser = newUser;
    setStorageItem("mock_current_user", newUser);
    
    triggerListeners("auth");
    triggerListeners("users", uid);
    triggerListeners("liveData", uid);
    return newUser;
  } else {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const userData = {
      uid,
      email,
      name,
      address,
      monthlyBudget: 2000,
      anomalyFlagged: false,
      role: "homeowner",
      deviceLimits: { ac: 1500, fridge: 180, tv: 120, washingMachine: 550, fan: 70 },
      deviceStatuses: { ac: true, fridge: true, tv: true, washingMachine: false, fan: true }
    };
    // Save to Firestore
    await setDoc(doc(db, "users", uid), userData);
    
    // Seed RTDB live data
    await set(ref(rtdb, `households/${uid}/live`), {
      ac: 1300, fridge: 120, tv: 90, washingMachine: 0, fan: 55, totalWatts: 1565, monthlyKwh: 0, lastUpdated: new Date().toISOString()
    });
    
    return userData;
  }
};

export const onAuthChanged = (callback) => {
  if (isMock) {
    listeners.auth.push(callback);
    // Initial call
    callback(mockCurrentUser);
    return () => {
      listeners.auth = listeners.auth.filter(cb => cb !== callback);
    };
  } else {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Special case for hardcoded utility worker check in real Auth if needed,
        // but normally role is stored in Firestore.
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          callback({ uid: user.uid, email: user.email, ...userDoc.data() });
        } else {
          // If logged in but doc doesn't exist, check if email matches utility worker
          if (user.email === "worker@grid.com") {
            callback({ uid: user.uid, email: user.email, role: "worker", name: "Grid Operator" });
          } else {
            callback({ uid: user.uid, email: user.email, role: "homeowner" });
          }
        }
      } else {
        callback(null);
      }
    });
  }
};

// 2. FIRESTORE DATA OPS

export const getUserData = (uid, callback) => {
  if (isMock) {
    const listenerObj = { uid, callback };
    listeners.users.push(listenerObj);
    // Initial trigger
    callback({ exists: true, data: () => mockUsers[uid] });
    return () => {
      listeners.users = listeners.users.filter(item => item !== listenerObj);
    };
  } else {
    return onSnapshot(doc(db, "users", uid), (docSnap) => {
      callback({ exists: docSnap.exists(), data: () => docSnap.data() });
    });
  }
};

export const updateDeviceLimit = async (uid, deviceId, limit) => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid].deviceLimits[deviceId] = Number(limit);
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
    }
  } else {
    await updateDoc(doc(db, "users", uid), {
      [`deviceLimits.${deviceId}`]: Number(limit)
    });
  }
};

export const updateDeviceStatus = async (uid, deviceId, isOn) => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid].deviceStatuses[deviceId] = isOn;
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
      
      // Instantly drop power to 0 in live data if OFF
      if (!isOn && mockLiveData[uid]) {
        mockLiveData[uid][deviceId] = 0;
        let sum = 0;
        const devices = ["ac", "fridge", "tv", "washingMachine", "fan"];
        devices.forEach(d => {
          sum += mockLiveData[uid][d] || 0;
        });
        mockLiveData[uid].totalWatts = sum;
        setStorageItem("mock_live_data", mockLiveData);
        triggerListeners("liveData", uid);
      }
    }
  } else {
    await updateDoc(doc(db, "users", uid), {
      [`deviceStatuses.${deviceId}`]: isOn
    });
  }
};

export const updateUserBudget = async (uid, budget) => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid].monthlyBudget = Number(budget);
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
    }
  } else {
    await updateDoc(doc(db, "users", uid), {
      monthlyBudget: Number(budget)
    });
  }
};

export const flagHouseholdAnomaly = async (uid, isFlagged) => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid].anomalyFlagged = isFlagged;
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
    }
  } else {
    await updateDoc(doc(db, "users", uid), {
      anomalyFlagged: isFlagged
    });
  }
};

export const updateAlertsMuted = async (uid, isMuted) => {
  if (isMock) {
    if (mockUsers[uid]) {
      mockUsers[uid].alertsMuted = isMuted;
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
    }
  } else {
    await updateDoc(doc(db, "users", uid), {
      alertsMuted: isMuted
    });
  }
};

export const getAlerts = (uid, callback) => {
  if (isMock) {
    const listenerObj = { uid, callback };
    listeners.alerts.push(listenerObj);
    
    const userAlerts = mockAlerts.filter(a => a.userId === uid);
    callback(userAlerts);
    
    return () => {
      listeners.alerts = listeners.alerts.filter(item => item !== listenerObj);
    };
  } else {
    const q = query(collection(db, `users/${uid}/alerts`));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    });
  }
};

export const addAlert = async (uid, alertData) => {
  const isMuted = localStorage.getItem(`alerts_muted_${uid}`) === 'true';
  if (isMuted) return;

  if (isMock) {
    const newAlert = {
      id: "alert-" + Math.random().toString(36).substr(2, 9),
      userId: uid,
      ...alertData,
      time: new Date().toISOString()
    };
    
    // De-duplicate recent alerts of the same type/device to prevent flooding
    const recent = mockAlerts.find(a => 
      a.userId === uid && 
      a.deviceId === alertData.deviceId && 
      new Date().getTime() - new Date(a.time).getTime() < 30000 // 30 seconds cooldown
    );
    
    if (!recent) {
      mockAlerts.unshift(newAlert);
      // Keep alerts array capped at 50 per user for memory
      if (mockAlerts.length > 100) mockAlerts.pop();
      setStorageItem("mock_alerts", mockAlerts);
      triggerListeners("alerts", uid);
    }
  } else {
    await addDoc(collection(db, `users/${uid}/alerts`), {
      ...alertData,
      time: new Date().toISOString()
    });
  }
};

export const getAllHouseholds = (callback) => {
  if (isMock) {
    listeners.allHouseholds.push(callback);
    const list = Object.values(mockUsers).map(u => ({ ...u, live: mockLiveData[u.uid] }));
    callback(list);
    return () => {
      listeners.allHouseholds = listeners.allHouseholds.filter(cb => cb !== callback);
    };
  } else {
    // Listen to all users with homeowner role
    const q = query(collection(db, "users"), where("role", "==", "homeowner"));
    return onSnapshot(q, (snapshot) => {
      const households = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      // Listen to RTDB live data as well or combine them.
      // For utility worker, we'll set up a combined listener
      const liveRef = ref(rtdb, "households");
      return onValue(liveRef, (rtdbSnap) => {
        const liveVal = rtdbSnap.val() || {};
        const combined = households.map(h => ({
          ...h,
          live: liveVal[h.uid] || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 }
        }));
        callback(combined);
      });
    });
  }
};

// 3. REALTIME DATABASE LIVE POWER DATA

export const subscribeToLiveData = (uid, callback) => {
  if (isMock) {
    const listenerObj = { uid, callback };
    listeners.liveData.push(listenerObj);
    // Initial call
    callback(mockLiveData[uid] || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 });
    return () => {
      listeners.liveData = listeners.liveData.filter(item => item !== listenerObj);
    };
  } else {
    const liveRef = ref(rtdb, `households/${uid}/live`);
    return onValue(liveRef, (snapshot) => {
      callback(snapshot.val() || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0, totalWatts: 0, monthlyKwh: 0 });
    });
  }
};

export const writeLiveData = async (uid, data) => {
  if (isMock) {
    if (mockLiveData[uid]) {
      mockLiveData[uid] = { ...mockLiveData[uid], ...data, lastUpdated: new Date().toISOString() };
      setStorageItem("mock_live_data", mockLiveData);
      triggerListeners("liveData", uid);
    }
  } else {
    await update(ref(rtdb, `households/${uid}/live`), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  }
};

export const getPaymentHistory = (uid, callback) => {
  if (isMock) {
    const listenerObj = { uid, callback };
    listeners.payments.push(listenerObj);
    const userPayments = mockPayments.filter(p => p.userId === uid);
    callback(userPayments);
    return () => {
      listeners.payments = listeners.payments.filter(item => item !== listenerObj);
    };
  } else {
    const q = query(collection(db, `users/${uid}/payments`));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    });
  }
};

export const recordPayment = async (uid, amount, paymentMethod) => {
  const transactionId = "TXN-" + Math.floor(100000 + Math.random() * 900000);
  const paymentDate = new Date().toISOString();
  
  if (isMock) {
    // 1. Add payment record
    const newPayment = {
      id: "pay-" + Math.random().toString(36).substr(2, 9),
      userId: uid,
      amount: Number(amount),
      date: paymentDate,
      transactionId,
      status: "Paid",
      paymentMethod
    };
    mockPayments.unshift(newPayment);
    setStorageItem("mock_payments", mockPayments);
    
    // 2. Update user document
    if (mockUsers[uid]) {
      mockUsers[uid].billingStatus = "Paid";
      mockUsers[uid].lastPaymentDate = paymentDate;
      mockUsers[uid].lastPaymentAmount = Number(amount);
      setStorageItem("mock_users", mockUsers);
      triggerListeners("users", uid);
    }
    
    // 3. Reset live data monthlyKwh to 0
    if (mockLiveData[uid]) {
      mockLiveData[uid].monthlyKwh = 0;
      mockLiveData[uid].deviceKwh = { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0 };
      setStorageItem("mock_live_data", mockLiveData);
      triggerListeners("liveData", uid);
    }
    
    triggerListeners("payments", uid);
  } else {
    // Real Firebase:
    await addDoc(collection(db, `users/${uid}/payments`), {
      amount: Number(amount),
      date: paymentDate,
      transactionId,
      status: "Paid",
      paymentMethod
    });
    
    await updateDoc(doc(db, "users", uid), {
      billingStatus: "Paid",
      lastPaymentDate: paymentDate,
      lastPaymentAmount: Number(amount)
    });
    
    await update(ref(rtdb, `households/${uid}/live`), {
      monthlyKwh: 0,
      deviceKwh: { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0 }
    });
  }
  
  return { transactionId, date: paymentDate };
};

export const submitOutageReport = async (email, issueType, description) => {
  const timestamp = new Date().toISOString();
  const reportId = String(Math.floor(100000 + Math.random() * 900000));
  const reportData = {
    reportId,
    email,
    issueType,
    description,
    timestamp
  };

  if (isMock) {
    const mockOutages = getStorageItem("mock_outage_reports", []);
    mockOutages.unshift(reportData);
    setStorageItem("mock_outage_reports", mockOutages);
  } else {
    await addDoc(collection(db, "outage_reports"), reportData);
  }

  return reportId;
};

