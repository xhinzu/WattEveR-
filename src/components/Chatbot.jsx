import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot, X, Send } from 'lucide-react';
import { playButtonClick } from '../utils/sounds';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your WattEveR Assistant. How can I help you today?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);

  const suggestions = [
    "How do I turn off a device?",
    "Why is my bill so high?",
    "How do I set a wattage limit?",
    "What do the alerts mean?",
    "How do I pay my bill?"
  ];

  const getBotResponse = (text) => {
    const input = text.toLowerCase();
    
    // Exact or keyword match
    if (input.includes("how do i turn off a device") || input.includes("turn off")) {
      return "Go to the Devices tab, find the appliance you want and tap the ON/OFF toggle on the right side of the device card. It will instantly stop drawing power.";
    }
    if (input.includes("why is my bill high") || input.includes("bill") || input.includes("expensive")) {
      return "Your bill is based on total kWh consumed this month. Check the Usage tab to see which device is consuming the most. Usually the AC is the biggest contributor. Try setting a lower wattage limit for it.";
    }
    if (input.includes("wattage limit") || input.includes("set limit") || input.includes("limit")) {
      return "Go to the Limits tab. Each device has a slider — drag it to set the maximum allowed watts. Tap Update to save. You will get an alert if the device exceeds that limit.";
    }
    if (input.includes("alerts") || input.includes("notification") || input.includes("warning")) {
      return "Alerts are triggered when a device draws more power than its set limit. You can view all alerts in the Alerts tab. Each alert shows the device name, time, and how much it exceeded the limit.";
    }
    if (input.includes("pay bill") || input.includes("payment") || input.includes("pay")) {
      return "Go to the Usage tab and tap Pay Bill Now. You can pay using UPI, Credit/Debit Card, or Net Banking. After payment a receipt will be generated for you.";
    }
    if (input.includes("dark mode") || input.includes("light mode") || input.includes("theme")) {
      return "You can switch between dark and light mode in the Budget tab under Profile & Settings. Toggle the Interface Theme switch to change instantly.";
    }
    if (input.includes("what is wattever") || input.includes("about") || input.includes("app")) {
      return "WattEveR is a smart energy monitoring app. It tracks real-time power consumption of all your home appliances, alerts you when limits are exceeded, estimates your monthly bill, and lets you control devices remotely.";
    }
    if (input.includes("kwh") || input.includes("units") || input.includes("energy")) {
      return "kWh stands for kilowatt-hour — it is the unit used to measure electricity consumption. 1 kWh = 1 unit on your electricity bill. WattEveR calculates this automatically based on your live device usage.";
    }
    
    return "I am not sure about that. Try asking about devices, alerts, limits, bill payment, or your usage. You can also tap one of the suggested questions above!";
  };

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    // Play button click sound using existing sound system
    playButtonClick();

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Quick-tap suggestions disappear after first message
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    // Show typing indicator for 1 second before bot replies
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getBotResponse(text);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className="relative">
      {/* Chat Popup */}
      <div 
        className={`absolute bottom-16 left-0 w-[320px] h-[450px] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-transparent border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">WattEveR Assistant</h3>
              <p className="text-[9px] text-emerald-500 dark:text-emerald-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { playButtonClick(); setIsOpen(false); }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 dark-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 text-cyan-600 dark:text-cyan-400 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center space-x-1.5 shadow-sm">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          {/* Suggestion Chips */}
          {showSuggestions && !isTyping && (
            <div className="pt-2 flex flex-col space-y-1.5">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Suggested Questions</p>
              <div className="flex flex-col space-y-1.5 items-start">
                {suggestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="text-[11px] text-left px-3 py-1.5 rounded-xl bg-cyan-50/70 hover:bg-cyan-500 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-500/20 hover:text-white dark:hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-200 cursor-pointer w-full max-w-full font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
          className="p-3 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0b0f19]/50 backdrop-blur-sm flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-[13px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2 rounded-xl flex items-center justify-center transition cursor-pointer ${
              inputText.trim() 
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-600 active:scale-95' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => { playButtonClick(); setIsOpen(!isOpen); }}
        className={`w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 animate-chatbot-pulse transform hover:scale-105 active:scale-95 cursor-pointer z-50`}
        title="WattEveR Assistant"
      >
        <MessageSquare className="w-5 h-5 fill-white/10" />
      </button>
    </div>
  );
}
