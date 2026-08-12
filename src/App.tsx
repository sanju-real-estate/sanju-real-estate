import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedCollections } from './components/FeaturedCollections';
import { PropertyListingPage } from './components/PropertyListingPage';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { PostPropertyPortal } from './components/PostPropertyPortal';
import { UserDashboard } from './components/UserDashboard';
import { LeadModal } from './components/LeadModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Property } from './types';
import { Building2, Phone, Mail, MapPin, Heart, ShieldCheck, Sparkles, ChevronRight, Calculator, PlusCircle } from 'lucide-react';
import { APP_LOGO } from './assets/logo';

const MainContent: React.FC = () => {
  const { activeView, selectedProperty, setActiveView, setFilters } = useApp();
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
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
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

        {(activeView === 'dashboard' || activeView === 'valuation') && (
          <UserDashboard />
        )}
      </main>

      {/* Contact Owner Lead Modal */}
      <LeadModal
        property={modalProperty}
        onClose={() => setModalProperty(null)}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer />

      {/* Global Toast Messages */}
      <ToastContainer />

      {/* Footer (Dark Vibrant Theme #1F2937 / Slate-900) */}
      <footer className="bg-slate-900 text-gray-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
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
                  className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-700"
                />
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Jaipur Properties Hub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded ml-1">
                  Verified Portal
                </span>
              </div>

              <p className="text-gray-400 leading-relaxed max-w-sm">
                India's premier real estate marketplace. Explore verified owner properties, zero brokerage listings, instant property valuations, and direct site visit bookings.
              </p>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 max-w-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                  Official Broker Helpline
                </span>
                <div className="flex items-center justify-between gap-2">
                  <a href="tel:+919772117575" className="text-lg font-extrabold text-white hover:text-red-400 transition-colors flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>+91 97721 17575</span>
                  </a>
                  <a 
                    href="https://wa.me/919772117575?text=Hello%20Jaipur%20Properties%20Hub" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('post-property')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Property FREE</span>
                </button>
                <button
                  onClick={() => setActiveView('valuation')}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Property Valuation</span>
                </button>
              </div>
            </div>

            {/* Col 2: Top Metropolitan Cities */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Top Cities</h4>
              <ul className="space-y-2">
                {['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'].map(city => (
                  <li key={city}>
                    <button
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
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Popular Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => { setFilters(prev => ({ ...prev, postedBy: ['Owner'] })); setActiveView('listings'); }} className="text-gray-400 hover:text-red-400 transition-colors">
                    Zero Brokerage Owner Flats
                  </button>
                </li>
                <li>
                  <button onClick={() => { setFilters(prev => ({ ...prev, maxPrice: 15000000 })); setActiveView('listings'); }} className="text-gray-400 hover:text-red-400 transition-colors">
                    Budget Homes Under ₹1.5 Cr
                  </button>
                </li>
                <li>
                  <button onClick={() => { setFilters(prev => ({ ...prev, listingType: 'New Projects' })); setActiveView('listings'); }} className="text-gray-400 hover:text-red-400 transition-colors">
                    New Builder Project Launches
                  </button>
                </li>
                <li>
                  <button onClick={() => { setFilters(prev => ({ ...prev, propertyTypes: ['Villa'] })); setActiveView('listings'); }} className="text-gray-400 hover:text-red-400 transition-colors">
                    Independent Luxury Villas
                  </button>
                </li>
                <li>
                  <button onClick={() => { setFilters(prev => ({ ...prev, listingType: 'Commercial' })); setActiveView('listings'); }} className="text-gray-400 hover:text-red-400 transition-colors">
                    Commercial Workspaces & Shops
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Real Estate Services & Contact */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Real Estate Services</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Property Price Estimator</span>
                </li>
                <li className="text-gray-400">Locality Growth Reports</li>
                <li className="text-gray-400">Automated Description Helper</li>
                <li className="text-gray-400">Direct Buyer Inquiries Tracker</li>
                <li className="text-gray-400">Verified Owner Checks</li>
              </ul>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} Jaipur Properties Hub. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-gray-400 cursor-pointer">Sitemap</span>
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
