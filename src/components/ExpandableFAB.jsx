/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Zap } from 'lucide-react';
import { playButtonClick } from '../utils/sounds';

export default function ExpandableFAB({ onSelect }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportActive, setIsReportActive] = useState(false);
  const menuRef = useRef(null);

  // Sync and verify active outage status on mount & interval
  useEffect(() => {
    const checkReportStatus = () => {
      const timeStr = localStorage.getItem('outage_report_time');
      if (timeStr) {
        const reportTime = new Date(timeStr).getTime();
        const now = new Date().getTime();
        const diffHours = (now - reportTime) / (1000 * 60 * 60);
        if (diffHours < 24) {
          setIsReportActive(true);
        } else {
          setIsReportActive(false);
        }
      } else {
        setIsReportActive(false);
      }
    };
    checkReportStatus();
    const interval = setInterval(checkReportStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isMenuOpen) {
          playButtonClick();
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleMainClick = () => {
    playButtonClick();
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    {
      id: 'chatbot',
      label: 'Assistant',
      icon: MessageSquare,
      colorClass: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20 text-white',
      target: 'chatbot'
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: Zap,
      colorClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white',
      target: 'emergency',
      badge: isReportActive ? 'Report Active' : null
    }
  ];

  return (
    <div ref={menuRef} className="relative flex flex-col items-end">
      {/* Dimmed Overlay backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#070b13]/60 backdrop-blur-[2px] transition-opacity duration-300 z-30 pointer-events-auto"
          onClick={() => { playButtonClick(); setIsMenuOpen(false); }}
        />
      )}

      {/* Fanned out menu items */}
      <div className="absolute bottom-16 right-0 flex flex-col items-end space-y-3 z-40 pointer-events-none mb-1">
        {menuItems.map((item, index) => {
          const delay = isMenuOpen ? `${index * 75}ms` : '0ms';
          return (
            <div
              key={item.id}
              style={{
                transitionDelay: delay,
                transform: isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.75)',
                opacity: isMenuOpen ? 1 : 0,
              }}
              className="flex items-center space-x-2 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
            >
              {/* Active badge */}
              {item.badge && isMenuOpen && (
                <span 
                  style={{
                    transitionDelay: isMenuOpen ? `${index * 75 + 150}ms` : '0ms',
                  }}
                  className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse pointer-events-auto"
                >
                  {item.badge}
                </span>
              )}

              {/* Label */}
              <span 
                style={{
                  transitionDelay: isMenuOpen ? `${index * 75 + 100}ms` : '0ms',
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(12px)',
                  opacity: isMenuOpen ? 1 : 0,
                }}
                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md transition-all duration-300 ease-out pointer-events-auto whitespace-nowrap"
              >
                {item.label}
              </span>
              
              {/* Circle Action Button */}
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  onSelect(item.target);
                  setIsMenuOpen(false);
                }}
                className={`w-10 h-10 rounded-full ${item.colorClass} flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer`}
                title={item.label}
              >
                <item.icon className="w-4.5 h-4.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Trigger FAB */}
      <button
        type="button"
        onClick={handleMainClick}
        className="w-12 h-12 rounded-full bg-transparent border border-cyan-500/40 dark:border-cyan-400/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10 shadow-md flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer z-40 relative pointer-events-auto animate-chatbot-pulse"
        title="Support & Services"
      >
        <svg 
          viewBox="0 0 24 24" 
          className={`w-5 h-5 fill-current transition-transform duration-300 ${
            isMenuOpen ? 'rotate-45' : ''
          }`}
        >
          <circle cx="5" cy="5" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </svg>

        {/* Warning notification dot */}
        {isReportActive && !isMenuOpen && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 border border-white dark:border-slate-900 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-extrabold text-white animate-pulse">
            !
          </span>
        )}
      </button>
    </div>
  );
}
