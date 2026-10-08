import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, PlusCircle, CheckCircle2, Upload, MapPin, 
  IndianRupee, Home, Sparkles, Phone, Mail, User, 
  Layers, Check, ShieldCheck, ArrowRight, Image as ImageIcon, Trash2,
  Loader2, Eye, ExternalLink
} from 'lucide-react';
import { PropertyType, ListingType, FurnishingStatus, ConstructionStatus, Facing, PostedBy } from '../types';
import { INDIAN_CITIES } from '../data/cities';
import { uploadImageFile } from '../utils/imageUpload';

const POPULAR_AMENITIES = [
  '24/7 Security',
  'Power Backup',
  'Gated Community',
  'Lift / Elevator',
  'Covered Car Parking',
  'Gymnasium',
  'Clubhouse',
  'Swimming Pool',
  'Kids Play Area',
  'Private Garden',
  'EV Charging Point',
  'Intercom Facility',
  'Solar Water Heater',
  'CCTV Surveillance',
  'Fire Fighting System'
];

const DEFAULT_IMAGE_PRESETS = [
  { name: 'Luxury Apartment Interior', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Modern Royal Villa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Premium Living Hall', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'High-rise Tower View', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Independent Bunglow Garden', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Commercial Office Space', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80' }
];

export const PostPropertyPortal: React.FC = () => {
  const { addProperty, setSelectedProperty, setActiveView, showToast, selectedCity } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPropId, setCreatedPropId] = useState<string | null>(null);

  const [imageInput, setImageInput] = useState('');
  const [customAmenities, setCustomAmenities] = useState<string[]>(['24/7 Security', 'Power Backup', 'Covered Car Parking']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listingType: 'Buy' as ListingType,
    propertyType: 'Apartment' as PropertyType,
    city: selectedCity || 'Jaipur',
    locality: '',
    address: '',
    price: '',
    priceDisplay: '',
    areaSqFt: '',
    bedrooms: 3,
    bathrooms: 2,
    balconies: 1,
    floor: '2nd',
    totalFloors: '6',
    facing: 'East' as Facing,
    furnishing: 'Semi-Furnished' as FurnishingStatus,
    constructionStatus: 'Ready to Move' as ConstructionStatus,
    possessionDate: 'Ready to Move',
    ageOfBuilding: '0-2 Years',
    parking: '1 Covered Car Parking',
    postedBy: 'Owner' as PostedBy,
    postedByName: '',
    postedByPhone: '',
    postedByEmail: '',
    images: [DEFAULT_IMAGE_PRESETS[0].url]
  });

  const handlePriceChange = (valStr: string) => {
    const numeric = Number(valStr.replace(/[^0-9]/g, ''));
    let display = '';
    if (numeric > 0) {
      if (formData.listingType === 'Rent') {
        display = `₹${numeric.toLocaleString('en-IN')}/mo`;
      } else if (numeric >= 10000000) {
        display = `₹${(numeric / 10000000).toFixed(2)} Cr`;
      } else if (numeric >= 100000) {
        display = `₹${(numeric / 100000).toFixed(2)} Lac`;
      } else {
        display = `₹${numeric.toLocaleString('en-IN')}`;
      }
    }
    setFormData(prev => ({
      ...prev,
      price: valStr,
      priceDisplay: display
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => uploadImageFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showToast(`Added ${uploadedUrls.length} photo(s) successfully!`, 'success');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      showToast('Photo upload failed: ' + (err?.message || 'Error processing file'), 'error');
    } finally {
      setIsUploadingImage(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleAddPresetImage = (url: string) => {
    if (formData.images.includes(url)) {
      showToast('Photo is already in your gallery', 'info');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
    showToast('Photo preset added', 'success');
  };

  const handleAddImage = () => {
    if (!imageInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageInput.trim()]
    }));
    setImageInput('');
    showToast('Photo URL added', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const nextImages = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: nextImages.length > 0 ? nextImages : [DEFAULT_IMAGE_PRESETS[0].url]
      };
    });
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const targetImg = prev.images[index];
      const otherImages = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: [targetImg, ...otherImages]
      };
    });
    showToast('Set as main cover photo', 'success');
  };

  const toggleAmenity = (amenity: string) => {
    setCustomAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please enter a property title', 'error');
      return;
    }
    if (!formData.locality.trim()) {
      showToast('Please specify the property locality/area', 'error');
      return;
    }
    if (!formData.price || Number(formData.price.replace(/[^0-9]/g, '')) <= 0) {
      showToast('Please enter a valid price in INR', 'error');
      return;
    }
    if (!formData.postedByName.trim() || !formData.postedByPhone.trim()) {
      showToast('Please provide your name and contact phone number', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const priceNum = Number(formData.price.replace(/[^0-9]/g, ''));
      const areaNum = Number(formData.areaSqFt) || 1200;
      const pricePerSqFt = areaNum > 0 ? Math.round(priceNum / areaNum) : 0;

      const newProperty = {
        title: formData.title.trim(),
        description: formData.description.trim() || `Beautiful ${formData.bedrooms} BHK ${formData.propertyType} for ${formData.listingType === 'Rent' ? 'Rent' : 'Sale'} in ${formData.locality}, ${formData.city}. Features modern amenities, clear title, and prime location.`,
        price: priceNum,
        priceDisplay: formData.priceDisplay || `₹${priceNum.toLocaleString('en-IN')}`,
        pricePerSqFt,
        areaSqFt: areaNum,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        balconies: formData.balconies,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        city: formData.city,
        locality: formData.locality.trim(),
        address: formData.address.trim() || `${formData.locality}, ${formData.city}`,
        constructionStatus: formData.constructionStatus,
        possessionDate: formData.possessionDate,
        ageOfBuilding: formData.ageOfBuilding,
        floor: formData.floor,
        totalFloors: formData.totalFloors,
        facing: formData.facing,
        furnishing: formData.furnishing,
        parking: formData.parking,
        postedBy: formData.postedBy,
        postedByName: formData.postedByName.trim(),
        postedByPhone: formData.postedByPhone.trim(),
        postedByEmail: formData.postedByEmail.trim() || 'contact@jaipurproperties.hub',
        isVerified: true,
        isExclusive: false,
        isFeatured: true,
        images: formData.images.length > 0 ? formData.images : [DEFAULT_IMAGE_PRESETS[0].url],
        amenities: customAmenities.length > 0 ? customAmenities : ['24/7 Security', 'Power Backup', 'Covered Car Parking'],
        viewsCount: 1,
        leadsCount: 0
      };

      const created = addProperty(newProperty);
      setCreatedPropId(created.id);
      setIsSuccess(true);
      showToast('🎉 Property published live successfully on server!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Post property error:', err);
      showToast('Failed to publish property: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-200 space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Live & Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Property Published Successfully!
            </h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your property "{formData.title}" is now active live on the platform across all devices.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left flex items-center gap-4">
            <img 
              src={formData.images[0] || DEFAULT_IMAGE_PRESETS[0].url} 
              alt={formData.title} 
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200 shadow-sm"
            />
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">{formData.title}</p>
              <p className="text-xs text-gray-500">{formData.locality}, {formData.city} • <strong className="text-red-600">{formData.priceDisplay || formData.price}</strong></p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formData.bedrooms} BHK {formData.propertyType} • {formData.images.length} Photos</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setActiveView('listings');
              }}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Browse All Listings</span>
            </button>

            <button
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  title: '',
                  description: '',
                  listingType: 'Buy',
                  propertyType: 'Apartment',
                  city: selectedCity || 'Jaipur',
                  locality: '',
                  address: '',
                  price: '',
                  priceDisplay: '',
                  areaSqFt: '',
                  bedrooms: 3,
                  bathrooms: 2,
                  balconies: 1,
                  floor: '2nd',
                  totalFloors: '6',
                  facing: 'East',
                  furnishing: 'Semi-Furnished',
                  constructionStatus: 'Ready to Move',
                  possessionDate: 'Ready to Move',
                  ageOfBuilding: '0-2 Years',
                  parking: '1 Covered Car Parking',
                  postedBy: 'Owner',
                  postedByName: '',
                  postedByPhone: '',
                  postedByEmail: '',
                  images: [DEFAULT_IMAGE_PRESETS[0].url]
                });
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Another Property</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Free Property Posting • No Brokerage</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Post Your Property For Free
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          List your flat, house, villa, plot or commercial workspace directly. Reach genuine buyers and tenants instantly without any login barriers!
        </p>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 space-y-8">
        
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              1. Property Basic Details
            </h2>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Listing Type (Buy / Rent / Commercial) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">I Want To *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Buy', 'Rent', 'Commercial'] as ListingType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, listingType: type }));
                      if (formData.price) handlePriceChange(formData.price);
                    }}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      formData.listingType === type
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {type === 'Buy' ? 'Sell' : type === 'Rent' ? 'Rent Out' : 'Commercial'}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Property Type *</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value as PropertyType }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              >
                <option value="Apartment">Apartment / Flat</option>
                <option value="Villa">Independent House / Villa</option>
                <option value="Plot">Residential / Commercial Plot</option>
                <option value="Penthouse">Luxury Penthouse</option>
                <option value="Commercial Office">Commercial Office Space</option>
                <option value="Commercial Shop">Retail Shop / Showroom</option>
              </select>
            </div>

            {/* Property Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Property Title / Headline *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Spacious 3 BHK Ready to Move Flat near Metro Station"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION DETAILS */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              2. Location & Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              >
                {INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                value={formData.locality}
                onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                placeholder="e.g. Vaishali Nagar, Mansarovar"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Flat 402, Royal Residency, Amrapali Marg"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PRICING & MEASUREMENT */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-red-600" />
              3. Price & Area
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {formData.listingType === 'Rent' ? 'Monthly Rent (₹) *' : 'Total Expected Price (₹) *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="e.g. 7500000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                />
                {formData.priceDisplay && (
                  <span className="absolute right-3 top-2.5 text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    {formData.priceDisplay}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Super Built-up Area (Sq. Ft) *</label>
              <input
                type="number"
                required
                value={formData.areaSqFt}
                onChange={(e) => setFormData(prev => ({ ...prev, areaSqFt: e.target.value }))}
                placeholder="e.g. 1450"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Bedrooms (BHK)</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((bhk) => (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, bedrooms: bhk }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.bedrooms === bhk
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {bhk} BHK
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Balconies</label>
              <input
                type="number"
                value={formData.balconies}
                onChange={(e) => setFormData(prev => ({ ...prev, balconies: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing</label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData(prev => ({ ...prev, furnishing: e.target.value as FurnishingStatus }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Facing Direction</label>
              <select
                value={formData.facing}
                onChange={(e) => setFormData(prev => ({ ...prev, facing: e.target.value as Facing }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              >
                <option value="East">East Facing</option>
                <option value="North">North Facing</option>
                <option value="North-East">North-East Facing</option>
                <option value="West">West Facing</option>
                <option value="South">South Facing</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: AMENITIES & PHOTOS */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              4. Amenities & Property Photos
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Select Available Amenities</label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_AMENITIES.map((item) => {
                const isSelected = customAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800">
                Property Photos & Gallery <span className="text-red-500 font-normal">({formData.images.length} added)</span>
              </label>
              <span className="text-[11px] text-gray-500">First photo will be your Main Cover</span>
            </div>

            {/* Direct Device Upload Zone */}
            <div className="relative border-2 border-dashed border-red-200 hover:border-red-400 bg-red-50/40 hover:bg-red-50/70 transition-all rounded-2xl p-5 text-center cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    <p className="text-xs font-bold text-gray-700">Uploading and optimizing images...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Click to upload photos from your device or drag and drop
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        PNG, JPG, JPEG, WebP supported (multiple photos allowed)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick 1-Click HD Image Presets */}
            <div>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Choose from High-Definition Presets
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {DEFAULT_IMAGE_PRESETS.map((preset, idx) => {
                  const isIncluded = formData.images.includes(preset.url);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleAddPresetImage(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border text-left cursor-pointer transition-all group ${
                        isIncluded ? 'border-red-600 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white leading-tight truncate">{preset.name}</span>
                      </div>
                      {isIncluded && (
                        <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add by Web URL */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Add Photo by Web URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 rounded-xl cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview Grid with Controls */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Selected Photo Gallery ({formData.images.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-gray-100 shadow-xs">
                    <img src={img} alt={`Gallery item ${idx}`} className="w-full h-full object-cover" />
                    
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md">
                        Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(idx)}
                        className="absolute top-2 left-2 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe nearby landmarks, connectivity, society highlights, water supply, modular kitchen details, etc."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 5: CONTACT INFORMATION */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              5. Owner / Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">I am *</label>
              <select
                value={formData.postedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, postedBy: e.target.value as PostedBy }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              >
                <option value="Owner">Owner</option>
                <option value="Agent">Agent / Broker</option>
                <option value="Builder">Builder / Developer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={formData.postedByName}
                onChange={(e) => setFormData(prev => ({ ...prev, postedByName: e.target.value }))}
                placeholder="e.g. Rohit Sharma"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={formData.postedByPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, postedByPhone: e.target.value }))}
                placeholder="e.g. +91 98290 12345"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.postedByEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, postedByEmail: e.target.value }))}
                placeholder="e.g. rohit@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Instant live publication • Visible to buyers on all devices</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-4 px-10 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Property...' : 'Publish Property Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

