import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Home, Layers, ArrowRight, Building, Key, PlusCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ListingType, PropertyType } from '../types';
import { APP_LOGO } from '../assets/logo';

export const HeroSection: React.FC = () => {
  const { selectedCity, setFilters, setActiveView, siteSettings } = useApp();

  const [activeTab, setActiveTab] = useState<ListingType>('Buy');
  const [localityInput, setLocalityInput] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<number[]>([]);
  const [budgetMax, setBudgetMax] = useState<number>(100000000);

  const PROPERTY_TYPES: { label: string; value: string }[] = [
    { label: 'All Types', value: 'All' },
    { label: 'Flat / Apartment', value: 'Apartment' },
    { label: 'Independent Villa', value: 'Villa' },
    { label: 'Plot / Land', value: 'Plot' },
    { label: 'Penthouse', value: 'Penthouse' },
    { label: 'Commercial Space', value: 'Commercial Office' }
  ];

  const BHK_OPTIONS = [1, 2, 3, 4];

  const handleBhkToggle = (bhk: number) => {
    if (selectedBhk.includes(bhk)) {
      setSelectedBhk(selectedBhk.filter(b => b !== bhk));
    } else {
      setSelectedBhk([...selectedBhk, bhk]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      listingType: activeTab,
      city: selectedCity,
      locality: localityInput,
      propertyTypes: selectedPropertyType === 'All' ? [] : [selectedPropertyType as PropertyType],
      bhk: selectedBhk,
      maxPrice: budgetMax,
      searchQuery: localityInput
    }));
    setActiveView('listings', activeTab);
  };

  const setQuickFilter = (locality: string, pType?: PropertyType, maxP?: number) => {
    setFilters(prev => ({
      ...prev,
      listingType: activeTab,
      city: selectedCity,
      locality: locality,
      propertyTypes: pType ? [pType] : [],
      maxPrice: maxP || 100000000,
      searchQuery: locality
    }));
    setActiveView('listings', activeTab);
  };

  return (
    <div className="relative bg-slate-900 text-white pt-8 pb-16 overflow-hidden">
      {/* Background Image Overlay with subtle dark gradient */}
      <div className="absolute inset-0 z-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/90 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3 flex flex-col items-center">
          <img 
            src={siteSettings.logoUrl || APP_LOGO} 
            alt={`${siteSettings.portalName} Logo`} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.tried) {
                target.dataset.tried = '1';
                target.src = APP_LOGO;
              }
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg border-2 border-red-500/80 mb-1 bg-white"
          />
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
            <span>Smart Search & Instant Owner Listings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {siteSettings.portalName} – <span className="text-red-500">{siteSettings.heroHeadline || 'Properties in Jaipur'}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-normal">
            {siteSettings.tagline || 'Explore verified residential & commercial properties in Jaipur with direct owner enquiries.'}
          </p>
        </div>

        {/* Main Search Filter Box */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-3.5 sm:p-6 border border-gray-100 max-w-4xl mx-auto">
          
          {/* Listing Type Tabs (Buy, Rent, Commercial, New Projects) */}
          <div className="flex items-center justify-start border-b border-gray-200 pb-2.5 gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none flex-nowrap -mx-1 px-1">
            {(['Buy', 'Rent', 'Commercial', 'New Projects'] as ListingType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50/50 bg-gray-50/80 sm:bg-transparent'
                }`}
              >
                {tab === 'Buy' && <Home className="w-4 h-4 shrink-0" />}
                {tab === 'Rent' && <Key className="w-4 h-4 shrink-0" />}
                {tab === 'Commercial' && <Building className="w-4 h-4 shrink-0" />}
                {tab === 'New Projects' && <Layers className="w-4 h-4 shrink-0" />}
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {/* Search Form Controls */}
          <form onSubmit={handleSearch} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* City & Locality Input */}
              <div className="md:col-span-5 relative">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Locality / Landmark in {selectedCity}
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-red-600 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={localityInput}
                    onChange={(e) => setLocalityInput(e.target.value)}
                    placeholder={selectedCity === 'Jaipur' ? 'e.g. Vaishali Nagar, Malviya Nagar, Jagatpura...' : 'e.g. Bandra, Whitefield, DLF Phase 5...'}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Property Type
                </label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 cursor-pointer"
                >
                  {PROPERTY_TYPES.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Max Budget
                </label>
                <select
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 cursor-pointer"
                >
                  <option value={100000000}>Any Budget</option>
                  <option value={5000000}>Under ₹50 Lacs</option>
                  <option value={10000000}>Under ₹1 Crore</option>
                  <option value={25000000}>Under ₹2.5 Crores</option>
                  <option value={50000000}>Under ₹5 Crores</option>
                </select>
              </div>

            </div>

            {/* BHK Selection & Action Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
              
              {/* BHK Pills */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 shrink-0">BHK:</span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {BHK_OPTIONS.map(bhk => {
                    const isSelected = selectedBhk.includes(bhk);
                    return (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => handleBhkToggle(bhk)}
                        className={`min-w-[42px] min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {bhk}{bhk === 4 ? '+' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[44px] bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>

          </form>

          {/* Quick Search Shortcut Chips */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-gray-400 font-medium shrink-0">Popular in {selectedCity}:</span>
            {selectedCity === 'Jaipur' ? (
              <>
                <button
                  type="button"
                  onClick={() => setQuickFilter('Vaishali Nagar')}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  Vaishali Nagar
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('Malviya Nagar')}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  Malviya Nagar
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('Jagatpura')}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  Jagatpura
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('C-Scheme')}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  C-Scheme Luxury
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setQuickFilter('', 'Apartment', 10000000)}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  Under ₹1 Cr Flats
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('', 'Villa')}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-2.5 py-1 rounded-full shrink-0 transition-colors"
                >
                  Luxury Villas
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
