import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, PlusCircle, UserCheck, Menu, X, Calculator, Phone, ShieldCheck } from 'lucide-react';
import { APP_LOGO } from '../assets/logo';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    wishlistIds, 
    setFilters,
    currentUser,
    openAuthModal,
    logout,
    siteSettings
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'home' | 'listings' | 'post-property' | 'dashboard' | 'valuation' | 'admin', listingType?: string) => {
    if (listingType) {
      setFilters(prev => ({ ...prev, listingType: listingType as any }));
    }
    setActiveView(view, listingType);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs w-full">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-gray-300 text-xs py-1 px-2.5 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400 text-[11px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">{siteSettings.portalName}</span>
            </span>
            <span className="text-gray-600 hidden xs:inline">|</span>
            <a 
              href={`tel:${siteSettings.helplinePhone}`}
              className="hidden xs:flex items-center gap-1 text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors text-[11px] sm:text-xs shrink-0"
            >
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{siteSettings.helplinePhone}</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-gray-300 shrink-0">
            <button 
              onClick={() => handleNavClick('valuation')} 
              className="hover:text-white flex items-center gap-1 text-red-400 font-medium transition-colors cursor-pointer py-0.5 text-[11px] sm:text-xs"
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Price Estimator</span>
              <span className="sm:hidden">Estimator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer shrink-0"
            >
              <div className="relative shrink-0">
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
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-xs group-hover:scale-105 transition-transform border border-red-500/30 shrink-0 bg-white"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm md:text-base tracking-tight text-gray-900 group-hover:text-red-600 transition-colors leading-tight truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
                  {siteSettings.portalName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium hidden md:inline -mt-0.5 truncate max-w-[180px]">
                  {siteSettings.tagline || 'Official Property Portal'}
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop xl+) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleNavClick('listings', 'Buy')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeView === 'listings' ? 'text-red-600 bg-red-50 font-semibold' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Rent')}
              className="px-3 py-2 text-xs xl:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Rent
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Commercial')}
              className="px-3 py-2 text-xs xl:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Commercial
            </button>
            <button
              onClick={() => handleNavClick('listings', 'New Projects')}
              className="px-3 py-2 text-xs xl:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>New Projects</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
            {/* Wishlist Icon */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="relative p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Saved Properties"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* User Dashboard (lg+) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                activeView === 'dashboard'
                  ? 'border-red-600 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-gray-500" />
              <span>Dashboard</span>
            </button>

            {/* Direct Helpline Call CTA */}
            <a
              href={`tel:${siteSettings.helplinePhone}`}
              className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs shrink-0"
              title="Call Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Call Us</span>
            </a>

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-gray-900 xl:hidden rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Mobile Direct Phone & WhatsApp Call Card */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                Official Broker Helpline
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                Direct
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+919772117575"
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>Call 9772117575</span>
              </a>
              <a
                href="https://wa.me/919772117575?text=Hello%20Jaipur%20Properties%20Hub"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-3 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl min-h-[44px] flex items-center"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Buy')}
              className="text-left py-3 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl min-h-[44px] flex items-center"
            >
              Buy Properties
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Rent')}
              className="text-left py-3 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl min-h-[44px] flex items-center"
            >
              Rent Flat & Villas
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Commercial')}
              className="text-left py-3 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl min-h-[44px] flex items-center"
            >
              Commercial Workspaces
            </button>
            <button
              onClick={() => handleNavClick('valuation')}
              className="text-left py-3 px-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl min-h-[44px] flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-red-600 shrink-0" />
              <span>Valuation & Price Estimator</span>
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-left py-3 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-xl min-h-[44px] flex items-center justify-between"
            >
              <span>My Dashboard & Inquiries</span>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {wishlistIds.length} Saved
              </span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
};

