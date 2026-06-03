/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Zap, Phone, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAlert } from '../utils/sounds';
import { submitOutageReport } from '../firebase';

export default function EmergencyButton({ isOpen, onClose }) {
  const { currentUser } = useApp();
  const [formStep, setFormStep] = useState('options'); // 'options' | 'form' | 'success'
  const [issueType, setIssueType] = useState('Power Outage');
  const [description, setDescription] = useState('');
  const [reportId, setReportId] = useState('');

  // Reset form step to options when opened
  useEffect(() => {
    if (isOpen) {
      setFormStep('options');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = currentUser?.email || 'unknown@energy.com';
    try {
      const id = await submitOutageReport(userEmail, issueType, description);
      setReportId(id);
      localStorage.setItem('outage_report_time', new Date().toISOString());
      setFormStep('success');
      setDescription('');
    } catch (err) {
      console.error('Failed to submit outage report:', err);
    }
  };

  const waPrefilledText = encodeURIComponent(
    `Hi, I am experiencing a power outage at my address. My WattEveR account: ${currentUser?.email || 'unknown@energy.com'}. Please assist.`
  );

  return (
    <div className="relative">
      {/* Outage Popup */}
      <div 
        className={`absolute bottom-16 right-0 w-[320px] h-[450px] bg-[#0f0b0b] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/20 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right text-slate-100 z-50 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-red-950/30 via-red-900/10 to-transparent border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
              <Zap className="w-4 h-4 fill-red-500/10" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-red-400 tracking-wide uppercase">Power Outage Support</h3>
              <p className="text-[9px] text-slate-400 font-medium">Contact your service provider instantly</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { playAlert(); onClose(); }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/25 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-400 font-medium leading-tight">
            Only use this in case of a power outage or electrical emergency
          </p>
        </div>

        {/* Dynamic Step Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 dark-scrollbar">
          {formStep === 'options' && (
            <div className="space-y-3">
              {/* Option 1: Hotline */}
              <a 
                href="tel:1912"
                onClick={playAlert}
                className="block p-3.5 rounded-xl bg-red-950/25 hover:bg-red-950/40 border border-red-500/20 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-200">Emergency Hotline</h4>
                      <p className="text-[10px] text-slate-400">Call 1912 (National Helpline)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-red-400 group-hover:underline">Call Now</span>
                </div>
              </a>

              {/* Option 2: WhatsApp */}
              <a 
                href={`https://wa.me/1912?text=${waPrefilledText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playAlert}
                className="block p-3.5 rounded-xl bg-[#0a1e12] hover:bg-[#0c2718] border border-emerald-500/20 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.511 0 9.998-4.486 10-10 .003-2.673-1.03-5.186-2.91-7.07C16.581 1.648 14.075.617 11.42.617 5.909.617 1.42 5.102 1.418 10.61c0 1.637.452 3.235 1.311 4.645L1.7 21.2l6.094-1.597c1.396.762 2.875 1.164 4.394 1.164H11.4zm6.732-9.15c-.3-.15-1.774-.875-2.046-.975-.27-.1-.47-.15-.67.15-.2.3-.77.975-.94 1.175-.17.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.018-.91-1.7-2.03-1.9-2.33-.2-.3-.02-.46.13-.61.13-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.67-1.625-.92-2.225-.24-.58-.49-.5-.67-.513-.17-.008-.37-.01-.57-.01-.2 0-.52.075-.79.37-.27.3-1.04 1.02-1.04 2.487s1.07 2.875 1.22 3.075c.15.2 2.1 3.2 5.09 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.08 1.77-.725 2.02-1.4.25-.675.25-1.25.17-1.375-.07-.125-.27-.2-.57-.35z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-200">WhatsApp Support</h4>
                      <p className="text-[10px] text-slate-400">Send instant support message</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 group-hover:underline">WhatsApp Us</span>
                </div>
              </a>

              {/* Option 3: Form */}
              <button 
                type="button"
                onClick={() => { playAlert(); setFormStep('form'); }}
                className="w-full block p-3.5 rounded-xl bg-orange-950/15 hover:bg-orange-950/25 border border-orange-500/20 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-200">Report via App</h4>
                      <p className="text-[10px] text-slate-400">File a digital outage ticket</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-400 group-hover:underline">Report Outage</span>
                </div>
              </button>
            </div>
          )}

          {formStep === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full text-sm bg-slate-900 border border-red-500/30 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500 transition"
                >
                  <option value="Power Outage">Power Outage</option>
                  <option value="Voltage Fluctuation">Voltage Fluctuation</option>
                  <option value="Complete Blackout">Complete Blackout</option>
                  <option value="Partial Power Loss">Partial Power Loss</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Description <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full text-sm bg-slate-900 border border-red-500/30 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500 transition resize-none placeholder-slate-700"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { playAlert(); setFormStep('options'); }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md shadow-red-500/10 transition cursor-pointer text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}

          {formStep === 'success' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 animate-bounce">
                <Zap className="w-8 h-8 fill-red-500/10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-wide">Report Submitted</h4>
                <p className="text-xs text-slate-300 px-2 leading-relaxed font-medium">
                  Your outage report has been submitted. A technician will be assigned shortly.
                </p>
              </div>
              <div className="bg-red-950/20 border border-red-500/20 px-4 py-2 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Report ID</p>
                <p className="text-lg font-extrabold text-red-400 tracking-widest mt-1">{reportId}</p>
              </div>
              <button
                type="button"
                onClick={() => { playAlert(); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer text-xs font-bold mt-2"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
