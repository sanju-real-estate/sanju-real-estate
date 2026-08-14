import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SiteSettings, Property, ListingType, PropertyType, FurnishingStatus, ConstructionStatus, Facing } from '../types';
import { 
  ShieldCheck, 
  Globe, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Lock, 
  Database, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  LogOut,
  Layers,
  X
} from 'lucide-react';
import { APP_LOGO } from '../assets/logo';
import { INDIAN_CITIES } from '../data/cities';
import { DEFAULT_SITE_SETTINGS } from '../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { siteSettings, updateSiteSettings, properties, addProperty, updateProperty, deleteProperty, inquiries, updateInquiryStatus, showToast } = useApp();

  // Admin Authentication State (Check Session Storage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  // Login Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local form state for site settings with safe defaults
  const [formData, setFormData] = useState<SiteSettings>(() => ({
    ...DEFAULT_SITE_SETTINGS,
    ...siteSettings
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'seo' | 'post-property' | 'manage-properties' | 'inquiries' | 'contact' | 'hero'>('branding');

  // New Property Form State
  const [newProp, setNewProp] = useState<Partial<Property>>({
    title: '',
    price: 8500000,
    priceDisplay: '₹85 Lac',
    pricePerSqFt: 5500,
    areaSqFt: 1500,
    bedrooms: 3,
    bathrooms: 2,
    balconies: 2,
    propertyType: 'Apartment',
    listingType: 'Buy',
    city: 'Jaipur',
    locality: 'Mansarovar',
    address: 'Near Shipra Path, Mansarovar, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '1-3 Years',
    floor: '3rd',
    totalFloors: '10',
    facing: 'East',
    furnishing: 'Semi-Furnished',
    parking: '1 Covered Slot',
    postedBy: 'Owner',
    postedByName: 'Sanju Meena (Admin)',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'sanjumeena@gmail.com',
    isVerified: true,
    isExclusive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['24/7 Security', 'Power Backup', 'Gymnasium', 'Clubhouse', 'Covered Parking'],
    description: 'Beautiful 3 BHK property posted by official site admin Sanju Meena with prime road connectivity and zero brokerage.'
  });

  const [propImageInput, setPropImageInput] = useState('');
  const [isPostingProp, setIsPostingProp] = useState(false);

  // Sync state when context updates from Firestore / Supabase
  useEffect(() => {
    setFormData(() => ({
      ...DEFAULT_SITE_SETTINGS,
      ...siteSettings
    }));
  }, [siteSettings]);

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (adminEmail.trim().toLowerCase() === 'sanjumeena@gmail.com' && adminPassword === 'sanju@8233') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      showToast('Welcome Admin Sanju Meena! Admin Session Unlocked.', 'success');
    } else {
      setLoginError('Invalid Admin Email or Password. Access Denied.');
      showToast('Invalid Admin Credentials', 'error');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    showToast('Logged out from Admin Panel', 'info');
  };

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Local Image Upload for Logo
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          handleChange('logoUrl', result);
          showToast('Local Logo uploaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Local Favicon File Upload
  const handleFaviconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showToast('Favicon size should be under 1MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          handleChange('faviconUrl', result);
          showToast('Local Favicon uploaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Post New Property Handler (Admin Only)
  const handlePostProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.title?.trim() || !newProp.locality?.trim()) {
      showToast('Please enter Property Title and Locality', 'error');
      return;
    }
    setIsPostingProp(true);
    try {
      await addProperty(newProp);
      showToast('Property Posted Successfully by Admin!', 'success');
      setActiveTab('manage-properties');
    } catch (err) {
      console.error('Failed to post property:', err);
      showToast('Error posting property. Try again.', 'error');
    } finally {
      setIsPostingProp(false);
    }
  };

  const handleAddPropImage = () => {
    if (propImageInput.trim()) {
      setNewProp(prev => ({
        ...prev,
        images: [...(prev.images || []), propImageInput.trim()]
      }));
      setPropImageInput('');
    }
  };

  // State for Editing Property
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [editImageInput, setEditImageInput] = useState('');

  // Device File Upload for New Property Photos
  const handlePropPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Image ${file.name} is over 5MB`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setNewProp(prev => ({
            ...prev,
            images: [...(prev.images || []), result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Photos uploaded successfully!', 'success');
  };

  const handleDeletePostPropImage = (indexToDelete: number) => {
    setNewProp(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToDelete)
    }));
    showToast('Photo removed', 'info');
  };

  // Device File Upload for Edit Property Photos
  const handleEditPropPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Image ${file.name} is over 5MB`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setEditForm(prev => ({
            ...prev,
            images: [...(prev.images || []), result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Photo uploaded to property!', 'success');
  };

  const handleDeleteEditPropImage = (indexToDelete: number) => {
    setEditForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToDelete)
    }));
    showToast('Photo removed from property', 'info');
  };

  const handleAddEditImageInput = () => {
    if (editImageInput.trim()) {
      setEditForm(prev => ({
        ...prev,
        images: [...(prev.images || []), editImageInput.trim()]
      }));
      setEditImageInput('');
    }
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setEditForm({ ...prop });
    setEditImageInput('');
  };

  const handleSaveEditedProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !editForm.title?.trim()) return;

    const val = editForm.price || 0;
    let disp = `₹${val.toLocaleString('en-IN')}`;
    if (val >= 10000000) disp = `₹${(val / 10000000).toFixed(2)} Cr`;
    else if (val >= 100000) disp = `₹${(val / 100000).toFixed(2)} Lac`;

    const updatedData: Partial<Property> = {
      ...editForm,
      priceDisplay: editForm.priceDisplay || disp
    };

    updateProperty(editingProperty.id, updatedData);
    setEditingProperty(null);
    showToast('Property updated live on server and site!', 'success');
  };

  // Preset Logos for quick testing
  const PRESET_LOGOS = [
    {
      name: 'Modern Red Hub (Default)',
      url: APP_LOGO
    },
    {
      name: 'Luxury Gold Building',
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Emerald Real Estate',
      url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Heritage Pink City Architecture',
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=150&q=80'
    }
  ];

  // IF NOT AUTHENTICATED AS ADMIN -> SHOW SECURE LOGIN GATE
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-red-600/20 border border-red-500/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9 text-red-500" />
            </div>
            <div>
              <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest inline-block mb-2">
                Jaipur Properties Admin
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Secure Admin Login
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Strictly restricted to Authorized Administrator (Sanju Meena)
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-950/80 border border-red-600/50 rounded-2xl text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-gray-500 font-mono">
              Protected by Supabase Rules & Authorized Key Session
            </p>
          </div>

        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <ShieldCheck className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-red-600/20 border border-red-500/30 rounded-2xl shrink-0 text-red-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Admin Session Active
                  </span>
                  <span className="bg-slate-800 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                    sanjumeena@gmail.com
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  Admin Control Panel & Portal Editor
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                  Manage site logo, favicon, SEO details, contact info, post new verified properties, and edit/delete existing listings in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleAdminLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-xs border border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'branding' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Logo & Favicon</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'seo' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>SEO Details</span>
          </button>

          <button
            onClick={() => setActiveTab('post-property')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'post-property' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Post Property (Admin)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-properties')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'manage-properties' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'inquiries' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>User Inquiries & Leads ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'contact' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact & Helpline</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'hero' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero & Banner</span>
          </button>
        </div>

        {/* Global Settings Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Controls Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB 1: LOGO & FAVICON */}
            {activeTab === 'branding' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-red-600" />
                    App Logo & Favicon Manual Upload
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload logo and favicon directly from your local device or specify image URLs.
                  </p>
                </div>

                {/* Primary Brand Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Portal Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.portalName}
                    onChange={(e) => handleChange('portalName', e.target.value)}
                    placeholder="e.g. Jaipur Properties Hub"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Portal Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="e.g. Jaipur’s #1 Verified Real Estate & Property Portal"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* App Logo Section (URL + Local File Upload) */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                    App Logo (Manual Local Upload or URL)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      <img 
                        src={formData.logoUrl || APP_LOGO} 
                        alt="App Logo" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                        placeholder="Image URL or Base64 String"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none"
                      />

                      <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Logo File from Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Favicon Upload Section */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Favicon Icon (Manual Local Upload or URL)
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1">
                      <img 
                        src={formData.faviconUrl || formData.logoUrl || APP_LOGO} 
                        alt="Favicon Preview" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={formData.faviconUrl || ''}
                        onChange={(e) => handleChange('faviconUrl', e.target.value)}
                        placeholder="Favicon .ico or .png image URL"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none"
                      />

                      <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-red-400" />
                        <span>Upload Favicon File from Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Logo & Favicon</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SEO DETAILS */}
            {activeTab === 'seo' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-600" />
                    SEO Details & Meta Tags Configuration
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure Google search engine optimization meta title, description, target keywords, and canonical URLs.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta Title (Google Search Title)
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle || ''}
                    onChange={(e) => handleChange('seoTitle', e.target.value)}
                    placeholder="e.g. Jaipur Properties Hub | Buy & Rent Verified Flats in Jaipur"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.seoDescription || ''}
                    onChange={(e) => handleChange('seoDescription', e.target.value)}
                    placeholder="e.g. Find 1 BHK, 2 BHK, 3 BHK flats, villas, plots, and commercial shops for sale and rent in Mansarovar, Vaishali Nagar, Jagatpura, Malviya Nagar Jaipur with zero brokerage."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    SEO Target Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords || ''}
                    onChange={(e) => handleChange('seoKeywords', e.target.value)}
                    placeholder="jaipur properties, flats in mansarovar, 3bhk villa jagatpura, property hub jaipur, zero brokerage jaipur"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Canonical Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.seoCanonicalUrl || ''}
                    onChange={(e) => handleChange('seoCanonicalUrl', e.target.value)}
                    placeholder="https://jaipurproperties.hub"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save SEO Meta Details</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: POST PROPERTY (ADMIN ONLY) */}
            {activeTab === 'post-property' && (
              <form onSubmit={handlePostProperty} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-red-600" />
                      Post New Verified Property (Admin Only)
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Only Admin (Sanju Meena) can add listings to Jaipur Properties Hub.
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    Admin Managed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Property Title *</label>
                    <input
                      type="text"
                      required
                      value={newProp.title}
                      onChange={(e) => setNewProp(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Luxurious 3 BHK Villa with Garden"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price in INR (Rupees) *</label>
                    <input
                      type="number"
                      required
                      value={newProp.price}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        let disp = `₹${val.toLocaleString('en-IN')}`;
                        if (val >= 10000000) disp = `₹${(val / 10000000).toFixed(2)} Cr`;
                        else if (val >= 100000) disp = `₹${(val / 100000).toFixed(2)} Lac`;
                        setNewProp(prev => ({ ...prev, price: val, priceDisplay: disp }));
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Listing Type</label>
                    <select
                      value={newProp.listingType}
                      onChange={(e) => setNewProp(prev => ({ ...prev, listingType: e.target.value as ListingType }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    >
                      <option value="Buy">Buy (For Sale)</option>
                      <option value="Rent">Rent (For Lease)</option>
                      <option value="Commercial">Commercial Workspace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
                    <select
                      value={newProp.propertyType}
                      onChange={(e) => setNewProp(prev => ({ ...prev, propertyType: e.target.value as PropertyType }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    >
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Villa">Villa / House</option>
                      <option value="Plot">Plot / Land</option>
                      <option value="Commercial Office">Commercial Office</option>
                      <option value="Commercial Shop">Commercial Shop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                    <select
                      value={newProp.city}
                      onChange={(e) => setNewProp(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    >
                      {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Locality *</label>
                    <input
                      type="text"
                      required
                      value={newProp.locality}
                      onChange={(e) => setNewProp(prev => ({ ...prev, locality: e.target.value }))}
                      placeholder="e.g. Mansarovar, Vaishali Nagar"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">BHK Bedrooms</label>
                    <input
                      type="number"
                      value={newProp.bedrooms}
                      onChange={(e) => setNewProp(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Area (Sq. Ft)</label>
                    <input
                      type="number"
                      value={newProp.areaSqFt}
                      onChange={(e) => setNewProp(prev => ({ ...prev, areaSqFt: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Property Photos & Gallery
                    </label>
                    <label className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload Photos from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePropPhotosUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={propImageInput}
                      onChange={(e) => setPropImageInput(e.target.value)}
                      placeholder="Or paste photo URL here..."
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPropImage}
                      className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-900"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Photo Thumbnails with Delete Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {newProp.images?.map((img, idx) => (
                      <div key={idx} className="group relative w-full h-20 rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-black">
                        <img src={img} alt={`Prop ${idx}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                        <button
                          type="button"
                          onClick={() => handleDeletePostPropImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProp.description}
                    onChange={(e) => setNewProp(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isPostingProp}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-3 rounded-xl text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Property Live to Server</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: MANAGE PROPERTIES */}
            {activeTab === 'manage-properties' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-red-600" />
                      Manage Published Properties ({properties.length})
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Edit details, update photos, change phone/email, or delete listings live on server.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {properties.map((prop) => (
                    <div key={prop.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={prop.images[0] || APP_LOGO} 
                          alt={prop.title} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-gray-900 truncate">{prop.title}</p>
                          <p className="text-[11px] text-gray-500">{prop.locality}, {prop.city} • <strong className="text-red-600">{prop.priceDisplay}</strong></p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block">
                              {prop.listingType} • {prop.propertyType}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              📷 {prop.images.length} Photos
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openEditModal(prop)}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Edit Details & Photos</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete property "${prop.title}" permanently from server?`)) {
                              deleteProperty(prop.id);
                            }
                          }}
                          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer transition-colors"
                          title="Delete Property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4.5: INQUIRIES & LEADS */}
            {activeTab === 'inquiries' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-red-600" />
                      User Inquiries & Site Visit Requests ({inquiries.length})
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      All lead queries submitted by visitors for properties.
                    </p>
                  </div>
                </div>

                {inquiries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs font-medium">
                    No active user inquiries or site visit requests yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-xs text-gray-900">{inq.name}</p>
                            <p className="text-[11px] text-gray-600 font-medium">{inq.phone} • {inq.email}</p>
                            <p className="text-[11px] font-bold text-red-600 mt-0.5">Property ID: {inq.propertyTitle || inq.propertyId}</p>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{inq.createdAt}</span>
                        </div>

                        {inq.message && (
                          <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 italic">
                            "{inq.message}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                          <span className="text-[11px] text-gray-500">
                            Visit Date: <strong className="text-gray-800">{inq.preferredDate || 'Flexible'}</strong>
                          </span>
                          
                          <select
                            value={inq.status}
                            onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                            className="text-xs font-extrabold px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none"
                          >
                            <option value="New">🟢 New Lead</option>
                            <option value="Contacted">🟡 Contacted</option>
                            <option value="Scheduled">🔵 Scheduled Visit</option>
                            <option value="Closed">✅ Closed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CONTACT INFO */}
            {activeTab === 'contact' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-600" />
                    Contact & Office Info
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Helpline Phone</label>
                    <input
                      type="text"
                      value={formData.helplinePhone}
                      onChange={(e) => handleChange('helplinePhone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Helpline</label>
                    <input
                      type="text"
                      value={formData.helplineWhatsapp}
                      onChange={(e) => handleChange('helplineWhatsapp', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={formData.helplineEmail}
                    onChange={(e) => handleChange('helplineEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Office Address</label>
                  <textarea
                    rows={2}
                    value={formData.officeAddress}
                    onChange={(e) => handleChange('officeAddress', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Contact Info</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 6: HERO BANNER */}
            {activeTab === 'hero' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-600" />
                    Hero Headline & Announcement Bar
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hero Main Headline</label>
                  <input
                    type="text"
                    value={formData.heroHeadline}
                    onChange={(e) => handleChange('heroHeadline', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Announcement Ticker Text</label>
                  <input
                    type="text"
                    value={formData.announcementBarText}
                    onChange={(e) => handleChange('announcementBarText', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Hero Banner Settings</span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Side Live Preview Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Branding Preview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-red-600" />
                  Live Preview
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Realtime Sync
                </span>
              </div>

              {/* Simulated Header */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-slate-900 text-white">
                <div className="bg-red-600 text-white text-[10px] font-bold py-1 px-3 truncate">
                  {formData.announcementBarText || 'Announcement Active'}
                </div>

                <div className="p-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-extrabold truncate">
                    {formData.portalName || 'Jaipur Properties'}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {formData.helplinePhone}
                  </span>
                </div>

                <div className="bg-white text-gray-900 p-3 flex items-center gap-2.5">
                  <img 
                    src={formData.logoUrl || APP_LOGO} 
                    alt="Logo Preview" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-xs text-gray-900 truncate">
                      {formData.portalName || 'Jaipur Properties'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">
                      {formData.tagline || 'Official Property Portal'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-800 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-red-600" />
                  Supabase Sync Status
                </p>
                <p className="text-[11px] text-gray-500">
                  Table: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[10px]">public.settings (id: 'branding')</code>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Edit Property Listing</h3>
                  <p className="text-xs text-gray-300">Update property details, price, contact numbers, and photos live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEditedProperty} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.price || 0}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Display Price Label</label>
                  <input
                    type="text"
                    value={editForm.priceDisplay || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priceDisplay: e.target.value }))}
                    placeholder="e.g. ₹85.00 Lac"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Listing Category</label>
                  <select
                    value={editForm.listingType || 'Sale'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, listingType: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Sale">Buy / Sale</option>
                    <option value="Rent">Rent</option>
                    <option value="PG/Hostel">PG / Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
                  <select
                    value={editForm.propertyType || 'Apartment'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, propertyType: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Apartment">Apartment / Flat</option>
                    <option value="Villa/House">Villa / Independent House</option>
                    <option value="Plot/Land">Plot / Land</option>
                    <option value="Commercial Office">Commercial Office</option>
                    <option value="Commercial Shop">Commercial Shop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Locality / Area *</label>
                  <input
                    type="text"
                    required
                    value={editForm.locality || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, locality: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city || 'Jaipur'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    value={editForm.postedByPhone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, postedByPhone: e.target.value }))}
                    placeholder="e.g. +91 97721 17575"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editForm.postedByEmail || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, postedByEmail: e.target.value }))}
                    placeholder="e.g. contact@jaipurproperties.hub"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={editForm.postedByName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, postedByName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">BHK Bedrooms</label>
                  <input
                    type="number"
                    value={editForm.bedrooms || 0}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Area (Sq. Ft)</label>
                  <input
                    type="number"
                    value={editForm.areaSqFt || 0}
                    onChange={(e) => setEditForm(prev => ({ ...prev, areaSqFt: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing</label>
                  <select
                    value={editForm.furnishing || 'Semi-Furnished'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, furnishing: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Property Photos Upload and Deleting Section */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Property Photos ({editForm.images?.length || 0})
                  </label>
                  <label className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Device Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditPropPhotosUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editImageInput}
                    onChange={(e) => setEditImageInput(e.target.value)}
                    placeholder="Paste new photo URL..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditImageInput}
                    className="bg-gray-800 text-white text-xs font-bold px-4 rounded-xl cursor-pointer hover:bg-gray-900"
                  >
                    Add URL
                  </button>
                </div>

                {/* Photo Thumbnails with Delete Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {editForm.images?.map((img, idx) => (
                    <div key={idx} className="group relative w-full h-20 rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-black">
                      <img src={img} alt={`Prop ${idx}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                      <button
                        type="button"
                        onClick={() => handleDeleteEditPropImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          Main Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.isVerified)}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-gray-800">Verified Listing Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.isFeatured)}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-gray-800">Featured Home Page Listing</span>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes Live</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
