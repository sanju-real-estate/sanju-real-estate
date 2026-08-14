import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Inquiry, FilterState, ListingType, PropertyType, PostedBy, FurnishingStatus, ConstructionStatus, UserProfile, SiteSettings } from '../types';
import { INITIAL_PROPERTIES, INITIAL_INQUIRIES } from '../data/mockData';
import { APP_LOGO } from '../assets/logo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          showToast(error.message, 'error');
          return;
        }
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.user_metadata?.fullName || email.split('@')[0],
            fullName: data.user.user_metadata?.fullName || email.split('@')[0],
            email: data.user.email || email,
            phone: data.user.user_metadata?.phone || '+91 97721 17575',
            city: data.user.user_metadata?.city || 'Jaipur',
            userType: data.user.user_metadata?.userType || 'Owner',
            role: 'admin',
            isVerified: true
          });
          setIsAuthModalOpen(false);
          showToast('Logged in with Supabase successfully!', 'success');
          return;
        }
      }

      // Local fallback mode
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
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { fullName, phone, userType, city }
          }
        });
        if (error) {
          showToast(error.message, 'error');
          return;
        }
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            name: fullName || email.split('@')[0],
            fullName: fullName || email.split('@')[0],
            email: data.user.email || email,
            phone: phone || '+91 97721 17575',
            city: city || 'Jaipur',
            userType: userType || 'Owner',
            role: 'admin',
            isVerified: true
          });
          setIsAuthModalOpen(false);
          showToast(`Welcome, ${fullName || 'User'}! Account registered in Supabase.`, 'success');
          return;
        }
      }

      // Local fallback mode
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
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase logout notice:', e);
      }
    }
    showToast('Logged out successfully', 'info');
  };

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

    const generatedSlug = (newPropData.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProperty: Property = {
      ...newPropData,
      id: newId,
      slug: newPropData.slug?.trim() || generatedSlug || newId,
      seoTitle: newPropData.seoTitle?.trim() || `${newPropData.title} | ${newPropData.locality}, ${newPropData.city}`,
      seoKeywords: newPropData.seoKeywords?.trim() || `${newPropData.title}, ${newPropData.locality}, ${newPropData.city} real estate, buy property jaipur`,
      seoDescription: newPropData.seoDescription?.trim() || newPropData.description,
      priceDisplay: newPropData.priceDisplay || formattedPrice,
      viewsCount: 1,
      leadsCount: 0,
      postedDate: new Date().toISOString().split('T')[0]
    };

    setProperties(prev => [newProperty, ...prev]);

    // Live Server Sync
    (async () => {
      try {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: newProperty })
        });
      } catch (e) {
        console.warn('Server properties sync notice:', e);
      }
    })();

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { error } = await supabase.from('properties').insert([newProperty]);
          if (error) console.warn('Supabase insert property warning:', error.message);
        } catch (err) {
          console.warn('Supabase insert error:', err);
        }
      })();
      showToast('🎉 Property published live on server & database!', 'success');
    } else {
      showToast('🎉 Property published successfully!', 'success');
    }

    return newProperty;
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, ...updates } : p));

    // Live Server Sync
    (async () => {
      try {
        await fetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });
      } catch (e) {
        console.warn('Server property update notice:', e);
      }
    })();

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { error } = await supabase.from('properties').update(updates).eq('id', propertyId);
          if (error) console.warn('Supabase update property warning:', error.message);
        } catch (err) {
          console.warn('Supabase update error:', err);
        }
      })();
    }
    showToast('Property details updated successfully', 'success');
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setWishlistIds(prev => prev.filter(id => id !== propertyId));

    // Live Server Sync
    (async () => {
      try {
        await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn('Server property delete notice:', e);
      }
    })();

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { error } = await supabase.from('properties').delete().eq('id', propertyId);
          if (error) console.warn('Supabase delete property warning:', error.message);
        } catch (err) {
          console.warn('Supabase delete error:', err);
        }
      })();
    }
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

    // Live Server Sync
    (async () => {
      try {
        await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiry: newInquiry })
        });
      } catch (e) {
        console.warn('Server inquiry sync notice:', e);
      }
    })();

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { error } = await supabase.from('inquiries').insert([newInquiry]);
          if (error) console.warn('Supabase insert inquiry warning:', error.message);
        } catch (err) {
          console.warn('Supabase inquiry error:', err);
        }
      })();
    }

    showToast('Your inquiry & visit request has been sent to the property owner!', 'success');
  };

  const updateInquiryStatus = (inquiryId: string, status: Inquiry['status']) => {
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status } : i));

    // Live Server Sync
    (async () => {
      try {
        await fetch(`/api/inquiries/${inquiryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.warn('Server inquiry status update notice:', e);
      }
    })();

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { error } = await supabase.from('inquiries').update({ status }).eq('id', inquiryId);
          if (error) console.warn('Supabase update inquiry warning:', error.message);
        } catch (err) {
          console.warn('Supabase update inquiry error:', err);
        }
      })();
    }
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
      logoUrl: source.logoUrl || source.logo_url || source.logo || undefined,
      faviconUrl: source.faviconUrl || source.favicon_url || source.favicon || source.logoUrl || source.logo_url || undefined,
      portalName: source.portalName || source.portal_name || source.name || undefined,
      tagline: source.tagline || source.tag_line || undefined,
      helplinePhone: source.helplinePhone || source.helpline_phone || source.phone || undefined,
      helplineWhatsapp: source.helplineWhatsapp || source.helpline_whatsapp || source.whatsapp || undefined,
      helplineEmail: source.helplineEmail || source.helpline_email || source.email || undefined,
      officeAddress: source.officeAddress || source.office_address || source.address || undefined,
      heroHeadline: source.heroHeadline || source.hero_headline || undefined,
      announcementBarText: source.announcementBarText || source.announcement_bar_text || undefined,
      announcementBarActive: source.announcementBarActive !== undefined ? Boolean(source.announcementBarActive) : undefined,
      seoTitle: source.seoTitle || source.seo_title || undefined,
      seoDescription: source.seoDescription || source.seo_description || undefined,
      seoKeywords: source.seoKeywords || source.seo_keywords || undefined,
      seoCanonicalUrl: source.seoCanonicalUrl || source.seo_canonical_url || undefined,
    };
  };

  const applySettingsUpdate = (norm: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const merged = { ...prev };
      Object.entries(norm).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          (merged as any)[k] = v;
        }
      });
      try {
        localStorage.setItem('jph_site_settings', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  const fetchSettings = async () => {
    let loaded = false;

    // 1. Fetch from Express API route (which queries Supabase settings table)
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json && json.settings) {
          const norm = normalizeSettings(json.settings);
          if (norm && Object.keys(norm).length > 0) {
            applySettingsUpdate(norm);
            loaded = true;
          }
        }
      }
    } catch (err) {
      console.warn('Server settings fetch notice:', err);
    }

    // 2. Direct Supabase query fallback
    if (!loaded && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1);

        if (data && data.length > 0) {
          const norm = normalizeSettings(data[0]);
          if (norm && Object.keys(norm).length > 0) {
            applySettingsUpdate(norm);
          }
        } else if (error) {
          console.warn('Supabase direct settings query notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase branding settings load notice:', err);
      }
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.properties) && json.properties.length > 0) {
          setProperties(json.properties);
          try {
            localStorage.setItem('mb_properties', JSON.stringify(json.properties));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Server properties fetch notice:', err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.inquiries)) {
          setInquiries(json.inquiries);
          try {
            localStorage.setItem('mb_inquiries', JSON.stringify(json.inquiries));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Server inquiries fetch notice:', err);
    }
  };

  // Initial load and auto-sync setup (polling + real-time channel + window focus)
  useEffect(() => {
    const syncAllData = () => {
      fetchSettings().catch(err => console.warn('fetchSettings error:', err));
      fetchProperties().catch(err => console.warn('fetchProperties error:', err));
      fetchInquiries().catch(err => console.warn('fetchInquiries error:', err));
    };

    syncAllData();

    // Supabase Realtime Subscription for automatic updates on all devices
    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('public_settings_and_props_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
            fetchSettings().catch(err => console.warn('Realtime fetchSettings error:', err));
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
            fetchProperties().catch(err => console.warn('Realtime fetchProperties error:', err));
          })
          .subscribe((status: string, err?: Error) => {
            if (err) {
              console.warn('Supabase realtime status:', status, err.message);
            }
          });
      } catch (e) {
        console.warn('Realtime subscription notice:', e);
      }
    }

    // Poll every 5 seconds as a bulletproof fallback for all devices & browsers
    const pollInterval = setInterval(() => {
      syncAllData();
    }, 5000);

    const handleFocus = () => {
      syncAllData();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'jph_site_settings_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.settings) {
            setSiteSettings(prev => ({ ...prev, ...parsed.settings }));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
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
      }
    } catch (e) {
      console.warn('Server API settings save notice:', e);
    }

    // 3. Direct Supabase update fallback if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: existingRows } = await supabase.from('settings').select('*').limit(1);
        if (existingRows && existingRows.length > 0) {
          const firstRow = existingRows[0];
          const primaryKeyCol = 'id' in firstRow ? 'id' : Object.keys(firstRow)[0];
          const primaryKeyValue = firstRow[primaryKeyCol];

          const payload: any = {
            logoUrl: updated.logoUrl,
            logo_url: updated.logoUrl,
            logo: updated.logoUrl,
            portalName: updated.portalName,
            portal_name: updated.portalName,
            value: updated
          };

          const { error } = await supabase.from('settings').update(payload).eq(primaryKeyCol, primaryKeyValue);
          if (!error) {
            saveSuccess = true;
          }
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
