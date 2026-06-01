import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CreditCard, Smartphone, Landmark, IndianRupee, ArrowLeft, CheckCircle, FileDown, History } from 'lucide-react';
import { playButtonClick, playPaymentSuccess } from '../../utils/sounds';

export default function Payment() {
  const { liveData, homeownerData, payBill } = useApp();
  const navigate = useNavigate();

  // Local state
  const [method, setMethod] = useState('card'); // 'card' | 'upi' | 'netbank'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bank, setBank] = useState('SBI');

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null); // stores transaction data

  // Calculation
  const totalKwh = liveData?.monthlyKwh || 0;
  const amountDue = Math.round(totalKwh * 6);
  const deviceKwh = liveData?.deviceKwh || { ac: 0, fridge: 0, tv: 0, washingMachine: 0, fan: 0 };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (amountDue <= 0) return;

    playButtonClick();
    setLoading(true);
    try {
      let methodLabel = "Card";
      if (method === 'upi') methodLabel = `UPI (${upiId})`;
      if (method === 'netbank') methodLabel = `Net Banking (${bank})`;

      const result = await payBill(amountDue, methodLabel);
      playPaymentSuccess();
      setPaymentSuccess({
        amount: amountDue,
        transactionId: result.transactionId,
        date: result.date,
        method: methodLabel
      });
    } catch (err) {
      console.error(err);
      alert("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    playButtonClick();
    if (!paymentSuccess) return;
    const receiptText = `
=========================================
               WattEveR RECEIPT
=========================================
Transaction ID : ${paymentSuccess.transactionId}
Date & Time    : ${new Date(paymentSuccess.date).toLocaleString()}
User Name      : ${homeownerData?.name || 'Homeowner'}
User Address   : ${homeownerData?.address || 'N/A'}
-----------------------------------------
Supplied Energy: ${totalKwh.toFixed(2)} kWh
Rate           : ₹6.00 / kWh
Payment Method : ${paymentSuccess.method}
-----------------------------------------
TOTAL PAID     : ₹${paymentSuccess.amount}
STATUS         : SUCCESS / PAID
=========================================
Thank you for using WattEveR Smart Grid!
`;
    const element = document.createElement("a");
    const file = new Blob([receiptText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${paymentSuccess.transactionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // If payment succeeded, show receipt success screen
  if (paymentSuccess) {
    return (
      <div className="space-y-6 py-4">
        
        {/* Success Card */}
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/25 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Payment Successful</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transaction recorded and billing cycle reset</p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹{paymentSuccess.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">{paymentSuccess.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
              <span className="text-slate-700 dark:text-slate-300">{new Date(paymentSuccess.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Method:</span>
              <span className="text-slate-700 dark:text-slate-300">{paymentSuccess.method}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#070b13] font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Receipt</span>
            </button>
            <Link
              to="/payment/history"
              onClick={playButtonClick}
              className="py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/5 font-bold text-xs flex items-center justify-center space-x-1 transition"
            >
              <History className="w-4 h-4" />
              <span>Payment History</span>
            </Link>
          </div>
        </div>

        <Link
          to="/dashboard"
          onClick={playButtonClick}
          className="block w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-[#070b13] font-bold text-sm text-center transition shadow-lg shadow-cyan-500/10"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      
      {/* Title */}
      <div className="flex items-center space-x-2.5">
        <Link 
          to="/dashboard/usage" 
          onClick={playButtonClick}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bill Payment</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review energy breakdown & complete payment</p>
        </div>
      </div>

      {/* Bill Summary */}
      <div className="p-5 rounded-2xl bg-[#f3f4f6] dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-250 dark:border-white/5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Amount Due</span>
          <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">₹{amountDue}</span>
        </div>

        {/* Appliance details breakdown */}
        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Usage Breakdown ({totalKwh.toFixed(1)} kWh)</p>
          
          <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-white/5 max-h-44 overflow-y-auto pr-1 dark-scrollbar">
            {Object.keys(deviceKwh).map((deviceId) => {
              const name = deviceId === 'ac' ? "Air Conditioner" :
                           deviceId === 'fridge' ? "Refrigerator" :
                           deviceId === 'tv' ? "Smart TV" :
                           deviceId === 'washingMachine' ? "Washing Machine" : "Ceiling Fan";
              const kwh = deviceKwh[deviceId] || 0;
              const cost = Math.round(kwh * 6);
              
              if (kwh === 0) return null;

              return (
                <div key={deviceId} className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{name} ({kwh} kWh)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">₹{cost}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Forms */}
      {amountDue <= 0 ? (
        <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-500/20 text-center space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Bill Fully Paid</h4>
          <p className="text-[10px] text-slate-550 dark:text-slate-400">Current month's cycle is settled. Next bill will generate as load accumulates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-center font-bold">
            <button
              onClick={() => { playButtonClick(); setMethod('card'); }}
              className={`py-2 rounded-md transition ${method === 'card' ? 'bg-cyan-500 text-[#070b13]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Card
            </button>
            <button
              onClick={() => { playButtonClick(); setMethod('upi'); }}
              className={`py-2 rounded-md transition ${method === 'upi' ? 'bg-cyan-500 text-[#070b13]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              UPI
            </button>
            <button
              onClick={() => { playButtonClick(); setMethod('netbank'); }}
              className={`py-2 rounded-md transition ${method === 'netbank' ? 'bg-cyan-500 text-[#070b13]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Net
            </button>
          </div>

          <form onSubmit={handlePayNow} className="bg-[#f3f4f6] dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-4 rounded-xl space-y-4">
            
            {/* 1. CREDIT/DEBIT CARD */}
            {method === 'card' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      required
                      maxLength="3"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. UPI */}
            {method === 'upi' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">Enter UPI ID</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="username@upi"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. NET BANKING */}
            {method === 'netbank' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">Select Bank</label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#070b13] font-bold text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#070b13] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  <span>Pay ₹{amountDue} Now</span>
                </>
              )}
            </button>

          </form>

        </div>
      )}

    </div>
  );
}
