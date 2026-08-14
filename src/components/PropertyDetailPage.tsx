import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, MapPin, CheckCircle, Bed, Bath, Maximize2, Phone, Calendar, 
  ArrowLeft, Share2, Shield, Compass, Car, Sparkles, Building, Play, X,
  Layers, ChevronRight, Check, CheckCircle2, Info, Loader2
} from 'lucide-react';

interface PropertyDetailPageProps {
  property: Property;
  onContactClick: (property: Property) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ property, onContactClick }) => {
  const { wishlistIds, toggleWishlist, setActiveView, showToast } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState<'2D' | '3D'>('2D');
  const [localityInsights, setLocalityInsights] = useState<any>(null);
  const [isLoadingLocality, setIsLoadingLocality] = useState(false);

  const isSaved = wishlistIds.includes(property.id);

  // Dynamic SEO meta tags and URL permalink update
  useEffect(() => {
    if (property) {
      if (property.seoTitle || property.title) {
        document.title = property.seoTitle || `${property.title} | ${property.locality}, ${property.city}`;
      }

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', property.seoDescription || property.description);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', property.seoKeywords || `${property.title}, ${property.locality}, ${property.city} property, real estate jaipur`);

      // Update URL hash with property custom slug or ID
      const slug = property.slug || property.id;
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#property/${slug}`);
      }
    }
  }, [property]);

  // Fetch AI Locality Insights from server endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setIsLoadingLocality(true);
      try {
        const res = await fetch('/api/gemini/locality-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locality: property.locality,
            city: property.city,
            propertyType: property.propertyType
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted && data.insights) {
          setLocalityInsights(data.insights);
        }
      } catch (err) {
        console.error("Locality fetch failed:", err);
      } finally {
        if (isMounted) setIsLoadingLocality(false);
      }
    };

    fetchInsights();
    return () => { isMounted = false; };
  }, [property.locality, property.city, property.propertyType]);

  const handleShare = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => showToast('Property link copied to clipboard!', 'info'))
          .catch(() => showToast('Property link copied!', 'info'));
      } else {
        showToast('Property link copied!', 'info');
      }
    } catch (err) {
      showToast('Property link copied!', 'info');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-28 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setActiveView('listings')}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property Listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-red-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={() => toggleWishlist(property.id)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer border ${
                isSaved
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Title & Location Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  {property.propertyType}
                </span>
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                  {property.constructionStatus}
                </span>
                {property.isVerified && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Listing
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left lg:text-right shrink-0">
              <div className="text-3xl font-black text-red-600 tracking-tight">
                {property.priceDisplay}
              </div>
              {property.pricePerSqFt > 0 && (
                <div className="text-xs font-bold text-gray-600 mt-0.5">
                  ₹{property.pricePerSqFt.toLocaleString()}/sq.ft
                </div>
              )}
              <div className="text-[11px] font-medium text-emerald-700 mt-1">
                Estimated EMI: ~₹{Math.round(property.price * 0.0085).toLocaleString()}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Image & Video Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          
          {/* Main Large Image */}
          <div className="lg:col-span-8 relative h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-slate-950 group">
            <img
              src={property.images[activeImageIdx] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            />

            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-slate-900/90 text-white hover:bg-red-600 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>View All ({property.images.length}) Photos</span>
            </button>
          </div>

          {/* Side Thumbnail List */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
            {property.images.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx + 1)}
                className={`relative h-40 sm:h-48 lg:h-[202px] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border-2 transition-all ${
                  activeImageIdx === idx + 1 ? 'border-red-600 ring-2 ring-red-600/30' : 'border-transparent hover:opacity-90'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

        </div>

        {/* Full Screen Lightbox Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-lg">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold">
                Photo {activeImageIdx + 1} of {property.images.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center my-4">
              <img
                src={property.images[activeImageIdx]}
                alt="Full preview"
                className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${
                    activeImageIdx === idx ? 'border-red-500 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Layout (Main Details Left + Sticky Contact Box Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Details Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Key Specs Matrix */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                Key Property Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Carpet Area</span>
                  <span className="text-sm font-bold text-gray-900">{property.areaSqFt} Sq.Ft</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Bedrooms / BHK</span>
                  <span className="text-sm font-bold text-gray-900">{property.bedrooms} BHK</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Floor / Total</span>
                  <span className="text-sm font-bold text-gray-900">{property.floor} of {property.totalFloors}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Facing Direction</span>
                  <span className="text-sm font-bold text-gray-900">{property.facing}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Furnishing</span>
                  <span className="text-sm font-bold text-gray-900">{property.furnishing}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Parking</span>
                  <span className="text-sm font-bold text-gray-900">{property.parking}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Building Age</span>
                  <span className="text-sm font-bold text-gray-900">{property.ageOfBuilding}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold block">Possession Date</span>
                  <span className="text-sm font-bold text-gray-900">{property.possessionDate}</span>
                </div>
              </div>
            </div>

            {/* Overview / Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">
                About Property & Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-normal">
                {property.description}
              </p>
            </div>

            {/* Interactive Floor Plan Viewer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-600" />
                  Floor Plan & Layout Strategy
                </h2>

                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActiveFloorPlanTab('2D')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeFloorPlanTab === '2D' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    2D Architecture
                  </button>
                  <button
                    onClick={() => setActiveFloorPlanTab('3D')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeFloorPlanTab === '3D' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    3D Isometric View
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <img
                  src={property.floorPlanUrl || 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80'}
                  alt="Floor Plan"
                  className="max-h-80 mx-auto object-contain rounded-lg shadow-lg"
                />
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Architectural floor plan depicting optimal cross-ventilation, zero space wastage, and private balcony layout.
                </p>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                Amenities & Facilities
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(amenity => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl text-xs font-semibold text-gray-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locality Insights Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-600/20 text-red-400 rounded-xl">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Locality Intelligence</h2>
                    <p className="text-xs text-slate-400">Neighborhood Analytics & Price Trends</p>
                  </div>
                </div>

                <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                  SMART REPORT
                </span>
              </div>

              {isLoadingLocality ? (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Analyzing neighborhood connectivity, ROI & price trend metrics...</p>
                </div>
              ) : localityInsights ? (
                <div className="space-y-5">
                  {/* Scores Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/80 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">Transit & Connectivity</span>
                      <span className="text-xl font-black text-emerald-400">{localityInsights.connectivityScore}/10</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">Lifestyle Index</span>
                      <span className="text-xl font-black text-amber-400">{localityInsights.lifestyleRating}/10</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">3-Yr ROI Potential</span>
                      <span className="text-xl font-black text-red-400">{localityInsights.investmentScore}/10</span>
                    </div>
                  </div>

                  {/* Summary Overview */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    {localityInsights.summary}
                  </p>

                  {/* Nearby Highlights */}
                  {localityInsights.nearbyHighlights && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                        Key Neighborhood Perks
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {localityInsights.nearbyHighlights.map((h: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Future Outlook */}
                  <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-200">
                    <strong className="text-red-300 font-bold">Future Outlook: </strong>
                    {localityInsights.futureOutlook}
                  </div>
                </div>
              ) : null}

            </div>

          </div>

          {/* Right Sticky Sidebar (Contact Lead Form) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-5">
              
              {/* Seller / Agent Info Card */}
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center shrink-0 border border-slate-700">
                  <Phone className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-red-600 tracking-wider">
                    Broker Helpline ({property.postedBy})
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">Jaipur Properties Hub</h3>
                  <a href="tel:+919772117575" className="text-xs font-black text-gray-900 hover:text-red-600 flex items-center gap-1 mt-0.5">
                    <span>+91 97721 17575</span>
                  </a>
                </div>
              </div>

              {/* Direct Call & WhatsApp Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+919772117575"
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 9772117575</span>
                </a>
                <a
                  href={`https://wa.me/919772117575?text=${encodeURIComponent(`Hello Jaipur Properties Hub, I am interested in property: ${property.title} (${property.id})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Inquiry Form Trigger */}
              <button
                type="button"
                onClick={() => onContactClick(property)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-red-400" />
                <span>Inquire / Schedule Site Visit</span>
              </button>

              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center space-y-1">
                <p className="flex items-center justify-center gap-1 font-semibold text-emerald-600">
                  <Shield className="w-3.5 h-3.5" /> 100% Verified Broker Protection
                </p>
                <p>All inquiries are handled directly by Jaipur Properties Hub broker helpline (+91 97721 17575).</p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Mobile Sticky Floating CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-2xl lg:hidden">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <a
            href="tel:+919772117575"
            className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5 text-center"
          >
            <Phone className="w-4 h-4" />
            <span>Call 9772117575</span>
          </a>

          <button
            type="button"
            onClick={() => onContactClick(property)}
            className="flex-1 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-red-400" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
