import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, Building2, Lock } from 'lucide-react';

export const PostPropertyPortal: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Only Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Property Posting Restricted to Admin
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Public property posting has been disabled. Only the official site administrator (<strong className="text-slate-900">Sanju Meena</strong>) can publish and manage verified listings on Jaipur Properties Hub.
          </p>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-2xl max-w-md mx-auto text-xs space-y-1 shadow-md">
          <p className="font-bold text-amber-400">Admin Login Credentials:</p>
          <p className="font-mono text-gray-300">Email: sanjumeena@gmail.com</p>
          <p className="font-mono text-gray-300">Password: sanju@8233</p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setActiveView('admin')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Secure Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
