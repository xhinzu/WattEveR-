import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, History, Clock, FileText, CheckCircle, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentHistory() {
  const { paymentHistory } = useApp();

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-5 pb-6">
      
      {/* Title */}
      <div className="flex items-center space-x-2.5">
        <Link 
          to="/dashboard/settings" 
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-4.5 h-4.5 text-cyan-400" />
            <span>Payment History</span>
          </h2>
          <p className="text-xs text-slate-400">All past billing cycles settled</p>
        </div>
      </div>

      {paymentHistory.length === 0 ? (
        // Empty State
        <div className="p-8 rounded-2xl bg-slate-900/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">No Payments Recorded</h3>
            <p className="text-xs text-slate-400 mt-1">Settled invoices will appear here once billing begins.</p>
          </div>
        </div>
      ) : (
        // Payment Logs
        <div className="space-y-3.5">
          {paymentHistory.map((pay) => (
            <div key={pay.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">TXN ID:</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{pay.transactionId}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(pay.date)}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-sm font-bold text-slate-200 flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pay.amount}</span>
                  </span>
                  
                  <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-950/40 border border-emerald-900/45 text-emerald-400">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Paid</span>
                  </span>
                </div>
              </div>

              {pay.paymentMethod && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Method</span>
                  <span className="font-semibold text-slate-400">{pay.paymentMethod}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
