import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Send, Bot, User, Calculator, ArrowRight, Building } from 'lucide-react';
import { APP_LOGO } from '../assets/logo';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AiAssistantDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, selectedCity, setActiveView } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I'm your Real Estate Advisor. Ask me anything about home loans, rental yields, top investment localities in ${selectedCity}, or property valuation.`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAiDrawerOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let aiText = "Based on market trends, properties in major tech corridors like Whitefield, Gachibowli, and Bandra West have shown 8-12% annual capital appreciation with standard 3.2-4.5% rental yields.";
      const qLower = query.toLowerCase();

      if (qLower.includes('loan') || qLower.includes('interest')) {
        aiText = "Current home loan interest rates in India range between 8.35% and 8.85% p.a. (floating). Top banks like HDFC, ICICI, and SBI offer maximum loan tenure up to 30 years with zero pre-payment charges.";
      } else if (qLower.includes('yield') || qLower.includes('rent')) {
        aiText = "Rental yield is calculated as (Annual Rental Income / Property Purchase Price) * 100. Commercial properties offer 7-10% yield, while residential flats average 3.0-4.2% yield in top metropolitan hubs.";
      } else if (qLower.includes('bangalore') || qLower.includes('whitefield')) {
        aiText = "Bangalore's Whitefield, Sarjapur Road, and Hebbal are prime investment hubs. Whitefield offers strong rental demand from IT professionals with Purple Line metro access.";
      } else if (qLower.includes('mumbai') || qLower.includes('bandra')) {
        aiText = "Mumbai's Bandra West, Chembur, and Borivali East represent excellent residential corridors with sea view luxury units, freeway access, and high resale liquidity.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText }]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsAiDrawerOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-slate-900 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <img 
                src={APP_LOGO} 
                alt="Jaipur Properties Logo" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried) {
                    target.dataset.tried = '1';
                    target.src = '/assets/images/logo1.jpg';
                  } else if (target.dataset.tried === '1') {
                    target.dataset.tried = '2';
                    target.src = '/logo1.jpg';
                  }
                }}
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-700"
              />
              <div>
                <h3 className="text-sm font-bold text-white">Real Estate Assistant</h3>
                <p className="text-[11px] text-slate-400">Property & Investment Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => handleSend("What are current home loan interest rates in India?")}
              className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full"
            >
              Home Loan Rates
            </button>
            <button
              onClick={() => handleSend("Top localities for investment in " + selectedCity)}
              className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full"
            >
              Top Localities
            </button>
            <button
              onClick={() => handleSend("How to calculate rental yield?")}
              className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full"
            >
              Rental Yield
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 text-xs text-slate-400 items-center">
                <Bot className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Advisor is analyzing market metrics...</span>
              </div>
            )}
          </div>

          {/* Footer CTA & Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            <button
              onClick={() => {
                setIsAiDrawerOpen(false);
                setActiveView('valuation');
              }}
              className="w-full bg-amber-400/10 border border-amber-400/30 text-amber-300 py-2 rounded-xl text-xs font-bold hover:bg-amber-400/20 transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch Property Valuation Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask property questions..."
                className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
