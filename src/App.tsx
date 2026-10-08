import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedCollections } from './components/FeaturedCollections';
import { PropertyListingPage } from './components/PropertyListingPage';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { PostPropertyPortal } from './components/PostPropertyPortal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RealEstateCalculators } from './components/RealEstateCalculators';
import { LeadModal } from './components/LeadModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SEOHead } from './components/SEOHead';
import { VrindavanLandingPage } from './components/VrindavanLandingPage';
import { Property } from './types';
import { Building2, Phone, Mail, MapPin, Heart, ShieldCheck, Sparkles, ChevronRight, Calculator, PlusCircle, Settings } from 'lucide-react';
import { APP_LOGO } from './assets/logo';

const MainContent: React.FC = () => {
  const { activeView, selectedProperty, setActiveView, setFilters, siteSettings } = useApp();
  const [modalProperty, setModalProperty] = useState<Property | null>(null);

  const handleContactClick = (property: Property) => {
    setModalProperty(property);
  };

  const handleFooterCityClick = (city: string) => {
    setFilters(prev => ({ ...prev, city }));
    setActiveView('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Dynamic SEO & Schema Meta Manager */}
      <SEOHead property={selectedProperty} />

      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main id="main-content" role="main" className="flex-1">
        {activeView === 'vrindavan' && (
          <VrindavanLandingPage />
        )}

        {activeView === 'home' && (
          <>
            {/* Featured Vrindavan City Spotlight Banner */}
            <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#022c22] text-white py-3 px-4 border-b border-amber-500/40 shadow-inner">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="font-extrabold text-amber-300 text-sm font-serif">
                        VRINDAVAN CITY
                      </span>
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        New Launch
                      </span>
                    </div>
                    <p className="text-xs text-gray-200">
                      Premium JDA Approved Gated Township on Main Jaipur-Sikar Highway • Plots @ ₹55,900/- per Sq. Yard
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('vrindavan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Explore Township Landing Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <HeroSection />
            <FeaturedCollections onContactClick={handleContactClick} />
          </>
        )}

        {activeView === 'listings' && (
          <PropertyListingPage onContactClick={handleContactClick} />
        )}

        {activeView === 'detail' && selectedProperty && (
          <PropertyDetailPage property={selectedProperty} onContactClick={handleContactClick} />
        )}

        {activeView === 'post-property' && (
          <PostPropertyPortal />
        )}

        {activeView === 'dashboard' && (
          <UserDashboard />
        )}

        {activeView === 'valuation' && (
          <RealEstateCalculators />
        )}

        {activeView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Contact Owner Lead Modal */}
      <LeadModal
        property={modalProperty}
        onClose={() => setModalProperty(null)}
      />

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer />

      {/* Global Toast Messages */}
      <ToastContainer />

      {/* Footer (Dark Vibrant Theme #1F2937 / Slate-900) */}
      <footer role="contentinfo" aria-label="Site Footer" className="bg-slate-900 text-gray-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <img 
                  src={siteSettings.logoUrl || APP_LOGO} 
                  alt={`${siteSettings.portalName} Logo`} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = APP_LOGO;
                  }}
                  className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-700 bg-white"
                />
                <span className="font-extrabold text-xl text-white tracking-tight">
                  {siteSettings.portalName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded ml-1">
                  Verified Portal
                </span>
              </div>

              <p className="text-gray-400 leading-relaxed max-w-sm">
                {siteSettings.tagline || 'India premier real estate marketplace for verified owner properties.'}
              </p>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 max-w-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                  Official Broker Helpline
                </span>
                <div className="flex items-center justify-between gap-2">
                  <a 
                    href={`tel:${siteSettings.helplinePhone}`}
                    aria-label={`Call Helpline: ${siteSettings.helplinePhone}`}
                    className="text-lg font-extrabold text-white hover:text-red-400 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>{siteSettings.helplinePhone}</span>
                  </a>
                  <a 
                    href={`https://wa.me/${siteSettings.helplineWhatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(siteSettings.portalName)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Chat on WhatsApp"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Top Metropolitan Cities */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Top Cities</h3>
              <ul className="space-y-2">
                {['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'].map(city => (
                  <li key={city}>
                    <button
                      type="button"
                      aria-label={`Browse flats in ${city}`}
                      onClick={() => handleFooterCityClick(city)}
                      className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Flats in {city}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Popular Search Categories */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Popular Links</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    type="button"
                    aria-label="Vrindavan City Sikar Road Township"
                    onClick={() => { setActiveView('vrindavan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vrindavan City (Sikar Road Plots)</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Browse Zero Brokerage Owner Flats"
                    onClick={() => { setFilters(prev => ({ ...prev, postedBy: ['Owner'] })); setActiveView('listings'); }} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Zero Brokerage Owner Flats
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Browse Budget Homes Under 1.5 Crore"
                    onClick={() => { setFilters(prev => ({ ...prev, maxPrice: 15000000 })); setActiveView('listings'); }} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Budget Homes Under ₹1.5 Cr
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Browse New Builder Project Launches"
                    onClick={() => { setFilters(prev => ({ ...prev, listingType: 'New Projects' })); setActiveView('listings', 'New Projects'); }} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    New Builder Project Launches
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Browse Independent Luxury Villas"
                    onClick={() => { setFilters(prev => ({ ...prev, propertyTypes: ['Villa'] })); setActiveView('listings'); }} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Independent Luxury Villas
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Browse Commercial Workspaces and Shops"
                    onClick={() => { setFilters(prev => ({ ...prev, listingType: 'Commercial' })); setActiveView('listings', 'Commercial'); }} 
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Commercial Workspaces & Shops
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Real Estate Services & Contact */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Calculators & Services</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    type="button"
                    aria-label="Open Property Price Estimator"
                    onClick={() => { setActiveView('valuation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    <span>Property Price Estimator</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Open Home Loan EMI Calculator"
                    onClick={() => { setActiveView('valuation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Home Loan EMI Calculator
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Open Stamp Duty and Registry Calculator"
                    onClick={() => { setActiveView('valuation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Stamp Duty & Registry Calculator
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    aria-label="Open Rental Yield and ROI Calculator"
                    onClick={() => { setActiveView('valuation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Rental Yield & ROI Matrix
                  </button>
                </li>
                <li className="text-gray-400">Verified Owner Property Checks</li>
              </ul>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-gray-500 gap-4">
            <p 
              onDoubleClick={() => setActiveView('admin')}
              className="cursor-default select-none hover:text-gray-400 transition-colors"
              title="Jaipur Properties Hub"
            >
              © {new Date().getFullYear()} {siteSettings.portalName || 'Jaipur Properties Hub'}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
              <span aria-hidden="true">•</span>
              <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
              <span aria-hidden="true">•</span>
              <a href="/sitemap.xml" className="hover:text-gray-400 cursor-pointer">Sitemap</a>
              <span aria-hidden="true">•</span>
              <a href="/llms.txt" className="hover:text-gray-400 cursor-pointer">LLMs.txt</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
