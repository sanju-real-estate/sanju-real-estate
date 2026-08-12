import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { Property, PropertyType, PostedBy, FurnishingStatus, ConstructionStatus } from '../types';
import { Filter, SlidersHorizontal, Grid, List, RotateCcw, Search, ChevronDown, Check, Building, ShieldCheck, Home } from 'lucide-react';

interface PropertyListingPageProps {
  onContactClick: (property: Property) => void;
}

export const PropertyListingPage: React.FC<PropertyListingPageProps> = ({ onContactClick }) => {
  const { properties, filters, setFilters, resetFilters, selectedCity } = useApp();

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter options constants
  const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Commercial Office', 'Commercial Shop'];
  const POSTED_BY_OPTIONS: PostedBy[] = ['Owner', 'Agent', 'Builder'];
  const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
  const CONSTRUCTION_OPTIONS: ConstructionStatus[] = ['Ready to Move', 'Under Construction'];
  const BHK_OPTIONS = [1, 2, 3, 4];

  // Filtering Logic
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Listing Type check
      if (filters.listingType && filters.listingType !== 'Buy') {
        if (filters.listingType === 'Rent' && p.listingType !== 'Rent') return false;
        if (filters.listingType === 'Commercial' && p.listingType !== 'Commercial') return false;
        if (filters.listingType === 'New Projects' && p.listingType !== 'New Projects' && p.constructionStatus !== 'Under Construction') return false;
      }

      // City filter
      if (filters.city && filters.city !== 'All Cities' && p.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Locality / Search query
      if (filters.locality || filters.searchQuery) {
        const query = (filters.locality || filters.searchQuery).toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchLoc = p.locality.toLowerCase().includes(query);
        const matchCity = p.city.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchCity && !matchDesc) return false;
      }

      // Property Type filter
      if (filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(p.propertyType)) return false;
      }

      // BHK filter
      if (filters.bhk.length > 0) {
        if (!filters.bhk.includes(p.bedrooms)) return false;
      }

      // Price filter
      if (p.price < filters.minPrice || p.price > filters.maxPrice) {
        return false;
      }

      // Construction status filter
      if (filters.constructionStatus.length > 0) {
        if (!filters.constructionStatus.includes(p.constructionStatus)) return false;
      }

      // Posted By filter
      if (filters.postedBy.length > 0) {
        if (!filters.postedBy.includes(p.postedBy)) return false;
      }

      // Furnishing status filter
      if (filters.furnishing.length > 0) {
        if (!filters.furnishing.includes(p.furnishing)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_low') return a.price - b.price;
      if (filters.sortBy === 'price_high') return b.price - a.price;
      if (filters.sortBy === 'area_high') return b.areaSqFt - a.areaSqFt;
      if (filters.sortBy === 'newest') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      return 0; // relevance
    });
  }, [properties, filters]);

  // Handlers for filter toggles
  const handlePropertyTypeToggle = (pt: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(pt)
        ? prev.propertyTypes.filter(t => t !== pt)
        : [...prev.propertyTypes, pt]
    }));
  };

  const handleBhkToggle = (bhk: number) => {
    setFilters(prev => ({
      ...prev,
      bhk: prev.bhk.includes(bhk)
        ? prev.bhk.filter(b => b !== bhk)
        : [...prev.bhk, bhk]
    }));
  };

  const handlePostedByToggle = (pb: PostedBy) => {
    setFilters(prev => ({
      ...prev,
      postedBy: prev.postedBy.includes(pb)
        ? prev.postedBy.filter(p => p !== pb)
        : [...prev.postedBy, pb]
    }));
  };

  const handleConstructionToggle = (cs: ConstructionStatus) => {
    setFilters(prev => ({
      ...prev,
      constructionStatus: prev.constructionStatus.includes(cs)
        ? prev.constructionStatus.filter(c => c !== cs)
        : [...prev.constructionStatus, cs]
    }));
  };

  const handleFurnishingToggle = (fs: FurnishingStatus) => {
    setFilters(prev => ({
      ...prev,
      furnishing: prev.furnishing.includes(fs)
        ? prev.furnishing.filter(f => f !== fs)
        : [...prev.furnishing, fs]
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Top Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">
              Properties in {filters.city || selectedCity} {filters.locality ? `› ${filters.locality}` : ''}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {filters.listingType || 'Buy'} Properties for Sale in {filters.city || selectedCity}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing <strong className="text-gray-900">{filteredProperties.length}</strong> properties matching your preferences
            </p>
          </div>

          {/* Top Control Bar (Layout Toggle + Sort Dropdown) */}
          <div className="flex items-center gap-3">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="area_high">Carpet Area: High to Low</option>
              </select>
            </div>

            {/* Layout Toggle (Grid vs List) */}
            <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layout === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layout === 'list' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

          </div>
        </div>

        {/* Main Grid Content (Left Sidebar + Listings Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filter Panel (Desktop & Mobile Modal) */}
          <aside
            className={`lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-6 lg:block ${
              isMobileFilterOpen ? 'block fixed inset-0 z-50 bg-white overflow-y-auto p-6' : 'hidden'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
                {isMobileFilterOpen && (
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="lg:hidden text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>

            {/* Filter 1: BHK Count */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                BHK Count
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BHK_OPTIONS.map(bhk => {
                  const active = filters.bhk.includes(bhk);
                  return (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => handleBhkToggle(bhk)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-red-600 border-red-600 text-white shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {bhk} BHK
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: Max Budget Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Max Price Range
                </label>
                <span className="text-xs font-bold text-red-600">
                  {filters.maxPrice >= 100000000
                    ? 'Up to Any Price'
                    : filters.maxPrice >= 10000000
                    ? `₹${(filters.maxPrice / 10000000).toFixed(1)} Cr`
                    : `₹${(filters.maxPrice / 100000).toFixed(0)} Lacs`}
                </span>
              </div>
              <input
                type="range"
                min={2000000}
                max={100000000}
                step={2000000}
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-1">
                <span>₹20 Lacs</span>
                <span>₹5 Cr</span>
                <span>₹10 Cr+</span>
              </div>
            </div>

            {/* Filter 3: Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                Property Type
              </label>
              <div className="space-y-2">
                {PROPERTY_TYPES.map(pt => {
                  const checked = filters.propertyTypes.includes(pt);
                  return (
                    <label
                      key={pt}
                      className="flex items-center gap-2.5 text-xs font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handlePropertyTypeToggle(pt)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                      />
                      <span>{pt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter 4: Posted By (Owner / Builder / Agent) */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                Posted By
              </label>
              <div className="flex flex-wrap gap-2">
                {POSTED_BY_OPTIONS.map(pb => {
                  const active = filters.postedBy.includes(pb);
                  return (
                    <button
                      key={pb}
                      type="button"
                      onClick={() => handlePostedByToggle(pb)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pb === 'Owner' ? 'Verified Owner' : pb}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 5: Construction Status */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                Construction Status
              </label>
              <div className="space-y-2">
                {CONSTRUCTION_OPTIONS.map(cs => {
                  const checked = filters.constructionStatus.includes(cs);
                  return (
                    <label
                      key={cs}
                      className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleConstructionToggle(cs)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                      />
                      <span>{cs}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter 6: Furnishing Status */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                Furnishing Status
              </label>
              <div className="space-y-2 pb-16 lg:pb-0">
                {FURNISHING_OPTIONS.map(fs => {
                  const checked = filters.furnishing.includes(fs);
                  return (
                    <label
                      key={fs}
                      className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleFurnishingToggle(fs)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                      />
                      <span>{fs}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sticky Mobile Apply Button */}
            {isMobileFilterOpen && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Apply Filters ({filteredProperties.length} Properties)</span>
                </button>
              </div>
            )}

          </aside>

          {/* Right Property Listings Area */}
          <main className="lg:col-span-8">
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  We couldn't find any properties matching your current filters. Try relaxing your budget range or clearing specific filter criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onContactClick={onContactClick}
                    layout={layout}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};
