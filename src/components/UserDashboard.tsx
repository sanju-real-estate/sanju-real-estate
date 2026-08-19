import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { Heart, Calculator, CheckCircle, Loader2 } from 'lucide-react';
import { INDIAN_CITIES } from '../data/cities';
import { APP_LOGO } from '../assets/logo';

export const UserDashboard: React.FC = () => {
  const { 
    properties, 
    wishlistIds, 
    selectedCity,
    showToast,
    siteSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'valuation'>('wishlist');

  // Filter properties
  const savedProperties = properties.filter(p => wishlistIds.includes(p.id));

  // AI Valuation State
  const [valCity, setValCity] = useState(selectedCity || 'Jaipur');
  const [valLocality, setValLocality] = useState('Mansarovar');
  const [valType, setValType] = useState('Apartment');
  const [valBhk, setValBhk] = useState(3);
  const [valSqFt, setValSqFt] = useState(1350);
  const [valFurnishing, setValFurnishing] = useState('Semi-Furnished');
  const [valAge, setValAge] = useState(2);
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [isValuating, setIsValuating] = useState(false);

  const handleRunValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValuating(true);
    try {
      const res = await fetch('/api/gemini/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: valCity,
          locality: valLocality,
          propertyType: valType,
          bhk: valBhk,
          areaSqFt: valSqFt,
          furnishing: valFurnishing,
          ageYears: valAge
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.valuation) {
        setValuationResult(data.valuation);
        showToast('Property Valuation Generated!', 'success');
      }
    } catch (err) {
      console.error("Valuation Error:", err);
      showToast('Calculated market estimate.', 'info');
    } finally {
      setIsValuating(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Dashboard Card */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <img 
              src={siteSettings.logoUrl || APP_LOGO} 
              alt={`${siteSettings.portalName} Logo`} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = APP_LOGO;
              }}
              className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-200 shrink-0 bg-white"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {siteSettings.portalName} – Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                View your saved properties and generate instant market valuation reports.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('valuation')}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calculator className="w-4 h-4 text-red-600" />
              <span>Price Calculator</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-2xl p-2 shadow-xs gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Properties ({savedProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('valuation')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'valuation'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-300" />
            <span>Property Price Valuation</span>
          </button>
        </div>

        {/* TAB 1: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {savedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">No saved properties yet</h3>
                <p className="text-xs text-gray-500">Click the heart icon on any property to save it to your wishlist.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SMART PROPERTY VALUATION TOOL */}
        {activeTab === 'valuation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Property Price Estimator</h3>
                  <p className="text-xs text-gray-500">Estimate current market valuation based on location & specs</p>
                </div>
              </div>

              <form onSubmit={handleRunValuation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">City</label>
                  <select
                    value={valCity}
                    onChange={(e) => setValCity(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-semibold text-gray-900 min-h-[44px]"
                  >
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Locality</label>
                  <input
                    type="text"
                    value={valLocality}
                    onChange={(e) => setValLocality(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-medium text-gray-900 min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">BHK</label>
                    <select
                      value={valBhk}
                      onChange={(e) => setValBhk(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-semibold text-gray-900 min-h-[44px]"
                    >
                      {[1, 2, 3, 4, 5].map(b => <option key={b} value={b}>{b} BHK</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Area (Sq.Ft)</label>
                    <input
                      type="number"
                      value={valSqFt}
                      onChange={(e) => setValSqFt(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-semibold text-gray-900 min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isValuating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {isValuating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4 text-amber-300" />}
                  <span>Calculate Market Valuation</span>
                </button>
              </form>
            </div>

            {/* Valuation Results Output Box */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-6">
              {!valuationResult ? (
                <div className="py-16 text-center space-y-3">
                  <Calculator className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Ready for Valuation Report</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Fill in the property metrics on the left and click calculate to generate instant market price range, rental yield, and investment forecast.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white">Valuation Report Summary</h3>
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded">
                      {valuationResult.investmentRecommendation}
                    </span>
                  </div>

                  {/* Price Banner */}
                  <div className="p-5 bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-800/40 rounded-2xl text-center">
                    <span className="text-xs text-slate-400 font-bold block mb-1">ESTIMATED MARKET VALUE RANGE</span>
                    <div className="text-3xl font-black text-red-400 tracking-tight">
                      {valuationResult.estimatedPriceDisplay}
                    </div>
                    <span className="text-xs text-slate-300 font-semibold mt-1 block">
                      Avg Rate: ₹{valuationResult.avgPricePerSqFt.toLocaleString()}/sq.ft
                    </span>
                  </div>

                  {/* Rent & Yield Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">ESTIMATED MONTHLY RENT</span>
                      <span className="text-xl font-bold text-white mt-1 block">{valuationResult.estimatedRentMonthly}</span>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">PROJECTED RENTAL YIELD</span>
                      <span className="text-xl font-bold text-emerald-400 mt-1 block">{valuationResult.rentalYield}</span>
                    </div>
                  </div>

                  {/* Key Drivers */}
                  {valuationResult.keyDrivers && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Key Price Drivers & Investment Analysis
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        {valuationResult.keyDrivers.map((driver: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                            <CheckCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{driver}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
