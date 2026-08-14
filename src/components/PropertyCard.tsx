import React, { useState } from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, MapPin, CheckCircle, Bed, Bath, Maximize2, Phone, User, Share2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onContactClick?: (property: Property) => void;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onContactClick, layout = 'grid' }) => {
  const { wishlistIds, toggleWishlist, viewPropertyDetail, showToast } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const isSaved = wishlistIds.includes(property.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => showToast('Property link copied to clipboard!', 'info'))
          .catch(() => showToast('Property link copied to clipboard!', 'info'));
      } else {
        showToast('Property link copied!', 'info');
      }
    } catch (err) {
      showToast('Property link copied!', 'info');
    }
  };

  const isList = layout === 'list';

  return (
    <div
      onClick={() => viewPropertyDetail(property)}
      className={`group bg-white rounded-2xl border border-gray-200 hover:border-red-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex ${
        isList ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {/* Image Showcase Container */}
      <div className={`relative overflow-hidden bg-gray-100 ${isList ? 'sm:w-80 shrink-0 h-56 sm:h-auto' : 'h-56'}`}>
        <img
          src={property.images[activeImageIdx] || property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.isVerified && (
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
          {property.isExclusive && (
            <span className="bg-amber-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
              Exclusive
            </span>
          )}
          <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
            {property.constructionStatus}
          </span>
        </div>

        {/* Action Buttons Overlay (Wishlist + Share) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-red-600 flex items-center justify-center backdrop-blur-md shadow-xs transition-colors"
            title="Share property"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(property.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors ${
              isSaved
                ? 'bg-red-600 text-white'
                : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-600'
            }`}
            title={isSaved ? 'Remove from Wishlist' : 'Save Property'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Thumbnail Dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
            {property.images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIdx === idx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Rate Header */}
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-red-600 tracking-tight">
                {property.priceDisplay}
              </span>
              {property.pricePerSqFt > 0 && (
                <span className="text-xs font-semibold text-gray-500">
                  ₹{property.pricePerSqFt.toLocaleString()}/sq.ft
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
              {property.propertyType}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-1">
            {property.title}
          </h3>

          {/* Location Badge */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1 font-medium">{property.locality}, {property.city}</span>
          </div>

          {/* Specs Bar (BHK, Baths, SqFt) */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-gray-50 rounded-xl mb-4 text-xs font-semibold text-gray-700">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-gray-400" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 col-span-1">
              <Maximize2 className="w-4 h-4 text-gray-400" />
              <span>{property.areaSqFt} Sq.Ft</span>
            </div>
          </div>
        </div>

        {/* Footer & Action CTAs */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          
          {/* Posted By Tag */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">Posted by <strong className="text-gray-800">{property.postedBy}</strong></span>
          </div>

          {/* Contact Owner CTA Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <a
              href="tel:+919772117575"
              onClick={(e) => e.stopPropagation()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Call Helpline"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Call 9772117575</span>
            </a>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onContactClick) onContactClick(property);
              }}
              className="bg-slate-900 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>Inquire</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
