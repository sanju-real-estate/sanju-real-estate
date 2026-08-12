import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Inquiry, FilterState, ListingType, PropertyType, PostedBy, FurnishingStatus, ConstructionStatus, UserProfile, SiteSettings } from '../types';
import { INITIAL_PROPERTIES, INITIAL_INQUIRIES } from '../data/mockData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80',
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
  signup: (fullName: string, email: string, phone: string, password: string, confirmPassword: string, userType: UserProfile['userType'], city?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
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

  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'guest-user-001',
    name: 'Jaipur Property Owner',
    fullName: 'Jaipur Property Owner',
    email: 'owner@jaipurproperties.hub',
    phone: '+91 9876543210',
    city: 'Jaipur',
    userType: 'Owner',
    role: 'admin',
    isVerified: true
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

  const login = async (email: string, password: string) => {
    try {
      setCurrentUser({
        id: 'user-' + Date.now().toString(),
        name: email ? email.split('@')[0] : 'Jaipur Property Owner',
        fullName: email ? email.split('@')[0] : 'Jaipur Property Owner',
        email: email || 'owner@jaipurproperties.hub',
        phone: '+91 97721 17575',
        city: 'Jaipur',
        userType: 'Owner',
        role: 'admin',
        isVerified: true
      });
      setIsAuthModalOpen(false);
      showToast('Logged in successfully!', 'success');
    } catch (e) {
      showToast('Login failed. Please try again.', 'error');
    }
  };

  const signup = async (fullName: string, email: string, phone: string, password: string, confirmPassword: string, userType: UserProfile['userType'], city: string = 'Jaipur') => {
    try {
      setCurrentUser({
        id: 'user-' + Date.now().toString(),
        name: fullName || 'Jaipur Property User',
        fullName: fullName || 'Jaipur Property User',
        email: email || 'user@jaipurproperties.hub',
        phone: phone || '+91 97721 17575',
        city: city || 'Jaipur',
        userType: userType || 'Owner',
        role: 'admin',
        isVerified: true
      });
      setIsAuthModalOpen(false);
      showToast(`Welcome, ${fullName || 'User'}! Account created successfully.`, 'success');
    } catch (e) {
      showToast('Sign up failed. Please try again.', 'error');
    }
  };

  const logout = async () => {
    showToast('Session active (Login-free mode enabled)', 'info');
  };

  // Sync to localStorage
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

    setProperties(prev => [newProperty, ...prev]);
    showToast('🎉 Your property has been published successfully to Firebase Firestore!', 'success');
    return newProperty;
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, ...updates } : p));
    showToast('Property details updated successfully', 'success');
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setWishlistIds(prev => prev.filter(id => id !== propertyId));
    showToast('Property listing deleted', 'info');
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now().toString(),
      status: 'New',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setInquiries(prev => [newInquiry, ...prev]);
    setProperties(prev => prev.map(p => p.id === inquiryData.propertyId ? { ...p, leadsCount: p.leadsCount + 1 } : p));
    showToast('Your inquiry & visit request has been sent to the property owner!', 'success');
  };

  const updateInquiryStatus = (inquiryId: string, status: Inquiry['status']) => {
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status } : i));
    showToast(`Lead status updated to "${status}"`, 'info');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('mb_site_settings');
      if (cached) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cached) };
    } catch (e) {}
    return DEFAULT_SITE_SETTINGS;
  });

  // Load global branding settings from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'branding');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          setSiteSettings(prev => ({ ...prev, ...data }));
          localStorage.setItem('mb_site_settings', JSON.stringify({ ...DEFAULT_SITE_SETTINGS, ...data }));
        }
      } catch (err) {
        console.warn('Firestore branding settings load notice:', err);
      }
    };
    fetchSettings().catch(err => console.warn('fetchSettings catch:', err));
  }, []);

  // Update HTML document head tags (SEO & Favicon) dynamically when siteSettings changes
  useEffect(() => {
    if (siteSettings) {
      // Document Title
      if (siteSettings.seoTitle || siteSettings.portalName) {
        document.title = siteSettings.seoTitle || `${siteSettings.portalName} | Real Estate Portal`;
      }
      
      // Meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      if (siteSettings.seoDescription || siteSettings.tagline) {
        metaDesc.setAttribute('content', siteSettings.seoDescription || siteSettings.tagline);
      }

      // Meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      if (siteSettings.seoKeywords) {
        metaKeywords.setAttribute('content', siteSettings.seoKeywords);
      }

      // Canonical URL
      if (siteSettings.seoCanonicalUrl) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', siteSettings.seoCanonicalUrl);
      }

      // Favicon URL
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
    setSiteSettings(updated);
    try {
      localStorage.setItem('mb_site_settings', JSON.stringify(updated));
    } catch (e) {}

    try {
      const docRef = doc(db, 'settings', 'branding');
      await setDoc(docRef, updated, { merge: true });
      showToast('Global branding settings successfully persisted to Firestore!', 'success');
    } catch (error) {
      console.error('Error persisting site settings to Firestore:', error);
      try {
        handleFirestoreError(error, OperationType.WRITE, 'settings/branding');
      } catch (e) {
        showToast('Branding updated locally. Note: Firestore save failed or offline.', 'warning');
      }
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
      signup,
      logout,
      updateSiteSettings
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
