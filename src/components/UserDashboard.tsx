import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { Inquiry, Property } from '../types';
import { 
  Heart, Building, PhoneCall, Calculator, Trash2, Eye, User, 
  Clock, CheckCircle, Loader2, ArrowRight, Mail, Phone, Calendar
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/cities';
import { APP_LOGO } from '../assets/logo';

export const UserDashboard: React.FC = () => {
  const { 
    properties, 
    wishlistIds, 
    inquiries, 
    updateInquiryStatus, 
    deleteProperty, 
    viewPropertyDetail,
    selectedCity,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'posted' | 'leads' | 'valuation'>('wishlist');

  // Filter properties
  const savedProperties = properties.filter(p => wishlistIds.includes(p.id));
  const userPostedProperties = properties.filter(p => p.postedBy === 'Owner' || p.id.startsWith('prop-'));

  // AI Valuation State
  const [valCity, setValCity] = useState(selectedCity || 'Mumbai');
  const [valLocality, setValLocality] = useState('Bandra West');
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
        
        {/* Header Title */}
        <div className="mb-6 flex items-center gap-3">
          <img 
            src={APP_LOGO} 
            alt="Jaipur Properties Hub Logo" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.tried) {
                target.dataset.tried = '1';
                target.src = '/assets/images/logo1.jpg';
              } else if (target.dataset.tried === '1') {
                target.dataset.tried = '2';
                target.src = '/logo1.jpg';
              }
            }}
            className="w-12 h-12 rounded-full object-cover shadow-md border border-gray-200 shrink-0"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              User Dashboard & Inquiries Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage saved properties, track direct leads, and compute property valuation reports.
            </p>
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
            onClick={() => setActiveTab('posted')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'posted'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Posted Properties ({userPostedProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Received Leads ({inquiries.length})</span>
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

        {/* TAB 2: MY POSTED PROPERTIES */}
        {activeTab === 'posted' && (
          <div className="space-y-4">
            {userPostedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <Building className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">You haven't posted any property yet</h3>
                <p className="text-xs text-gray-500">Post your property for FREE to reach thousands of homebuyers.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-gray-200">
                  {userPostedProperties.map(prop => (
                    <div key={prop.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100"
                        />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {prop.propertyType} • {prop.listingType}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{prop.title}</h3>
                          <p className="text-xs font-semibold text-red-600">{prop.priceDisplay}</p>
                          <p className="text-[11px] text-gray-400">{prop.locality}, {prop.city}</p>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right text-xs">
                          <span className="text-gray-400 block font-medium">Views</span>
                          <strong className="text-gray-900 font-bold">{prop.viewsCount}</strong>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-gray-400 block font-medium">Leads</span>
                          <strong className="text-red-600 font-extrabold">{prop.leadsCount}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => viewPropertyDetail(prop)}
                            className="p-2 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg"
                            title="View Property"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProperty(prop.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECEIVED INQUIRIES / LEADS TABLE */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Buyer & Tenant Direct Leads</h3>
                <p className="text-xs text-gray-500">Inquiries received from interested buyers for your listings.</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                {inquiries.length} Inquiries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Buyer Details</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Message / Request</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Lead Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inquiries.map(inq => (
                    <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{inq.userName}</div>
                        <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" /> {inq.userPhone}
                        </div>
                        <div className="text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {inq.userEmail}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900 max-w-xs line-clamp-1">{inq.propertyTitle}</div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">{inq.userType}</span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-gray-700 italic line-clamp-2">"{inq.message}"</p>
                        {inq.scheduleVisitDate && (
                          <div className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> Requested Visit: {inq.scheduleVisitDate}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-gray-500 font-medium whitespace-nowrap">
                        {inq.createdAt}
                      </td>

                      <td className="p-4">
                        <select
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                          className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                        >
                          <option value="New">🟢 New</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="Site Visit Scheduled">🔵 Site Visit Scheduled</option>
                          <option value="Closed">✅ Closed / Converted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SMART PROPERTY VALUATION TOOL */}
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
