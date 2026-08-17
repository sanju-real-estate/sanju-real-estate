import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Heart, PlusCircle, UserCheck, ChevronDown, Search, Menu, X, Calculator, Phone, ShieldCheck } from 'lucide-react';
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
    showToast,
    siteSettings
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

  const handleNavClick = (view: 'home' | 'listings' | 'post-property' | 'dashboard' | 'valuation' | 'admin', listingType?: string) => {
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
              <span className="truncate">{siteSettings.portalName}</span>
            </span>
            <span className="text-gray-500">|</span>
            <a 
              href={`tel:${siteSettings.helplinePhone}`}
              className="flex items-center gap-1 text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors text-[11px] sm:text-xs shrink-0"
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
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="hover:text-white flex items-center gap-1 text-amber-400 font-bold transition-colors cursor-pointer py-0.5 text-[11px] sm:text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
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
                <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-gray-900 group-hover:text-red-600 transition-colors leading-tight truncate max-w-[130px] sm:max-w-[180px] md:max-w-[240px]">
                  {siteSettings.portalName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium hidden md:inline -mt-0.5 truncate max-w-[160px]">
                  {siteSettings.tagline || 'Official Property Portal'}
                </span>
              </div>
            </button>

            {/* City Dropdown Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-700 hover:text-red-600 bg-gray-50 hover:bg-red-50/50 border border-gray-200 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0"
              >
                <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[100px]">{selectedCity}</span>
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
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

            {/* Post Property FREE Button */}
            <button
              onClick={() => handleNavClick('post-property')}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Post Property Free - Sell or Rent"
            >
              <PlusCircle className="w-4 h-4 text-white shrink-0" />
              <span className="inline font-extrabold">Post Property</span>
              <span className="bg-emerald-800 text-emerald-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                FREE
              </span>
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

            {/* Admin Panel Button (Always Prominent) */}
            <button
              onClick={() => handleNavClick('admin')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Admin Panel & Site Settings"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Admin Panel</span>
            </button>

            {/* Auth Button or User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white pl-2 pr-1.5 py-1 rounded-xl text-xs font-bold shadow-xs shrink-0 border border-slate-800">
                <div className="flex items-center gap-1.5 max-w-[120px] sm:max-w-[150px] truncate">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-emerald-400/60"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate text-[11px] sm:text-xs font-bold text-gray-200">{currentUser.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer shrink-0 hover:ring-2 hover:ring-red-500/30"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Login</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-gray-900 xl:hidden rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
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
              onClick={() => handleNavClick('post-property')}
              className="text-left py-3 px-3.5 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl min-h-[44px] flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-white shrink-0" />
                <span>Post Property FREE</span>
              </div>
              <span className="text-[10px] bg-emerald-800 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                Zero Fee
              </span>
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="text-left py-3 px-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl min-h-[44px] flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white shrink-0" />
                <span>Admin Panel Login</span>
              </div>
              <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full">
                Admin
              </span>
            </button>
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
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">Logged In (Google Sync)</p>
                    <p className="text-xs font-extrabold truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shrink-0 ml-2"
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
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google Login</span>
                </button>
                <button
                  onClick={() => {
                    handleNavClick('admin');
                  }}
                  className="bg-red-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Admin Panel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

