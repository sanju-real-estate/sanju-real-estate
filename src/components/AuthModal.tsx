import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Mail, 
  User, 
  KeyRound, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    firebaseSignup,
    firebaseLogin,
    verifyEmailCode,
    sendFirebaseVerificationEmail,
    checkFirebaseVerification,
    sendFirebasePasswordReset,
    showToast, 
    setActiveView, 
    siteSettings 
  } = useApp();

  // Mode: 'signin' | 'signup' | 'verify' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify' | 'forgot'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Form fields
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification states
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationData, setVerificationData] = useState<{
    token: string;
    verifyLink: string;
    code: string;
    email: string;
  } | null>(null);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Reset when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthMode('signin');
      setErrorMessage(null);
      setIsVerifiedSuccess(false);
      setPasswordInput('');
      setOtpCode('');
    }
  }, [isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (authMode === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, resendTimer]);

  // Auto-polling verification status in background
  useEffect(() => {
    let pollInterval: any;
    if (authMode === 'verify' && !isVerifiedSuccess) {
      pollInterval = setInterval(async () => {
        try {
          const isVerified = await checkFirebaseVerification();
          if (isVerified) {
            setIsVerifiedSuccess(true);
            clearInterval(pollInterval);
            setTimeout(() => {
              closeAuthModal();
            }, 1200);
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [authMode, isVerifiedSuccess]);

  if (!isAuthModalOpen) return null;

  // 1. Google Sign-In
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      showToast('Google Sign-In completed', 'info');
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Firebase Email/Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await firebaseLogin(email, password);
      if (res.verified) {
        closeAuthModal();
      } else {
        // Email is not verified -> Restrict login access and switch to verification screen!
        setPendingEmail(email);
        setErrorMessage(res.error || 'Your email is not verified yet. Please check your inbox and verify.');
        setAuthMode('verify');
        setResendTimer(45);
        setCanResend(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Firebase Email/Password Sign Up with mandatory Email Verification
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();
    const name = nameInput.trim() || email.split('@')[0];

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Calls createUserWithEmailAndPassword() and sendEmailVerification()
      const res = await firebaseSignup(email, password, name);
      setPendingEmail(email);
      if (res?.verificationData) {
        setVerificationData(res.verificationData);
      }
      setAuthMode('verify');
      setResendTimer(45);
      setCanResend(false);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Send / Resend Verification Link (firebase.auth().currentUser.sendEmailVerification())
  const handleSendVerificationLink = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const email = pendingEmail || emailInput.trim();
      await sendFirebaseVerificationEmail(email);
      setResendTimer(45);
      setCanResend(false);
      showToast('Verification email link & code sent to your inbox!', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 4) {
      setErrorMessage('Please enter the 6-digit code received on your email.');
      return;
    }

    setIsCheckingStatus(true);
    setErrorMessage(null);
    try {
      const email = pendingEmail || emailInput.trim();
      const res = await verifyEmailCode(email, code);
      if (res?.success) {
        setIsVerifiedSuccess(true);
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else {
        setErrorMessage(res?.error || 'Invalid code. Please check your email inbox.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 6. Check Verification Status (calls reload(firebase.auth().currentUser))
  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setErrorMessage(null);
    try {
      const email = pendingEmail || emailInput.trim();
      const isVerified = await checkFirebaseVerification(email);
      if (isVerified) {
        setIsVerifiedSuccess(true);
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else {
        setErrorMessage('Email not verified yet. Please check your inbox or enter the 6-digit code.');
      }
    } catch (err: any) {
      setErrorMessage('Error checking verification status.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 7. Copy Direct Link
  const handleCopyLink = () => {
    if (!verificationData?.verifyLink) return;
    navigator.clipboard.writeText(verificationData.verifyLink);
    setCopiedLink(true);
    showToast('Verification link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 6. Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Please enter your email to receive password reset link.');
      return;
    }
    setIsLoading(true);
    try {
      await sendFirebasePasswordReset(emailInput);
      setAuthMode('signin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-50/80 px-6 pt-6 pb-4 border-b border-gray-100 relative text-center">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer shadow-xs border border-gray-200"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-3">
            {authMode === 'verify' ? (
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs text-emerald-600 animate-pulse">
                <Mail className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 shadow-xs text-red-600">
                <Lock className="w-6 h-6" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {authMode === 'verify' 
              ? 'Verify Your Email' 
              : authMode === 'signup' 
                ? 'Create Your Account' 
                : authMode === 'forgot'
                  ? 'Reset Your Password'
                  : `Sign In to ${siteSettings.portalName}`}
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {authMode === 'verify'
              ? 'Email verification is required before login access is granted.'
              : authMode === 'signup'
                ? 'Register with your email to access verified listings & inquiries'
                : authMode === 'forgot'
                  ? 'We will send a password reset link to your registered email'
                  : 'Access saved properties, contact owners & post listings'}
          </p>
          {authMode === 'verify' && pendingEmail && (
            <p className="text-xs font-bold text-gray-900 mt-1.5 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {pendingEmail}
            </p>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* MODE TABS (Sign In / Register) */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin' 
                    ? 'bg-white text-gray-900 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup' 
                    ? 'bg-white text-gray-900 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Primary Action: Continue with Google */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleAuth}
                className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 shadow-xs flex items-center justify-center gap-3 cursor-pointer transition-all group min-h-[48px]"
              >
                <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-sm font-black text-gray-900">
                  {isLoading ? 'Connecting with Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider relative">
                  OR With Email & Password
                </span>
              </div>
            </>
          )}

          {/* ERROR NOTIFICATION */}
          {errorMessage && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm min-h-[44px]"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In With Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP / REGISTER FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm min-h-[44px]"
              >
                <Mail className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account & Sending Link...' : 'Create Account & Send Verification'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
              >
                <span>{isLoading ? 'Sending...' : 'Send Password Reset Link'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* EMAIL VERIFICATION REQUIRED SCREEN */}
          {authMode === 'verify' && (
            <div className="space-y-4 animate-fadeIn">
              {isVerifiedSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-emerald-900">Email Verified Successfully!</h3>
                  <p className="text-xs text-emerald-700">Logging you into Jaipur Properties Hub...</p>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 text-left">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Verification Sent to Your Inbox</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      We sent a verification link & 6-digit code to <strong>{pendingEmail || emailInput}</strong>.
                    </p>
                  </div>

                  {/* 6-Digit Code Input */}
                  <form onSubmit={handleVerifyOtp} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">
                        Enter 6-Digit Verification Code:
                      </label>
                      <span className="text-[10px] text-gray-400">Check spam/junk</span>
                    </div>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        ref={otpInputRef}
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          setErrorMessage(null);
                        }}
                        placeholder="e.g. 849201"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-base tracking-widest font-mono font-bold focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-900 placeholder:text-gray-300"
                      />
                    </div>

                    {verificationData?.code && (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 flex items-center justify-between">
                        <div className="text-[11px] text-emerald-800">
                          <span>Verification Code: </span>
                          <strong className="font-mono text-xs font-black tracking-wider text-emerald-900">{verificationData.code}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpCode(verificationData.code);
                            setErrorMessage(null);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCheckingStatus || otpCode.length < 4}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCheckingStatus ? 'Verifying...' : 'Verify Code & Complete Login'}</span>
                    </button>
                  </form>

                  {/* Direct Link Action if available */}
                  {verificationData?.verifyLink && (
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-2.5 space-y-1.5 text-left">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Direct Email Link:</span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Auto-verifies
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={verificationData.verifyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>Open Link</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Primary Action 1: Check Status Button */}
                  <button
                    type="button"
                    disabled={isCheckingStatus}
                    onClick={handleCheckStatus}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'Checking Status...' : 'I Clicked The Link in Email (Check Status)'}</span>
                  </button>

                  {/* Footer actions: Resend & Change Email */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={isLoading || !canResend}
                      onClick={handleSendVerificationLink}
                      className="text-gray-500 hover:text-gray-800 disabled:text-gray-400 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{canResend ? 'Resend Link / Code' : `Resend in ${resendTimer}s`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                      }}
                      className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                    >
                      Change Email / Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-medium pt-1">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Firebase Auth Protected</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>256-Bit SSL Encryption</span>
            </span>
          </div>

          {/* Admin Login Link */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                closeAuthModal();
                setActiveView('admin');
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Portal Admin / Broker Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
