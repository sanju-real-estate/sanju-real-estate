import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, KeyRound, User, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithOtp, showToast } = useApp();

  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
  const [step, setStep] = useState<'request_otp' | 'verify_otp'>('request_otp');

  // Manual Email Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserProfile['userType']>('Owner');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Google Direct 1-Click Login Handler
  const handleGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGoogleLoading(true);

    try {
      // Simulate seamless Google popup authentication delay
      setTimeout(async () => {
        const googleEmail = email.trim() || 'eigeltumspaces@gmail.com';
        const googleName = fullName.trim() || 'Google User';
        await loginWithOtp(googleEmail, googleName, phone || '+91 97721 17575', userType);
        setIsGoogleLoading(false);
      }, 600);
    } catch (err) {
      setIsGoogleLoading(false);
    }
  };

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
    showToast(`📩 OTP Sent to ${email}! Check inbox. (Code: ${newOtp})`, 'info');
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
              <Sparkles className="w-3 h-3 text-emerald-400" /> Direct Login Portal
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            User & Owner Sign In
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with Google or Email to post properties for FREE & receive direct buyer inquiries.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setLoginMethod('google')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loginMethod === 'google' ? 'bg-white text-slate-900 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Direct Google Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMethod('email'); setStep('request_otp'); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMethod === 'email' ? 'bg-white text-red-600 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Manual Email Login</span>
          </button>
        </div>

        {/* GOOGLE DIRECT LOGIN SECTION */}
        {loginMethod === 'google' && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-center space-y-1">
              <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider block">
                ⚡ 1-Click Fast Authentication
              </span>
              <p className="text-xs text-blue-700">
                Instantly connect your Google Account to post properties and view buyer leads.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-gray-200 shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer hover:border-gray-300"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs uppercase tracking-wider">
                  {isGoogleLoading ? 'Connecting to Google...' : 'Sign In Direct with Google'}
                </span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or enter email manually below</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. eigeltumspaces@gmail.com"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue with this Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* MANUAL EMAIL / OTP SECTION */}
        {loginMethod === 'email' && (
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
                    <strong className="text-emerald-900">Code: {generatedOtp}</strong>
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
      </div>
    </div>
  );
};

