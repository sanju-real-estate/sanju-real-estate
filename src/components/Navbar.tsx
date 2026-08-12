import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Heart, PlusCircle, UserCheck, ChevronDown, Search, Menu, X, Calculator, Phone } from 'lucide-react';
import { INDIAN_CITIES } from '../data/cities';
import { APP_LOGO } from '../assets/logo';

export const Navbar: React.FC = () => {
  const { 
    selectedCity, 
    setSelectedCity, 
    activeView, 
    setActiveView, 
    wishlistIds, 
    setFilters,
    currentUser,
    openAuthModal,
    logout,
    showToast
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredCities = INDIAN_CITIES.filter(c => 
    c.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setFilters(prev => ({ ...prev, city }));
    setIsCityDropdownOpen(false);
    setCitySearchTerm('');
  };

  const handleNavClick = (view: 'home' | 'listings' | 'post-property' | 'dashboard' | 'valuation', listingType?: string) => {
    if (view === 'post-property' && !currentUser) {
      openAuthModal('signup');
      showToast('Please login or sign up first to post your property free!', 'info');
      return;
    }
    if (listingType) {
      setFilters(prev => ({ ...prev, listingType: listingType as any }));
    }
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs w-full">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-gray-300 text-xs py-1 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 truncate">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400 text-[11px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">Jaipur Properties Hub</span>
            </span>
            <span className="text-gray-500">|</span>
            <a 
              href="tel:+919772117575" 
              className="flex items-center gap-1 text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors text-[11px] sm:text-xs shrink-0"
            >
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>+91 97721 17575</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-gray-300 shrink-0">
            <button 
              onClick={() => handleNavClick('valuation')} 
              className="hover:text-white flex items-center gap-1 text-red-400 font-medium transition-colors cursor-pointer py-0.5 text-[11px] sm:text-xs"
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Price Estimator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-4">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer shrink-0"
            >
              <img 
                src={APP_LOGO} 
                alt="Jaipur Properties Logo" 
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform border border-gray-200 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-gray-900 group-hover:text-red-600 transition-colors leading-tight truncate max-w-[100px] xs:max-w-none">
                  Jaipur Properties
                </span>
                <span className="text-[10px] text-gray-500 font-medium hidden md:inline -mt-0.5">
                  Official Portal
                </span>
              </div>
            </button>

            {/* City Dropdown Selector */}
            <div className="relative shrink">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-700 hover:text-red-600 bg-gray-50 hover:bg-red-50/50 border border-gray-200 px-1.5 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer max-w-[85px] xs:max-w-none"
              >
                <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                <span className="truncate">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
              </button>

              {isCityDropdownOpen && (
                <>
                  {/* Backdrop overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                      setIsCityDropdownOpen(false);
                      setCitySearchTerm('');
                    }} 
                  />
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 max-h-80 overflow-hidden flex flex-col">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
                      Select City in India
                    </div>
                    {/* Search box inside dropdown */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
                        <input
                          type="text"
                          autoFocus
                          value={citySearchTerm}
                          onChange={(e) => setCitySearchTerm(e.target.value)}
                          placeholder="Search city..."
                          className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                    {/* Cities List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                      {filteredCities.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">No city found</div>
                      ) : (
                        filteredCities.map(city => (
                          <button
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-between cursor-pointer ${
                              selectedCity === city ? 'text-red-600 bg-red-50/70 font-bold' : 'text-gray-700'
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('listings', 'Buy')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeView === 'listings' ? 'text-red-600 bg-red-50 font-semibold' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Rent')}
              className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Rent
            </button>
            <button
              onClick={() => handleNavClick('listings', 'Commercial')}
              className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Commercial
            </button>
            <button
              onClick={() => handleNavClick('listings', 'New Projects')}
              className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>New Projects</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 ml-auto">
            {/* Broker Helpline Badge - Hidden on tiny mobile screens because top banner already shows phone number */}
            <a
              href="tel:+919772117575"
              className="hidden sm:flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs"
              title="Call Jaipur Properties Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
              <span className="inline text-[11px] sm:text-xs font-black">9772117575</span>
            </a>

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

            {/* User Dashboard (md+) */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                activeView === 'dashboard'
                  ? 'border-red-600 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-gray-500" />
              <span>Dashboard</span>
            </button>

            {/* Post Property FREE Banner CTA */}
            <button
              onClick={() => handleNavClick('post-property')}
              className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">Post FREE</span>
            </button>

            {/* Auth Button or User Profile */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[80px] truncate">{currentUser.name}</span>
                <button
                  onClick={logout}
                  className="text-[10px] text-gray-400 hover:text-red-400 ml-1 underline cursor-pointer"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="hidden sm:flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span>Login</span>
              </button>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-gray-900 lg:hidden rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
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

          {/* Mobile Auth Section */}
          <div className="pt-2 border-t border-gray-100">
            {currentUser ? (
              <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Logged in as</p>
                  <p className="text-xs font-extrabold">{currentUser.name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center cursor-pointer"
                >
                  Sign In (Login)
                </button>
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center cursor-pointer"
                >
                  Register Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

