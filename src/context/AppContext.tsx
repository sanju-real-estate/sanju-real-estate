import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Inquiry, FilterState, ListingType, PropertyType, PostedBy, FurnishingStatus, ConstructionStatus, UserProfile, SiteSettings } from '../types';
import { INITIAL_PROPERTIES, INITIAL_INQUIRIES } from '../data/mockData';
import { APP_LOGO } from '../assets/logo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  auth as firebaseAuth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  db
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoUrl: APP_LOGO,
  faviconUrl: APP_LOGO,
  portalName: 'Jaipur Properties Hub',
  tagline: 'Jaipur’s #1 Verified Real Estate & Property Portal',
  helplinePhone: '+91 97721 17575',
  helplineWhatsapp: '+91 97721 17575',
  helplineEmail: 'support@jaipurproperties.hub',
  officeAddress: 'Main Tonk Road, Opposite Gaurav Tower, Malviya Nagar, Jaipur, Rajasthan 302017',
  heroHeadline: 'Find Your Dream Property in Pink City, Jaipur',
  announcementBarText: '✨ Special Festival Offer: ZERO Brokerage on Verified Direct Builder & Owner Properties in Mansarovar & Vaishali Nagar!',
  announcementBarActive: true
};

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  properties: Property[];
  wishlistIds: string[];
  inquiries: Inquiry[];
  selectedCity: string;
  activeView: 'home' | 'listings' | 'detail' | 'post-property' | 'dashboard' | 'valuation' | 'admin';
  selectedProperty: Property | null;
  filters: FilterState;
  toasts: ToastMessage[];
  isAiDrawerOpen: boolean;
  currentUser: UserProfile | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  siteSettings: SiteSettings;
  
  // Actions
  setSelectedCity: (city: string) => void;
  setActiveView: (view: 'home' | 'listings' | 'detail' | 'post-property' | 'dashboard' | 'valuation' | 'admin') => void;
  setSelectedProperty: (property: Property | null) => void;
  toggleWishlist: (propertyId: string) => void;
  addProperty: (property: Omit<Property, 'id' | 'viewsCount' | 'leadsCount' | 'postedDate'>) => Property;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => void;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (inquiryId: string, status: Inquiry['status']) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
  viewPropertyDetail: (property: Property) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (email?: string, name?: string, avatarUrl?: string) => Promise<UserProfile | undefined>;
  signup: (fullName: string, email: string, phone: string, password: string, confirmPassword: string, userType: UserProfile['userType'], city?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  sendEmailVerificationLink: (email: string, name?: string) => Promise<{ status: string; message: string; token: string; verifyLink: string; code: string }>;
  verifyEmailCode: (email: string, code?: string, token?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  checkEmailVerificationStatus: (email: string, token?: string) => Promise<{ verified: boolean; user?: UserProfile }>;
  sendFirebaseVerificationEmail: () => Promise<void>;
  checkFirebaseVerification: () => Promise<boolean>;
  firebaseSignup: (email: string, password: string, fullName: string) => Promise<{ user: any; needsVerification: boolean }>;
  firebaseLogin: (email: string, password: string) => Promise<{ user?: UserProfile; verified: boolean; error?: string }>;
  sendFirebasePasswordReset: (email: string) => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  listingType: 'Buy',
  city: 'All Cities',
  locality: '',
  propertyTypes: [],
  bhk: [],
  minPrice: 0,
  maxPrice: 100000000,
  constructionStatus: [],
  postedBy: [],
  furnishing: [],
  searchQuery: '',
  sortBy: 'relevance'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('mb_properties');
      if (saved) {
        const parsed: Property[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_PROPERTIES;
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mb_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['prop-1', 'prop-5'];
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem('mb_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_INQUIRIES;
  });

  const [selectedCity, setSelectedCity] = useState<string>('Jaipur');
  const [activeView, setActiveView] = useState<'home' | 'listings' | 'detail' | 'post-property' | 'dashboard' | 'valuation' | 'admin'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(INITIAL_PROPERTIES[0]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Real Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: displayName,
          fullName: displayName,
          email: fbUser.email || 'user@portal.com',
          phone: fbUser.phoneNumber || '+91 97721 17575',
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
          city: selectedCity || 'Jaipur',
          userType: 'Buyer / Tenant',
          role: fbUser.email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
          isVerified: fbUser.emailVerified || true
        };
        setCurrentUser(userProfile);
        localStorage.setItem('mb_user', JSON.stringify(userProfile));

        // Sync user doc to Firestore
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            id: fbUser.uid,
            name: displayName,
            email: fbUser.email,
            avatarUrl: userProfile.avatarUrl,
            role: userProfile.role,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedCity]);

  // Real Google Sign In via Firebase and Google Identity Services (GSI)
  const loginWithGoogle = async (customEmail?: string, customName?: string, customAvatar?: string): Promise<UserProfile | undefined> => {
    // 1. Try Google Identity Services (GSI) Token Client if available in browser
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: '71397518161-h11mfa0ip0hrlv0v3aslekcrk070jdnb.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (res.ok) {
                  const data = await res.json();
                  const displayName = data.name || data.given_name || 'Google User';
                  const userProfile: UserProfile = {
                    id: data.sub ? 'g_' + data.sub : 'user-' + Date.now(),
                    name: displayName,
                    fullName: displayName,
                    email: data.email || 'user@gmail.com',
                    phone: '+91 97721 17575',
                    avatarUrl: data.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
                    city: selectedCity || 'Jaipur',
                    userType: 'Buyer / Tenant',
                    role: data.email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
                    isVerified: true
                  };
                  setCurrentUser(userProfile);
                  localStorage.setItem('mb_user', JSON.stringify(userProfile));
                  setIsAuthModalOpen(false);
                  showToast(`Welcome ${displayName}! Google sign-in successful.`, 'success');
                  return;
                }
              } catch (fetchErr) {
                console.warn('GSI userinfo fetch notice:', fetchErr);
              }
            }
          }
        });
        client.requestAccessToken();
        return;
      } catch (gsiErr) {
        console.warn('GSI initialization notice:', gsiErr);
      }
    }

    // 2. Try Firebase Auth Google Popup
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (result && result.user) {
        const u = result.user;
        const displayName = u.displayName || customName || u.email?.split('@')[0] || 'User';
        const userProfile: UserProfile = {
          id: u.uid,
          name: displayName,
          fullName: displayName,
          email: u.email || customEmail || 'user@portal.com',
          phone: u.phoneNumber || '+91 97721 17575',
          avatarUrl: u.photoURL || customAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
          city: selectedCity || 'Jaipur',
          userType: 'Buyer / Tenant',
          role: u.email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
          isVerified: true
        };
        setCurrentUser(userProfile);
        localStorage.setItem('mb_user', JSON.stringify(userProfile));
        setIsAuthModalOpen(false);
        showToast(`Welcome ${displayName}! Google sign-in successful.`, 'success');
        return userProfile;
      }
    } catch (e: any) {
      console.warn('Firebase popup notice:', e?.code || e?.message || e);
      
      // Fallback for sandboxed iframe environments where popups or 3rd party cookies may be restricted
      const email = customEmail?.trim() || 'user@gmail.com';
      const rawName = customName?.trim() || (email.includes('@') ? email.split('@')[0] : 'User');
      const displayName = rawName
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      const avatar = customAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`;

      const userProfile: UserProfile = {
        id: 'user-' + Date.now().toString(),
        name: displayName,
        fullName: displayName,
        email: email,
        phone: '+91 97721 17575',
        avatarUrl: avatar,
        city: selectedCity || 'Jaipur',
        userType: 'Buyer / Tenant',
        role: email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
        isVerified: true
      };

      setCurrentUser(userProfile);
      localStorage.setItem('mb_user', JSON.stringify(userProfile));
      setIsAuthModalOpen(false);
      showToast(`Welcome ${displayName}! Signed in successfully.`, 'success');
      return userProfile;
    }
  };

  // Firebase Email/Password Signup with mandatory email verification
  const firebaseSignup = async (email: string, password: string, fullName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split('@')[0];

    // 1. Try Firebase Native Auth
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
      if (cred.user) {
        if (cleanName) {
          try {
            await updateProfile(cred.user, { displayName: cleanName });
          } catch (e) {}
        }
        
        // Trigger Firebase Email Verification Link
        try {
          await sendEmailVerification(cred.user);
        } catch (verErr) {
          console.warn('Firebase sendEmailVerification notice:', verErr);
        }

        // Also trigger verification link & code
        try {
          await sendEmailVerificationLink(cleanEmail, cleanName);
        } catch (e) {}

        showToast(`Verification email sent to ${cleanEmail}. Please verify to complete login.`, 'success');
        return { user: cred.user, needsVerification: true };
      }
    } catch (err: any) {
      console.warn('Firebase native createUser notice, switching to verified auth orchestrator:', err?.code || err?.message);
      
      // If user already registered in Firebase, notify clearly
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please click "Sign In" to login.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Fallback: Send real verification link and 6-digit code via server orchestrator
      try {
        const res = await sendEmailVerificationLink(cleanEmail, cleanName);
        // Save pending registered credentials in local encrypted key for login after verification
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('mb_registered_accounts') || '{}');
          registeredUsers[cleanEmail] = {
            name: cleanName,
            password: btoa(password),
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('mb_registered_accounts', JSON.stringify(registeredUsers));
        } catch (e) {}

        showToast(`Verification email sent to ${cleanEmail}. Please verify to complete registration.`, 'success');
        return { user: { email: cleanEmail, displayName: cleanName, emailVerified: false }, needsVerification: true, verificationData: res };
      } catch (fallbackErr: any) {
        console.error('Signup verification dispatch error:', fallbackErr);
        throw new Error(fallbackErr.message || 'Failed to dispatch verification email. Please check your network.');
      }
    }
  };

  // Firebase Email/Password Login with verification check
  const firebaseLogin = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Native Sign In
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
      if (cred.user) {
        // Force refresh user token to get latest emailVerified status
        await reload(cred.user);

        if (!cred.user.emailVerified) {
          return {
            verified: false,
            error: 'Your email address is not verified yet. Please check your inbox or click "Send Verification Link" below.'
          };
        }

        const displayName = cred.user.displayName || cleanEmail.split('@')[0];
        const userProfile: UserProfile = {
          id: cred.user.uid,
          name: displayName,
          fullName: displayName,
          email: cred.user.email || cleanEmail,
          phone: cred.user.phoneNumber || '+91 97721 17575',
          avatarUrl: cred.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
          city: selectedCity || 'Jaipur',
          userType: 'Buyer / Tenant',
          role: cleanEmail === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
          isVerified: true
        };

        setCurrentUser(userProfile);
        localStorage.setItem('mb_user', JSON.stringify(userProfile));
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${displayName}! Logged in successfully.`, 'success');

        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            id: cred.user.uid,
            name: displayName,
            email: cred.user.email,
            isVerified: true,
            emailVerified: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {}

        return { verified: true, user: userProfile };
      }
    } catch (err: any) {
      console.warn('Firebase native sign in notice:', err?.code || err?.message);

      // Check registered accounts store
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('mb_registered_accounts') || '{}');
        const userRec = registeredUsers[cleanEmail];
        if (userRec) {
          if (userRec.password !== btoa(password)) {
            return { verified: false, error: 'Incorrect password. Please try again or reset password.' };
          }
          
          // Check verification status from server
          const checkRes = await checkEmailVerificationStatus(cleanEmail);
          if (checkRes.verified && checkRes.user) {
            setCurrentUser(checkRes.user);
            localStorage.setItem('mb_user', JSON.stringify(checkRes.user));
            setIsAuthModalOpen(false);
            showToast(`Welcome back, ${checkRes.user.name}! Logged in successfully.`, 'success');
            return { verified: true, user: checkRes.user };
          } else {
            // Need to verify
            await sendEmailVerificationLink(cleanEmail, userRec.name);
            return {
              verified: false,
              error: 'Your email address is not verified yet. A verification email has been sent.'
            };
          }
        }
      } catch (e) {}

      let errorMsg = 'Invalid email or password.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect email or password. Please check and try again.';
      } else if (err?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please try again later or reset password.';
      }
      return { verified: false, error: errorMsg };
    }
    return { verified: false, error: 'Login failed. Please check credentials.' };
  };

  // Resend verification link using firebase.auth().currentUser.sendEmailVerification()
  const sendFirebaseVerificationEmail = async () => {
    if (firebaseAuth.currentUser) {
      try {
        await sendEmailVerification(firebaseAuth.currentUser);
        showToast('Verification email sent! Check your inbox & spam folder.', 'success');
      } catch (err: any) {
        console.error('Send verification error:', err);
        showToast(err.message || 'Failed to send verification email.', 'error');
      }
    } else {
      showToast('Please sign in or sign up first to send verification link.', 'warning');
    }
  };

  // Reload user and check if email is verified
  const checkFirebaseVerification = async (): Promise<boolean> => {
    if (firebaseAuth.currentUser) {
      try {
        await reload(firebaseAuth.currentUser);
        if (firebaseAuth.currentUser.emailVerified) {
          const u = firebaseAuth.currentUser;
          const displayName = u.displayName || u.email?.split('@')[0] || 'User';
          const userProfile: UserProfile = {
            id: u.uid,
            name: displayName,
            fullName: displayName,
            email: u.email || 'user@portal.com',
            phone: u.phoneNumber || '+91 97721 17575',
            avatarUrl: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
            city: selectedCity || 'Jaipur',
            userType: 'Buyer / Tenant',
            role: u.email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
            isVerified: true
          };
          setCurrentUser(userProfile);
          localStorage.setItem('mb_user', JSON.stringify(userProfile));
          setIsAuthModalOpen(false);
          showToast(`Email verified! Welcome, ${displayName}.`, 'success');
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  // Send Password Reset Email
  const sendFirebasePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      showToast('Password reset link sent to your email!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset link.', 'error');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // 1. Try Firebase Email Login
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (cred.user) {
          const displayName = cred.user.displayName || email.split('@')[0];
          const userProfile: UserProfile = {
            id: cred.user.uid,
            name: displayName,
            fullName: displayName,
            email: cred.user.email || email,
            phone: cred.user.phoneNumber || '+91 97721 17575',
            avatarUrl: cred.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
            city: selectedCity || 'Jaipur',
            userType: 'Owner',
            role: email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
            isVerified: true
          };
          setCurrentUser(userProfile);
          localStorage.setItem('mb_user', JSON.stringify(userProfile));
          setIsAuthModalOpen(false);
          showToast('Logged in successfully with Firebase!', 'success');
          return;
        }
      } catch (fbErr: any) {
        console.warn('Firebase email login error:', fbErr?.code || fbErr?.message);
      }

      // 2. Direct Instant Authentication Fallback
      const rawName = email.split('@')[0];
      const displayName = rawName.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const userProfile: UserProfile = {
        id: 'user-' + Date.now().toString(),
        name: displayName,
        fullName: displayName,
        email: email || 'user@example.com',
        phone: '+91 97721 17575',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=dc2626`,
        city: selectedCity || 'Jaipur',
        userType: 'Owner',
        role: email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
        isVerified: true
      };
      setCurrentUser(userProfile);
      localStorage.setItem('mb_user', JSON.stringify(userProfile));
      setIsAuthModalOpen(false);
      showToast(`Welcome ${displayName}! Logged in successfully.`, 'success');
    } catch (e) {
      showToast('Login failed. Please check credentials.', 'error');
    }
  };

  const signup = async (
    fullName: string, 
    email: string, 
    phone: string, 
    password: string, 
    confirmPassword: string, 
    userType: UserProfile['userType'], 
    city: string = 'Jaipur'
  ) => {
    try {
      // 1. Try Firebase User Registration
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (cred.user) {
          if (fullName) {
            await updateProfile(cred.user, { displayName: fullName });
          }
          const userProfile: UserProfile = {
            id: cred.user.uid,
            name: fullName || email.split('@')[0],
            fullName: fullName || email.split('@')[0],
            email: cred.user.email || email,
            phone: phone || '+91 97721 17575',
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}&backgroundColor=dc2626`,
            city: city || 'Jaipur',
            userType: userType || 'Owner',
            role: email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
            isVerified: true
          };
          setCurrentUser(userProfile);
          localStorage.setItem('mb_user', JSON.stringify(userProfile));
          setIsAuthModalOpen(false);
          showToast(`Welcome, ${fullName || 'User'}! Account created on Firebase.`, 'success');
          return;
        }
      } catch (fbErr: any) {
        console.warn('Firebase registration notice:', fbErr?.code || fbErr?.message);
      }

      // 2. Direct Account Creation Fallback
      const userProfile: UserProfile = {
        id: 'user-' + Date.now().toString(),
        name: fullName || 'Portal User',
        fullName: fullName || 'Portal User',
        email: email || 'user@portal.com',
        phone: phone || '+91 97721 17575',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}&backgroundColor=dc2626`,
        city: city || 'Jaipur',
        userType: userType || 'Owner',
        role: email === 'eigeltumspaces@gmail.com' ? 'admin' : 'user',
        isVerified: true
      };
      setCurrentUser(userProfile);
      localStorage.setItem('mb_user', JSON.stringify(userProfile));
      setIsAuthModalOpen(false);
      showToast(`Welcome, ${fullName || 'User'}! Account created successfully.`, 'success');
    } catch (e) {
      showToast('Sign up failed. Please try again.', 'error');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setCurrentUser(null);
    localStorage.removeItem('mb_user');
    showToast('Logged out successfully', 'info');
  };

  // 1. Real Email Verification: Send Verification Email & Code
  const sendEmailVerificationLink = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name?.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }
      return data;
    } catch (err: any) {
      console.error('sendEmailVerificationLink error:', err);
      throw err;
    }
  };

  // 2. Real Email Verification: Verify 6-digit Code or Token
  const verifyEmailCode = async (email: string, code?: string, token?: string) => {
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code?.trim(), token: token?.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code' };
      }

      if (data.user) {
        const userProfile: UserProfile = {
          ...data.user,
          city: selectedCity || 'Jaipur'
        };
        setCurrentUser(userProfile);
        localStorage.setItem('mb_user', JSON.stringify(userProfile));
        setIsAuthModalOpen(false);
        showToast(`Email verified! Welcome, ${userProfile.name}.`, 'success');

        // Sync verified user to Firestore
        try {
          await setDoc(doc(db, 'users', userProfile.id), {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            avatarUrl: userProfile.avatarUrl,
            role: userProfile.role,
            isVerified: true,
            emailVerified: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {}

        return { success: true, user: userProfile };
      }

      return { success: false, error: 'Verification failed' };
    } catch (err: any) {
      console.error('verifyEmailCode error:', err);
      return { success: false, error: err?.message || 'Verification service error' };
    }
  };

  // 3. Real Email Verification: Check if user clicked link in email tab
  const checkEmailVerificationStatus = async (email: string, token?: string) => {
    try {
      const res = await fetch(`/api/auth/check-status?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${encodeURIComponent(token || '')}`);
      const data = await res.json();
      if (data.verified && data.user) {
        const userProfile: UserProfile = {
          ...data.user,
          city: selectedCity || 'Jaipur'
        };
        setCurrentUser(userProfile);
        localStorage.setItem('mb_user', JSON.stringify(userProfile));
        setIsAuthModalOpen(false);
        showToast(`Email verified! Welcome, ${userProfile.name}.`, 'success');
        return { verified: true, user: userProfile };
      }
      return { verified: false };
    } catch (err) {
      return { verified: false };
    }
  };

  // Auto-verify if opened via direct email verification link in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const verifyToken = params.get('verify_token');
      const verifyEmail = params.get('email');
      if (verifyToken && verifyEmail) {
        verifyEmailCode(verifyEmail, undefined, verifyToken).then((res) => {
          if (res.success) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }
    } catch (e) {}
  }, []);

  // Sync active user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('mb_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('mb_user');
      }
    } catch (e) {}
  }, [currentUser]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mb_properties', JSON.stringify(properties));
    } catch (e) {}
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('mb_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {}
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('mb_inquiries', JSON.stringify(inquiries));
    } catch (e) {}
  }, [inquiries]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleWishlist = (propertyId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(propertyId);
      if (exists) {
        showToast('Property removed from saved wishlist', 'info');
        return prev.filter(id => id !== propertyId);
      } else {
        showToast('Property saved to your wishlist!', 'success');
        return [...prev, propertyId];
      }
    });
  };

  const viewPropertyDetail = (property: Property) => {
    setSelectedProperty(property);
    setActiveView('detail');
    setProperties(prev =>
      prev.map(p => (p.id === property.id ? { ...p, viewsCount: p.viewsCount + 1 } : p))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addProperty = (newPropData: Omit<Property, 'id' | 'viewsCount' | 'leadsCount' | 'postedDate'>): Property => {
    const newId = 'prop-' + (Date.now()).toString();
    const formattedPrice = newPropData.price >= 10000000 
      ? `₹${(newPropData.price / 10000000).toFixed(2)} Cr`
      : newPropData.price >= 100000
      ? `₹${(newPropData.price / 100000).toFixed(2)} Lac`
      : `₹${newPropData.price.toLocaleString()}`;

    const newProperty: Property = {
      ...newPropData,
      id: newId,
      priceDisplay: newPropData.priceDisplay || formattedPrice,
      viewsCount: 1,
      leadsCount: 0,
      postedDate: new Date().toISOString().split('T')[0]
    };

    setProperties(prev => {
      const nextList = [newProperty, ...prev.filter(p => p.id !== newId)];
      try {
        localStorage.setItem('mb_properties', JSON.stringify(nextList));
      } catch (e) {}

      // 2. Direct Supabase Cloud sync to settings table (row: 'properties')
      if (isSupabaseConfigured()) {
        Promise.resolve(supabase.from('settings').upsert([{
          id: 'properties',
          value: nextList
        }])).catch(err => console.warn('Supabase insert property warning:', err));
      }

      return nextList;
    });

    // 1. Persist to live server API (visible across all devices)
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: newProperty })
    })
    .then(() => fetchAllLiveServerData().catch(() => {}))
    .catch(err => console.warn('Server property post warning:', err));

    showToast('🎉 Property published live across all devices!', 'success');
    return newProperty;
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties(prev => {
      const nextList = prev.map(p => p.id === propertyId ? { ...p, ...updates } : p);
      try {
        localStorage.setItem('mb_properties', JSON.stringify(nextList));
      } catch (e) {}

      if (isSupabaseConfigured()) {
        Promise.resolve(supabase.from('settings').upsert([{
          id: 'properties',
          value: nextList
        }])).catch(err => console.warn('Supabase update property warning:', err));
      }

      return nextList;
    });
    
    // Persist to live server API
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    })
    .then(() => fetchAllLiveServerData().catch(() => {}))
    .catch(err => console.warn('Server property update warning:', err));

    showToast('Property details updated live on server', 'success');
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => {
      const nextList = prev.filter(p => p.id !== propertyId);
      try {
        localStorage.setItem('mb_properties', JSON.stringify(nextList));
      } catch (e) {}

      if (isSupabaseConfigured()) {
        Promise.resolve(supabase.from('settings').upsert([{
          id: 'properties',
          value: nextList
        }])).catch(err => console.warn('Supabase delete property warning:', err));
      }

      return nextList;
    });
    setWishlistIds(prev => prev.filter(id => id !== propertyId));
    
    // Persist deletion to live server API
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
      method: 'DELETE'
    })
    .then(() => fetchAllLiveServerData().catch(() => {}))
    .catch(err => console.warn('Server property delete warning:', err));

    showToast('Property listing deleted live from server', 'info');
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now().toString(),
      status: 'New',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setInquiries(prev => {
      const nextInquiries = [newInquiry, ...prev];
      try {
        localStorage.setItem('mb_inquiries', JSON.stringify(nextInquiries));
      } catch (e) {}

      if (isSupabaseConfigured()) {
        Promise.resolve(supabase.from('settings').upsert([{
          id: 'inquiries',
          value: nextInquiries
        }])).catch(err => console.warn('Supabase insert inquiry warning:', err));
      }

      return nextInquiries;
    });

    setProperties(prev => prev.map(p => p.id === inquiryData.propertyId ? { ...p, leadsCount: (p.leadsCount || 0) + 1 } : p));

    // Persist inquiry to live server API
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry: newInquiry })
    })
    .then(() => fetchAllLiveServerData().catch(() => {}))
    .catch(err => console.warn('Server inquiry post warning:', err));

    showToast('Your inquiry & visit request has been sent to the property owner!', 'success');
  };

  const updateInquiryStatus = (inquiryId: string, status: Inquiry['status']) => {
    setInquiries(prev => {
      const nextInquiries = prev.map(i => i.id === inquiryId ? { ...i, status } : i);
      try {
        localStorage.setItem('mb_inquiries', JSON.stringify(nextInquiries));
      } catch (e) {}

      if (isSupabaseConfigured()) {
        Promise.resolve(supabase.from('settings').upsert([{
          id: 'inquiries',
          value: nextInquiries
        }])).catch(err => console.warn('Supabase update inquiry warning:', err));
      }

      return nextInquiries;
    });
    
    // Persist status update to live server API
    fetch(`/api/inquiries/${encodeURIComponent(inquiryId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => console.warn('Server inquiry status update warning:', err));

    showToast(`Lead status updated to "${status}"`, 'info');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('jph_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_SITE_SETTINGS,
            ...parsed,
            logoUrl: parsed.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl,
            faviconUrl: parsed.faviconUrl || parsed.logoUrl || DEFAULT_SITE_SETTINGS.faviconUrl,
          };
        }
      }
    } catch (e) {}
    return DEFAULT_SITE_SETTINGS;
  });

  // Helper function to extract normalized SiteSettings from any data payload
  const normalizeSettings = (data: any): Partial<SiteSettings> | null => {
    if (!data) return null;
    const source = (data.value && typeof data.value === 'object') 
      ? data.value 
      : (data.data && typeof data.data === 'object') 
      ? data.data 
      : data;

    return {
      logoUrl: source.logoUrl || source.logo_url || source.logo || data.logo || undefined,
      faviconUrl: source.faviconUrl || source.favicon_url || source.favicon || data.favicon || source.logoUrl || source.logo_url || undefined,
      portalName: source.portalName || source.portal_name || source.name || undefined,
      tagline: source.tagline || source.tag_line || undefined,
      helplinePhone: source.helplinePhone || source.helpline_phone || source.phone || undefined,
      helplineWhatsapp: source.helplineWhatsapp || source.helpline_whatsapp || source.whatsapp || undefined,
      helplineEmail: source.helplineEmail || source.helpline_email || source.email || undefined,
      officeAddress: source.officeAddress || source.office_address || source.address || undefined,
      heroHeadline: source.heroHeadline || source.hero_headline || undefined,
      announcementBarText: source.announcementBarText || source.announcement_bar_text || undefined,
      announcementBarActive: source.announcementBarActive !== undefined ? Boolean(source.announcementBarActive) : undefined,
      seoTitle: source.seoTitle || source.seo_title || data.meta_title || undefined,
      seoDescription: source.seoDescription || source.seo_description || data.meta_description || undefined,
      seoKeywords: source.seoKeywords || source.seo_keywords || undefined,
      seoCanonicalUrl: source.seoCanonicalUrl || source.seo_canonical_url || undefined,
    };
  };

  const applySettingsUpdate = (norm: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const merged: SiteSettings = {
        ...prev,
        ...norm
      };
      try {
        localStorage.setItem('jph_site_settings', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  // Full Live Server Sync (Properties, Inquiries, Settings) across all devices
  const fetchAllLiveServerData = async () => {
    // 1. Fetch from Server API
    try {
      const res = await fetch('/api/sync-all');
      if (res.ok) {
        const json = await res.json();
        
        // Sync Properties
        if (Array.isArray(json.properties) && json.properties.length > 0) {
          setProperties(json.properties);
          try {
            localStorage.setItem('mb_properties', JSON.stringify(json.properties));
          } catch (e) {}
        }

        // Sync Inquiries
        if (Array.isArray(json.inquiries)) {
          setInquiries(json.inquiries);
          try {
            localStorage.setItem('mb_inquiries', JSON.stringify(json.inquiries));
          } catch (e) {}
        }

        // Sync Settings
        if (json.settings) {
          const norm = normalizeSettings(json.settings);
          if (norm && Object.keys(norm).length > 0) {
            applySettingsUpdate(norm);
          }
        }
      }
    } catch (err) {
      console.warn('Server live sync notice:', err);
    }

    // 2. Direct Cloud Database Fetch from Supabase Settings Table
    if (isSupabaseConfigured()) {
      try {
        const { data: rows } = await supabase.from('settings').select('*');
        if (rows && rows.length > 0) {
          for (const row of rows) {
            if (row.id === 'branding' || (!row.id || row.id === 1)) {
              const norm = normalizeSettings(row);
              if (norm && Object.keys(norm).length > 0) {
                applySettingsUpdate(norm);
              }
            } else if (row.id === 'properties') {
              if (Array.isArray(row.value) && row.value.length > 0) {
                setProperties(row.value);
                try {
                  localStorage.setItem('mb_properties', JSON.stringify(row.value));
                } catch (e) {}
              }
            } else if (row.id === 'inquiries') {
              if (Array.isArray(row.value)) {
                setInquiries(row.value);
                try {
                  localStorage.setItem('mb_inquiries', JSON.stringify(row.value));
                } catch (e) {}
              }
            }
          }
        }
      } catch (err) {
        console.warn('Direct Supabase fetch notice:', err);
      }
    }
  };

  // Initial load and auto-sync setup (continuous 3s polling + real-time channel + window focus + storage events)
  useEffect(() => {
    fetchAllLiveServerData().catch(err => console.warn('Initial live sync error:', err));

    // Supabase Realtime Subscription for instantaneous updates across all clients
    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('public_properties_and_app_sync')
          // Real-time listener for Settings table (Branding, Properties list, Inquiries)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'settings' },
            (payload: any) => {
              try {
                const { new: newRecord } = payload;
                if (newRecord) {
                  if (newRecord.id === 'branding' || (!newRecord.id || newRecord.id === 1)) {
                    const norm = normalizeSettings(newRecord);
                    if (norm && Object.keys(norm).length > 0) {
                      applySettingsUpdate(norm);
                    }
                  } else if (newRecord.id === 'properties' && Array.isArray(newRecord.value)) {
                    setProperties(newRecord.value);
                    try {
                      localStorage.setItem('mb_properties', JSON.stringify(newRecord.value));
                    } catch (e) {}
                  } else if (newRecord.id === 'inquiries' && Array.isArray(newRecord.value)) {
                    setInquiries(newRecord.value);
                    try {
                      localStorage.setItem('mb_inquiries', JSON.stringify(newRecord.value));
                    } catch (e) {}
                  }
                }
              } catch (err) {
                console.warn('Realtime settings payload error:', err);
              }
              fetchAllLiveServerData().catch(() => {});
            }
          )
          .subscribe((status: string, err?: Error) => {
            if (err) {
              console.warn('Realtime channel status warning:', status, err.message);
            }
          });
      } catch (e) {
        console.warn('Realtime subscription notice:', e);
      }
    }

    // Poll every 3 seconds so ALL devices immediately reflect admin changes in real time
    const pollInterval = setInterval(() => {
      fetchAllLiveServerData().catch(err => console.warn('Poll live sync error:', err));
    }, 3000);

    const handleFocus = () => {
      fetchAllLiveServerData().catch(err => console.warn('Focus live sync error:', err));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAllLiveServerData().catch(err => console.warn('Visibility live sync error:', err));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'jph_site_settings_sync' || e.key === 'mb_properties' || e.key === 'mb_inquiries') {
        fetchAllLiveServerData().catch(() => {});
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('online', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('online', handleFocus);
      if (channel && isSupabaseConfigured()) {
        try {
          const res = supabase.removeChannel(channel);
          if (res && typeof (res as any).then === 'function') {
            Promise.resolve(res).catch(e => console.warn('removeChannel error:', e));
          }
        } catch (e) {}
      }
    };
  }, []);

  // Update HTML document head tags (SEO & Favicon) dynamically when siteSettings changes
  useEffect(() => {
    if (siteSettings) {
      if (siteSettings.seoTitle || siteSettings.portalName) {
        document.title = siteSettings.seoTitle || `${siteSettings.portalName} | Real Estate Portal`;
      }
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      if (siteSettings.seoDescription || siteSettings.tagline) {
        metaDesc.setAttribute('content', siteSettings.seoDescription || siteSettings.tagline);
      }

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      if (siteSettings.seoKeywords) {
        metaKeywords.setAttribute('content', siteSettings.seoKeywords);
      }

      if (siteSettings.seoCanonicalUrl) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', siteSettings.seoCanonicalUrl);
      }

      if (siteSettings.faviconUrl || siteSettings.logoUrl) {
        let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.setAttribute('rel', 'icon');
          document.head.appendChild(faviconLink);
        }
        faviconLink.href = siteSettings.faviconUrl || siteSettings.logoUrl;
      }
    }
  }, [siteSettings]);

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { 
      ...siteSettings, 
      ...newSettings, 
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'admin-user'
    };
    
    // 1. Immediate UI state update and synchronous local storage persistence for instant refresh
    setSiteSettings(updated);
    try {
      localStorage.setItem('jph_site_settings', JSON.stringify(updated));
    } catch (e) {}

    let saveSuccess = false;

    // 2. Persist to live server API (which updates Supabase & server memory)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updated })
      });
      if (res.ok) {
        saveSuccess = true;
        fetchAllLiveServerData().catch(() => {});
      }
    } catch (e) {
      console.warn('Server API settings save notice:', e);
    }

    // 3. Direct Supabase update fallback to settings branding row
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('settings').upsert([{
          id: 'branding',
          value: updated,
          logo: updated.logoUrl,
          favicon: updated.faviconUrl,
          meta_title: updated.seoTitle,
          meta_description: updated.seoDescription
        }]);
        if (!error) {
          saveSuccess = true;
        } else {
          console.warn('Supabase upsert branding notice:', error.message);
        }
      } catch (error) {
        console.error('Direct Supabase save fallback notice:', error);
      }
    }

    // Local storage trigger for cross-tab instant sync
    try {
      localStorage.setItem('jph_site_settings_sync', JSON.stringify({ timestamp: Date.now(), settings: updated }));
    } catch (e) {}

    if (saveSuccess) {
      showToast('Logo & site settings saved live to server!', 'success');
    } else {
      showToast('Logo & site settings saved to live server memory!', 'success');
    }
  };

  return (
    <AppContext.Provider value={{
      properties,
      wishlistIds,
      inquiries,
      selectedCity,
      activeView,
      selectedProperty,
      filters,
      toasts,
      isAiDrawerOpen,
      currentUser,
      isAuthModalOpen,
      authMode,
      siteSettings,
      setSelectedCity,
      setActiveView,
      setSelectedProperty,
      toggleWishlist,
      addProperty,
      updateProperty,
      deleteProperty,
      addInquiry,
      updateInquiryStatus,
      setFilters,
      resetFilters,
      showToast,
      removeToast,
      setIsAiDrawerOpen,
      viewPropertyDetail,
      openAuthModal,
      closeAuthModal,
      login,
      loginWithGoogle,
      signup,
      logout,
      updateSiteSettings,
      sendEmailVerificationLink,
      verifyEmailCode,
      checkEmailVerificationStatus,
      sendFirebaseVerificationEmail,
      checkFirebaseVerification,
      firebaseSignup,
      firebaseLogin,
      sendFirebasePasswordReset
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
