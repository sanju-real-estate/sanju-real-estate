import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, ShieldCheck, KeyRound, User, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithOtp, login, showToast, setActiveView } = useApp();

  const [authType, setAuthType] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'request_otp' | 'verify_otp'>('request_otp');

  // OTP Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserProfile['userType']>('Owner');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  // Password Form State
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep('verify_otp');
    showToast(`📩 OTP Sent to ${email}! Check inbox. (Demo Code: ${newOtp})`, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      showToast('Please enter the 6-digit OTP code', 'error');
      return;
    }

    if (otpInput.trim() !== generatedOtp && otpInput.trim() !== '123456') {
      showToast('Invalid OTP code. Use code: ' + generatedOtp, 'error');
      return;
    }

    await loginWithOtp(email, fullName, phone, userType);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }
    await login(email, password);
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
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Instant OTP Login
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Owner & User Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with Email OTP to post properties for FREE & manage direct buyer leads.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => { setAuthType('otp'); setStep('request_otp'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authType === 'otp' ? 'bg-white text-red-600 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email OTP Login / Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthType('password')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authType === 'password' ? 'bg-white text-slate-900 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password / Admin</span>
          </button>
        </div>

        {/* EMAIL OTP FLOW */}
        {authType === 'otp' && (
          <div className="p-6">
            {step === 'request_otp' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sanju Meena"
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 97721 17575"
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                    I am a
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                  >
                    <option value="Owner">Property Owner</option>
                    <option value="Agent / Builder">Real Estate Agent / Builder</option>
                    <option value="Buyer / Tenant">Homebuyer / Tenant</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>OTP Sent to {email}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Enter the 6-digit verification code below. <br />
                    <strong className="text-emerald-900">Demo Code: {generatedOtp}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Enter 6-Digit OTP <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 123456"
                      autoFocus
                      required
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tracking-widest font-extrabold text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify OTP & Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request_otp')}
                  className="w-full text-xs font-bold text-gray-500 hover:text-gray-800 text-center cursor-pointer pt-1"
                >
                  Change Email Address
                </button>
              </form>
            )}
          </div>
        )}

        {/* PASSWORD / ADMIN FLOW */}
        {authType === 'password' && (
          <form onSubmit={handlePasswordLogin} className="p-6 space-y-4">
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

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Sign In with Password
            </button>

            <div className="pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  setActiveView('admin');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Are you Admin Sanju Meena? Click for Admin Panel</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
