import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, PlusCircle, Sparkles, Upload, X, Check, ShieldCheck, 
  MapPin, IndianRupee, Layers, CheckSquare, ArrowRight, User, Mail, Phone, Globe, Image as ImageIcon
} from 'lucide-react';
import { PropertyType, ListingType, ConstructionStatus, FurnishingStatus, Facing, PostedBy } from '../types';
import { INDIAN_CITIES } from '../data/cities';

export const PostPropertyPortal: React.FC = () => {
  const { currentUser, openAuthModal, addProperty, showToast, setActiveView } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('Buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [price, setPrice] = useState<number>(7500000);
  const [areaSqFt, setAreaSqFt] = useState<number>(1250);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [balconies, setBalconies] = useState<number>(2);
  const [city, setCity] = useState('Jaipur');
  const [locality, setLocality] = useState('Mansarovar');
  const [address, setAddress] = useState('VT Road, Mansarovar, Jaipur');
  const [constructionStatus, setConstructionStatus] = useState<ConstructionStatus>('Ready to Move');
  const [possessionDate, setPossessionDate] = useState('Immediate');
  const [ageOfBuilding, setAgeOfBuilding] = useState('0-1 Years');
  const [floor, setFloor] = useState('3rd');
  const [totalFloors, setTotalFloors] = useState('10');
  const [facing, setFacing] = useState<Facing>('East');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [parking, setParking] = useState('1 Covered, 1 Open');
  const [postedBy, setPostedBy] = useState<PostedBy>('Owner');
  const [postedByName, setPostedByName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [postedByPhone, setPostedByPhone] = useState(currentUser?.phone || '+91 97721 17575');
  const [postedByWhatsapp, setPostedByWhatsapp] = useState(currentUser?.phone || '+91 97721 17575');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Security', 'Car Parking', 'Power Backup', 'Lift', 'Gated Community'
  ]);

  // Custom SEO Slug State
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const AMENITIES_LIST = [
    '24/7 Security', 'Car Parking', 'Power Backup', 'Lift', 'Gymnasium',
    'Swimming Pool', 'Clubhouse', 'Children Play Area', 'Gated Community',
    'CCTV Surveillance', 'Park / Garden', 'Intercom', 'EV Charging'
  ];

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImages(prev => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAutoSlug = () => {
    const raw = `${bedrooms}bhk-${propertyType}-${locality}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSlug(raw);
    setSeoTitle(`${bedrooms} BHK ${propertyType} for Sale in ${locality}, ${city}`);
    setSeoKeywords(`${bedrooms} bhk ${propertyType}, property in ${locality}, buy flat in ${city}`);
    setSeoDescription(`Buy beautiful ${bedrooms} BHK ${propertyType} located at ${locality}, ${city}. Verified listing with price ₹${(price / 100000).toFixed(1)} Lac.`);
    showToast('Auto-generated SEO details!', 'info');
  };

  // Helper to format price INR
  const formatPriceInr = (p: number) => {
    if (p >= 10000000) {
      return `₹${(p / 10000000).toFixed(2)} Cr`;
    } else if (p >= 100000) {
      return `₹${(p / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${p.toLocaleString('en-IN')}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locality.trim()) {
      showToast('Please fill in Property Title and Locality', 'error');
      return;
    }

    if (!currentUser) {
      openAuthModal('signup');
      showToast('Please login with Email OTP first to publish property', 'info');
      return;
    }

    const pricePerSqFt = Math.round(price / (areaSqFt || 1));
    const priceDisplay = formatPriceInr(price);

    const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newProperty = addProperty({
      title,
      description: description || `Beautiful ${bedrooms} BHK ${propertyType} in ${locality}, ${city}.`,
      price,
      priceDisplay,
      pricePerSqFt,
      areaSqFt,
      bedrooms,
      bathrooms,
      balconies,
      propertyType,
      listingType,
      city,
      locality,
      address,
      constructionStatus,
      possessionDate,
      ageOfBuilding,
      floor,
      totalFloors,
      facing,
      furnishing,
      parking,
      postedBy,
      postedByName: postedByName || currentUser.fullName || currentUser.name,
      postedByPhone: postedByPhone || currentUser.phone || '+91 97721 17575',
      postedByWhatsapp: sameAsPhone ? (postedByPhone || currentUser.phone || '+91 97721 17575') : (postedByWhatsapp || postedByPhone || '+91 97721 17575'),
      postedByEmail: currentUser.email,
      isVerified: true,
      isExclusive: true,
      isFeatured: false,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      amenities: selectedAmenities,
      slug: generatedSlug,
      seoTitle: seoTitle || title,
      seoKeywords: seoKeywords || `${propertyType}, ${locality}, ${city}`,
      seoDescription: seoDescription || description
    });

    showToast('🎉 Property Published Successfully! It is now live.', 'success');
    setActiveView('dashboard');
  };

  // IF USER IS NOT LOGGED IN - SHOW High Converting OTP Auth Prompt Card
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100">
            <Building2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Post Property FREE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Post Your Property on Jaipur Properties Hub
            </h1>
            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Login or Sign Up with Email OTP to list your house, flat, plot, or commercial space for FREE. Get direct buyer leads directly in your owner portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
              <span className="text-xs font-black text-red-600 uppercase block">1. Login / OTP</span>
              <p className="text-xs text-gray-600">Quick 10-second verification with your email address.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
              <span className="text-xs font-black text-red-600 uppercase block">2. Post Details</span>
              <p className="text-xs text-gray-600">Add price, locality photos & amenities.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
              <span className="text-xs font-black text-red-600 uppercase block">3. Receive Leads</span>
              <p className="text-xs text-gray-600">Buyers call you directly with zero brokerage fee!</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Login / Sign Up with Email OTP to Post</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left">
          <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 shadow-xs mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Owner & Agent Free Listing Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Post Property for Sale or Rent
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Logged in as <strong className="text-gray-900">{currentUser.email}</strong>. Reach thousands of verified buyers in Jaipur.
          </p>
        </div>

        {/* Main Form Box */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-10 space-y-8">
          
          {/* STEP 1: Basic Classification */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              1. Basic Property Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Listing Category <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Buy', 'Rent', 'Commercial', 'New Projects'] as ListingType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setListingType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        listingType === type
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Property Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
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

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Property Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3 BHK Luxury Apartment in Mansarovar, Jaipur"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Property Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe key features, nearby landmarks, schools, connectivity..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Pricing & Size */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-red-600" />
              2. Price & Area Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Total Price (₹ INR) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="7500000"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
                <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                  Display Price: {formatPriceInr(price)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Super Built-up Area (Sq Ft) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(Number(e.target.value))}
                  placeholder="1250"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
                <span className="text-[11px] font-medium text-gray-500 mt-1 block">
                  ~₹{Math.round(price / (areaSqFt || 1))}/sq.ft
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Bedrooms (BHK)
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5+ BHK</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Balconies</label>
                <input
                  type="number"
                  value={balconies}
                  onChange={(e) => setBalconies(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Furnishing</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                >
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Facing</label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value as Facing)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                >
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="North-East">North-East</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Location Details */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              3. Location & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                >
                  {INDIAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Locality / Area <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Mansarovar, Vaishali Nagar, Jagatpura"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                Full Address / Building Name
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, Royal Residency, VT Road"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
              />
            </div>
          </div>

          {/* STEP 4: Photos Upload */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              4. Property Photos & Images
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Photo Image URL (e.g. https://...)"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-red-600 outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                Add URL Photo
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/50 rounded-2xl text-center space-y-2 cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-700">Click or drag photos from your device to upload</p>
              <p className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP (Multiple selection supported)</p>
            </div>

            {/* Photo Preview Grid with Lazy Loading */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 5: Amenities */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-red-600" />
              5. Select Amenities & Features
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {AMENITIES_LIST.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-red-600 text-white' : 'border border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 6: Custom SEO Permalink & Meta Tags */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-600" />
                6. Custom SEO URL Slug & Meta Tags
              </h3>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg cursor-pointer"
              >
                ⚡ Auto Generate SEO
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Custom URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="3bhk-luxury-apartment-mansarovar-jaipur"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="3 BHK Apartment for Sale in Mansarovar Jaipur"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="3bhk flat, mansarovar property, jaipur real estate"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  SEO Description
                </label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Buy verified 3 BHK apartment in Mansarovar Jaipur..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 7: Owner Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              7. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  I am posting as <span className="text-red-600">*</span>
                </label>
                <select
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value as PostedBy)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                >
                  <option value="Owner">Property Owner</option>
                  <option value="Agent">Real Estate Agent</option>
                  <option value="Builder">Direct Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Your Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={postedByName}
                  onChange={(e) => setPostedByName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  📞 Contact Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={postedByPhone}
                  onChange={(e) => {
                    setPostedByPhone(e.target.value);
                    if (sameAsPhone) setPostedByWhatsapp(e.target.value);
                  }}
                  placeholder="+91 97721 17575"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    💬 WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setPostedByWhatsapp(postedByPhone);
                      }}
                      className="rounded text-red-600 focus:ring-0"
                    />
                    <span>Same as Phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  value={sameAsPhone ? postedByPhone : postedByWhatsapp}
                  onChange={(e) => setPostedByWhatsapp(e.target.value)}
                  disabled={sameAsPhone}
                  placeholder="+91 97721 17575"
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl text-xs font-medium outline-none transition-all ${
                    sameAsPhone ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-emerald-50/50 border-emerald-300 text-gray-900 focus:bg-white focus:border-emerald-600'
                  }`}
                />
                <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
                  ⚡ Buyer leads will be sent directly to this WhatsApp number!
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
              <span>Verified Email: <strong>{currentUser.email}</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Authenticated via OTP
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-8 rounded-2xl text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Publish Property Listing Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
