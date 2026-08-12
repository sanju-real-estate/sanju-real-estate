import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Mail, Phone, ShieldCheck, Lock, ArrowRight, Building2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, login, signup, showToast } = useApp();
  const [isLogin, setIsLogin] = useState<boolean>(authMode === 'login');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'Buyer / Tenant' | 'Owner' | 'Agent / Builder'>('Owner');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (!email.trim() || !password) {
        showToast('Please enter your email and password', 'error');
        return;
      }
      await login(email, password);
    } else {
      if (!name.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (!email.trim() || !phone.trim()) {
        showToast('Please enter email and mobile number', 'error');
        return;
      }
      if (!password || password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      await signup(name, email, phone, password, confirmPassword, userType, 'Jaipur');
    }
  };

  const fillDemoUser = () => {
    setName('Rajesh Sharma');
    setEmail('rajesh.sharma@example.com');
    setPhone('+91 98290 12345');
    setPassword('Password123');
    setConfirmPassword('Password123');
    setUserType('Owner');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Jaipur Properties Hub
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isLogin ? 'Welcome Back!' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isLogin 
              ? 'Sign in securely with your Firebase Authentication account.' 
              : 'Register a verified account in Firebase Authentication & Firestore.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isLogin ? 'bg-white text-slate-900 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            Register (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 97721 17575"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Owner', 'Agent / Builder', 'Buyer / Tenant'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      userType === type
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Fill Demo Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={fillDemoUser}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>✨ Fill with Demo Credentials</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLogin ? 'Sign In to Portal' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Secure MongoDB Authentication with BCrypt & HTTP-only Cookie</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
