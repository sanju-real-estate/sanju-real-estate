import React, { useState } from 'react';
import { useApp, DEFAULT_SITE_SETTINGS } from '../context/AppContext';
import { 
  ShieldCheck, Settings, Building2, PlusCircle, Sparkles, Upload, X, Check, 
  MapPin, IndianRupee, Layers, CheckSquare, ArrowRight, User, Mail, Phone, Globe, 
  Image as ImageIcon, RefreshCw, Trash2, Edit, MessageSquare, ExternalLink, Lock, Eye
} from 'lucide-react';
import { Property, Inquiry, PropertyType, ListingType, ConstructionStatus, FurnishingStatus, Facing, PostedBy } from '../types';
import { INDIAN_CITIES } from '../data/cities';

export const AdminDashboard: React.FC = () => {
  const { 
    siteSettings, updateSiteSettings, properties, addProperty, updateProperty, 
    deleteProperty, inquiries, updateInquiryStatus, showToast, refetchData, setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'settings' | 'add-property' | 'manage-properties' | 'inquiries'>('settings');
  const [isSaving, setIsSaving] = useState(false);

  // Settings Form State
  const [formData, setFormData] = useState({
    logoUrl: siteSettings.logoUrl || '',
    faviconUrl: siteSettings.faviconUrl || siteSettings.logoUrl || '',
    portalName: siteSettings.portalName || 'Jaipur Properties Hub',
    tagline: siteSettings.tagline || 'Jaipur’s #1 Verified Real Estate & Property Portal',
    helplinePhone: siteSettings.helplinePhone || '+91 97721 17575',
    helplineWhatsapp: siteSettings.helplineWhatsapp || '+91 97721 17575',
    helplineEmail: siteSettings.helplineEmail || 'support@jaipurproperties.hub',
    officeAddress: siteSettings.officeAddress || 'Main Tonk Road, Opposite Gaurav Tower, Malviya Nagar, Jaipur, Rajasthan 302017',
    heroHeadline: siteSettings.heroHeadline || 'Find Your Dream Property in Pink City, Jaipur',
    announcementBarText: siteSettings.announcementBarText || '✨ Special Festival Offer: ZERO Brokerage on Verified Direct Builder & Owner Properties!',
    announcementBarActive: siteSettings.announcementBarActive ?? true,
    seoTitle: siteSettings.seoTitle || 'Jaipur Properties Hub | #1 Real Estate Portal in Rajasthan',
    seoKeywords: siteSettings.seoKeywords || 'jaipur real estate, property in jaipur, buy 3bhk flat mansarovar, villa malviya nagar',
    seoDescription: siteSettings.seoDescription || 'Discover verified 2 BHK, 3 BHK, 4 BHK flats, luxury villas, plots and commercial properties in Jaipur directly from owners with zero brokerage.',
    seoCanonicalUrl: siteSettings.seoCanonicalUrl || 'https://jaipurproperties.hub'
  });

  // Admin New Property Form State
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propListingType, setPropListingType] = useState<ListingType>('Buy');
  const [propType, setPropType] = useState<PropertyType>('Apartment');
  const [propPrice, setPropPrice] = useState<number>(8500000);
  const [propAreaSqFt, setPropAreaSqFt] = useState<number>(1400);
  const [propBedrooms, setPropBedrooms] = useState<number>(3);
  const [propBathrooms, setPropBathrooms] = useState<number>(3);
  const [propBalconies, setPropBalconies] = useState<number>(2);
  const [propCity, setPropCity] = useState('Jaipur');
  const [propLocality, setPropLocality] = useState('Vaishali Nagar');
  const [propAddress, setPropAddress] = useState('Amrapali Circle, Vaishali Nagar, Jaipur');
  const [propConstructionStatus, setPropConstructionStatus] = useState<ConstructionStatus>('Ready to Move');
  const [propPossessionDate, setPropPossessionDate] = useState('Immediate');
  const [propAge, setPropAge] = useState('0-1 Years');
  const [propFloor, setPropFloor] = useState('4th');
  const [propTotalFloors, setPropTotalFloors] = useState('12');
  const [propFacing, setPropFacing] = useState<Facing>('East');
  const [propFurnishing, setPropFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [propParking, setPropParking] = useState('1 Covered Slot');
  const [propPostedBy, setPropPostedBy] = useState<PostedBy>('Owner');
  const [propOwnerName, setPropOwnerName] = useState('Sanju Meena');
  const [propOwnerPhone, setPropOwnerPhone] = useState('+91 97721 17575');
  const [propOwnerWhatsapp, setPropOwnerWhatsapp] = useState('+91 97721 17575');
  const [propOwnerEmail, setPropOwnerEmail] = useState('sanjumeena@gmail.com');
  const [propImages, setPropImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [propNewImgUrl, setPropNewImgUrl] = useState('');
  const [propAmenities, setPropAmenities] = useState<string[]>([
    '24/7 Security', 'Car Parking', 'Power Backup', 'Lift', 'Gymnasium', 'Gated Community'
  ]);
  const [propSlug, setPropSlug] = useState('');
  const [propSeoTitle, setPropSeoTitle] = useState('');
  const [propSeoKeywords, setPropSeoKeywords] = useState('');
  const [propSeoDesc, setPropSeoDesc] = useState('');

  // Editing Property State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [editNewImgUrl, setEditNewImgUrl] = useState('');

  const AMENITIES_LIST = [
    '24/7 Security', 'Car Parking', 'Power Backup', 'Lift', 'Gymnasium',
    'Swimming Pool', 'Clubhouse', 'Children Play Area', 'Gated Community',
    'CCTV Surveillance', 'Park / Garden', 'Intercom', 'EV Charging'
  ];

  const formatPriceInr = (p: number) => {
    if (p >= 10000000) {
      return `₹${(p / 10000000).toFixed(2)} Cr`;
    } else if (p >= 100000) {
      return `₹${(p / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${p.toLocaleString('en-IN')}`;
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const base64 = uploadEvent.target.result as string;
          setFormData(prev => ({ ...prev, logoUrl: base64 }));
          showToast('Logo file converted! Click Save Settings to publish live.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Favicon file upload handler
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const base64 = uploadEvent.target.result as string;
          setFormData(prev => ({ ...prev, faviconUrl: base64 }));
          showToast('Favicon file converted! Click Save Settings to publish live.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Website Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings(formData);
      await refetchData();
      showToast('🎉 All Website Settings & Branding updated live across all devices!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Post Property by Admin
  const handleAdminPostProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propLocality.trim()) {
      showToast('Please enter Title and Locality', 'error');
      return;
    }

    const pricePerSqFt = Math.round(propPrice / (propAreaSqFt || 1));
    const priceDisplay = formatPriceInr(propPrice);
    const generatedSlug = propSlug.trim() || propTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      await addProperty({
        title: propTitle,
        description: propDesc || `Beautiful ${propBedrooms} BHK ${propType} in ${propLocality}, ${propCity}.`,
        price: propPrice,
        priceDisplay,
        pricePerSqFt,
        areaSqFt: propAreaSqFt,
        bedrooms: propBedrooms,
        bathrooms: propBathrooms,
        balconies: propBalconies,
        propertyType: propType,
        listingType: propListingType,
        city: propCity,
        locality: propLocality,
        address: propAddress,
        constructionStatus: propConstructionStatus,
        possessionDate: propPossessionDate,
        ageOfBuilding: propAge,
        floor: propFloor,
        totalFloors: propTotalFloors,
        facing: propFacing,
        furnishing: propFurnishing,
        parking: propParking,
        postedBy: propPostedBy,
        postedByName: propOwnerName || 'Official Owner',
        postedByPhone: propOwnerPhone || '+91 97721 17575',
        postedByWhatsapp: propOwnerWhatsapp || propOwnerPhone || '+91 97721 17575',
        postedByEmail: propOwnerEmail || 'sanjumeena@gmail.com',
        isVerified: true,
        isExclusive: true,
        isFeatured: true,
        images: propImages.length > 0 ? propImages : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
        amenities: propAmenities,
        slug: generatedSlug,
        seoTitle: propSeoTitle || propTitle,
        seoKeywords: propSeoKeywords || `${propType}, ${propLocality}, ${propCity}`,
        seoDescription: propSeoDesc || propDesc
      });

      await refetchData();
      showToast('🎉 Property published live from Admin Panel to Server & Database!', 'success');
      setActiveTab('manage-properties');
    } catch (err) {
      console.error('Failed to post property:', err);
      showToast('Error posting property', 'error');
    }
  };

  // Save Edit Property
  const handleSaveEditedProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !editForm.title?.trim()) return;

    try {
      await updateProperty(editingProperty.id, editForm);
      await refetchData();
      setEditingProperty(null);
      showToast('Property details updated live on server!', 'success');
    } catch (err) {
      console.error('Failed to edit property:', err);
      showToast('Error updating property', 'error');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-slate-950 border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Master Admin Control Panel
                </h1>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full Portal Management • Real-time Server & Database Synchronization across all devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={async () => {
                showToast('Syncing all properties and site settings from database...', 'info');
                await refetchData();
                showToast('All UI components synced with latest Supabase & server data!', 'success');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Sync & Re-fetch Data</span>
            </button>

            <button
              onClick={() => setActiveView('home')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Website</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto no-scrollbar mb-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Logo, Favicon & Website Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('add-property')}
            className={`py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'add-property'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Property</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-properties')}
            className={`py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manage-properties'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Manage Leads & Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* TAB 1: LOGO, FAVICON & WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            
            {/* Logo & Favicon Upload Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
                <ImageIcon className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-lg font-black text-white">1. Website Logo & Favicon Management</h2>
                  <p className="text-xs text-slate-400">Upload custom image files or paste direct URLs for site logo & favicon icon.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo Box */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                    Website Logo (Header & Footer Logo)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={formData.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl} 
                      alt="Logo Preview" 
                      className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border border-slate-600 shrink-0 shadow-md"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="Paste Logo Image URL..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:border-red-500 outline-none"
                      />
                      <label className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Favicon Box */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                    Website Favicon (Browser Tab Icon)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={formData.faviconUrl || formData.logoUrl || DEFAULT_SITE_SETTINGS.faviconUrl} 
                      alt="Favicon Preview" 
                      className="w-12 h-12 rounded-xl object-cover bg-white p-1 border border-slate-600 shrink-0 shadow-md"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={formData.faviconUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, faviconUrl: e.target.value }))}
                        placeholder="Paste Favicon Image URL..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:border-red-500 outline-none"
                      />
                      <label className="inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Favicon File</span>
                        <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* General Site Content Settings */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
                <Globe className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-lg font-black text-white">2. Site Branding & Contact Details</h2>
                  <p className="text-xs text-slate-400">Portal name, phone, WhatsApp, office address, and top banner texts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Website Name / Title
                  </label>
                  <input
                    type="text"
                    value={formData.portalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, portalName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tagline / Subheading
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Official Phone Helpline
                  </label>
                  <input
                    type="text"
                    value={formData.helplinePhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, helplinePhone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Official WhatsApp Helpline
                  </label>
                  <input
                    type="text"
                    value={formData.helplineWhatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, helplineWhatsapp: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.helplineEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, helplineEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Hero Banner Headline Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroHeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroHeadline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Office Address
                </label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeAddress: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Header Top Announcement Bar
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
                    <input
                      type="checkbox"
                      checked={formData.announcementBarActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, announcementBarActive: e.target.checked }))}
                      className="rounded text-red-600 focus:ring-0"
                    />
                    <span>Active Banner</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.announcementBarText}
                  onChange={(e) => setFormData(prev => ({ ...prev, announcementBarText: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            {/* SEO Meta Tags Box */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
                <Globe className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-lg font-black text-white">3. Website SEO Meta Tags & Headings</h2>
                  <p className="text-xs text-slate-400">Control browser title, meta description, meta keywords, and Google SEO tags.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Canonical Website URL
                  </label>
                  <input
                    type="text"
                    value={formData.seoCanonicalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoCanonicalUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  SEO Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            {/* Save Settings Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl text-sm uppercase tracking-wider shadow-xl hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSaving ? 'Saving & Syncing...' : 'Save & Publish All Site Settings Live'}</span>
            </button>

          </form>
        )}

        {/* TAB 2: POST NEW PROPERTY BY ADMIN */}
        {activeTab === 'add-property' && (
          <form onSubmit={handleAdminPostProperty} className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="border-b border-slate-700 pb-4">
              <h2 className="text-xl font-black text-white">Post Official Property Listing</h2>
              <p className="text-xs text-slate-400">Add a new verified property directly to live server & database.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Listing Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Buy', 'Rent', 'Commercial', 'New Projects'] as ListingType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropListingType(type)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        propListingType === type
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Property Type</label>
                <select
                  value={propType}
                  onChange={(e) => setPropType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="Villa">Independent House / Villa</option>
                  <option value="Plot">Residential Plot / Land</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Commercial Office">Commercial Office Space</option>
                  <option value="Commercial Shop">Commercial Shop / Showroom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Property Title *</label>
              <input
                type="text"
                value={propTitle}
                onChange={(e) => setPropTitle(e.target.value)}
                placeholder="e.g. 3 BHK Luxury Apartment in Vaishali Nagar, Jaipur"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Total Price (₹ INR)</label>
                <input
                  type="number"
                  value={propPrice}
                  onChange={(e) => setPropPrice(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
                <span className="text-[11px] font-bold text-emerald-400 mt-1 block">Display: {formatPriceInr(propPrice)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Area (Sq Ft)</label>
                <input
                  type="number"
                  value={propAreaSqFt}
                  onChange={(e) => setPropAreaSqFt(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Bedrooms (BHK)</label>
                <select
                  value={propBedrooms}
                  onChange={(e) => setPropBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5+ BHK</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">City</label>
                <select
                  value={propCity}
                  onChange={(e) => setPropCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                >
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Locality *</label>
                <input
                  type="text"
                  value={propLocality}
                  onChange={(e) => setPropLocality(e.target.value)}
                  placeholder="e.g. Vaishali Nagar, Mansarovar"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={propDesc}
                onChange={(e) => setPropDesc(e.target.value)}
                placeholder="Write property details..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
              />
            </div>

            {/* Custom Slug & SEO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-700/80">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Custom SEO Slug URL</label>
                <input
                  type="text"
                  value={propSlug}
                  onChange={(e) => setPropSlug(e.target.value)}
                  placeholder="e.g. 3bhk-flat-vaishali-nagar-jaipur"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Owner / Contact Person</label>
                <input
                  type="text"
                  value={propOwnerName}
                  onChange={(e) => setPropOwnerName(e.target.value)}
                  placeholder="Sanju Meena"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Owner Phone</label>
                <input
                  type="text"
                  value={propOwnerPhone}
                  onChange={(e) => setPropOwnerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Owner Email</label>
                <input
                  type="email"
                  value={propOwnerEmail}
                  onChange={(e) => setPropOwnerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl text-sm uppercase tracking-wider shadow-xl hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Publish Property Live to Server</span>
            </button>
          </form>
        )}

        {/* TAB 3: MANAGE ALL PROPERTIES */}
        {activeTab === 'manage-properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">Live Server Properties ({properties.length})</h2>
              <button
                onClick={() => setActiveTab('add-property')}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Property</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <img
                      src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'}
                      alt={prop.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-600 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                          {prop.listingType}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">{prop.priceDisplay}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{prop.title}</h3>
                      <p className="text-xs text-slate-400">{prop.locality}, {prop.city} • {prop.bedrooms} BHK {prop.propertyType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setEditingProperty(prop);
                        setEditForm(prop);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Property</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete property "${prop.title}" permanently from live server?`)) {
                          await deleteProperty(prop.id);
                          await refetchData();
                        }
                      }}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE INQUIRIES & LEADS */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">Buyer & Visitor Inquiries ({inquiries.length})</h2>
              <p className="text-xs text-slate-400">Direct leads submitted by property buyers across all listings.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                    <div>
                      <span className="text-xs font-bold text-red-400">{inq.propertyTitle}</span>
                      <h3 className="text-base font-black text-white">{inq.userName} ({inq.userType})</h3>
                    </div>
                    
                    <select
                      value={inq.status}
                      onChange={async (e) => {
                        await updateInquiryStatus(inq.id, e.target.value as any);
                        await refetchData();
                      }}
                      className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"
                    >
                      <option value="New">🟢 New Lead</option>
                      <option value="Contacted">🟡 Contacted</option>
                      <option value="Visit Scheduled">🔵 Visit Scheduled</option>
                      <option value="Closed">🔴 Closed / Resolved</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-300 italic">"{inq.message}"</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>📞 {inq.userPhone}</span>
                      <span>📧 {inq.userEmail}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${inq.userPhone}`}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Buyer
                      </a>
                      <a
                        href={`https://wa.me/${inq.userPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white">Edit Property: {editingProperty.title}</h2>
              <button onClick={() => setEditingProperty(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Property Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editForm.price || 0}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setEditForm(prev => ({
                        ...prev,
                        price: p,
                        priceDisplay: formatPriceInr(p)
                      }));
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Locality</label>
                  <input
                    type="text"
                    value={editForm.locality || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, locality: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Custom SEO Slug URL</label>
                <input
                  type="text"
                  value={editForm.slug || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  Save Property Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
