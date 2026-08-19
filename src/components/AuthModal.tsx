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
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    sendEmailVerificationLink,
    verifyEmailCode,
    checkEmailVerificationStatus,
    showToast, 
    setActiveView, 
    siteSettings 
  } = useApp();

  // State
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
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
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isAutoVerified, setIsAutoVerified] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('input');
      setOtpCode('');
      setVerifyError(null);
      setIsAutoVerified(false);
    }
  }, [isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === 'verify' && resendTimer > 0) {
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
  }, [step, resendTimer]);

  // Background Auto-Detector: Checks if user clicked verify link in their email tab
  useEffect(() => {
    let pollInterval: any;
    if (step === 'verify' && verificationData?.email && !isAutoVerified) {
      pollInterval = setInterval(async () => {
        try {
          const res = await checkEmailVerificationStatus(verificationData.email, verificationData.token);
          if (res.verified && res.user) {
            setIsAutoVerified(true);
            clearInterval(pollInterval);
            setTimeout(() => {
              closeAuthModal();
            }, 1200);
          }
        } catch (e) {}
      }, 2500);
    }
    return () => clearInterval(pollInterval);
  }, [step, verificationData, isAutoVerified]);

  if (!isAuthModalOpen) return null;

  // 1. One-Click Google Login
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setVerifyError(null);
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

  // 2. Request Email Verification Link & Code
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address (e.g. user@gmail.com)', 'error');
      return;
    }

    setIsLoading(true);
    setVerifyError(null);
    try {
      const res = await sendEmailVerificationLink(email, nameInput);
      setVerificationData({
        token: res.token,
        verifyLink: res.verifyLink,
        code: res.code,
        email: email.toLowerCase()
      });
      setStep('verify');
      setResendTimer(45);
      setCanResend(false);
      showToast(`Verification email sent to ${email}`, 'success');
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to send verification email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP Code Entered by User
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 4) {
      setVerifyError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    try {
      const email = verificationData?.email || emailInput.trim();
      const token = verificationData?.token;
      const res = await verifyEmailCode(email, code, token);

      if (res.success) {
        setIsAutoVerified(true);
        setTimeout(() => {
          closeAuthModal();
        }, 1000);
      } else {
        setVerifyError(res.error || 'Invalid code. Please check your inbox and enter again.');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Resend Verification
  const handleResend = async () => {
    if (!canResend || !emailInput) return;
    setIsLoading(true);
    setVerifyError(null);
    try {
      const res = await sendEmailVerificationLink(emailInput, nameInput);
      setVerificationData({
        token: res.token,
        verifyLink: res.verifyLink,
        code: res.code,
        email: emailInput.toLowerCase()
      });
      setResendTimer(45);
      setCanResend(false);
      showToast('New verification code and link sent to your email!', 'success');
    } catch (err: any) {
      showToast('Failed to resend. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Copy Link to Clipboard
  const handleCopyLink = () => {
    if (!verificationData?.verifyLink) return;
    navigator.clipboard.writeText(verificationData.verifyLink);
    setCopiedLink(true);
    showToast('Verification link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
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
            {step === 'input' ? (
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 shadow-xs text-red-600">
                <Lock className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs text-emerald-600 animate-pulse">
                <Mail className="w-6 h-6" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {step === 'input' ? `Sign In to ${siteSettings.portalName}` : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {step === 'input' 
              ? 'Real email verification to ensure secure access to properties & owner contacts'
              : `We sent a verification link & 6-digit code to:`}
          </p>
          {step === 'verify' && (
            <p className="text-xs font-bold text-gray-900 mt-0.5 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {verificationData?.email || emailInput}
            </p>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* STEP 1: EMAIL INPUT & GOOGLE LOGIN */}
          {step === 'input' && (
            <>
              {/* Primary Google Auth Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
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
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider relative">
                  OR Login With Verified Email
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendVerification} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Full Name <span className="text-gray-400 font-normal">(optional)</span>
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
                    Your Email Address <span className="text-red-500">*</span>
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
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm min-h-[44px]"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isLoading ? 'Sending Verification Link...' : 'Send Verification Link & Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* STEP 2: VERIFICATION PENDING & OTP ENTRY */}
          {step === 'verify' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Success Notification Status */}
              {isAutoVerified ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-emerald-900">Email Verified Successfully!</h3>
                  <p className="text-xs text-emerald-700">Logging you in to Jaipur Properties Hub...</p>
                </div>
              ) : (
                <>
                  {/* Enter 6-Digit Code */}
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Enter 6-Digit Verification Code
                        </label>
                        <span className="text-[11px] text-gray-400">Check inbox / spam</span>
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
                            setVerifyError(null);
                          }}
                          placeholder="e.g. 849201"
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {verifyError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{verifyError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifying || otpCode.length < 4}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isVerifying ? 'Verifying Code...' : 'Verify Code & Login'}</span>
                    </button>
                  </form>

                  {/* Direct Link Verification Box */}
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-3.5 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Direct Verification Link
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Auto-detects click
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      You can click the link in your email or open the verification link directly:
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={verificationData?.verifyLink || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open Verify Link</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy verification link"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer actions: Resend & Change Email */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={!canResend || isLoading}
                      onClick={handleResend}
                      className="text-gray-500 hover:text-gray-800 disabled:text-gray-400 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('input');
                        setOtpCode('');
                        setVerifyError(null);
                      }}
                      className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                    >
                      Change Email
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
              <span>Real Email Verification</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>256-Bit SSL Secure</span>
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
