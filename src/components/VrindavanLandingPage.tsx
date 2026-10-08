import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Download, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Trees, 
  Zap, 
  Droplets, 
  Building2, 
  Award, 
  Maximize2, 
  Eye, 
  Calculator, 
  Clock, 
  Car, 
  Compass, 
  FileText, 
  Send,
  MessageCircle,
  X,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VrindavanLandingPage: React.FC = () => {
  const { addInquiry, siteSettings, setActiveView } = useApp();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plotSize: '100 Gaj',
    visitDate: '',
    message: 'Interested in Vrindavan City residential plots at ₹55,900/sq.yd. Please share brochure and schedule site visit.'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plot Calculator State
  const [selectedGaj, setSelectedGaj] = useState<number>(100);
  const [includePlc, setIncludePlc] = useState<boolean>(false);

  // Gallery Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<{ src: string; caption: string } | null>(null);

  const pricePerGaj = 55900;
  const baseCost = selectedGaj * pricePerGaj;
  const plcCost = includePlc ? Math.round(baseCost * 0.05) : 0;
  const totalCost = baseCost + plcCost;
  const maxLoan = Math.round(totalCost * 0.80);
  const downPayment = totalCost - maxLoan;

  const plotSizes = [51, 75, 100, 125, 150, 200, 250];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setIsSubmitting(true);
    try {
      addInquiry({
        propertyId: 'vrindavan-city',
        propertyTitle: 'Vrindavan City - Sikar Road (Avika Colonizers)',
        userName: formData.name,
        userEmail: formData.email || 'not-provided@client.com',
        userPhone: formData.phone,
        userType: 'Buyer',
        message: `Plot Size: ${formData.plotSize}. ${formData.message}`,
        scheduleVisitDate: formData.visitDate
      });
      setFormSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBrochure = () => {
    // Scroll to form or trigger brochure image in lightbox
    setLightboxImage({
      src: '/images/vrindavan/avika-brochure-poster.jpg',
      caption: 'Vrindavan City - Official Project Brochure & Rate Card'
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const officialPhone = '9772117575';
  const whatsappUrl = `https://wa.me/91${officialPhone}?text=${encodeURIComponent(
    'Namaste Avika Colonizers! I want more details about "Vrindavan City" residential plots on Main Jaipur-Sikar Express Highway (Launch Price ₹55,900/- per Sq. Yard). Please share brochure and available plot numbers.'
  )}`;

  return (
    <div className="bg-[#fcfcf9] text-gray-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            type="button"
            aria-label="Close Preview"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>
          <div 
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl bg-black"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={lightboxImage.src} 
              alt={lightboxImage.caption}
              className="w-full h-full object-contain max-h-[80vh]" 
            />
            <div className="bg-slate-900/90 text-amber-300 text-xs sm:text-sm font-semibold p-3 text-center border-t border-amber-500/20">
              {lightboxImage.caption}
            </div>
          </div>
        </div>
      )}

      {/* Township Sub-Navigation Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#022c22]/95 backdrop-blur-md border-b border-amber-500/30 text-amber-300 py-2.5 px-3 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-white text-xs sm:text-sm font-serif tracking-wide">
              VRINDAVAN CITY
            </span>
            <span className="bg-amber-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
              JDA APPROVED
            </span>
            <span className="hidden md:inline text-xs text-gray-300">
              • Sikar Road Highway Plots @ ₹55,900/sq.yd
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs font-semibold">
            <button 
              type="button"
              onClick={() => scrollToSection('highlights')} 
              className="text-gray-200 hover:text-amber-300 transition-colors py-1 px-1.5 cursor-pointer whitespace-nowrap"
            >
              Highlights
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('pricing')} 
              className="text-gray-200 hover:text-amber-300 transition-colors py-1 px-1.5 cursor-pointer whitespace-nowrap"
            >
              Plot Rates
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('amenities')} 
              className="text-gray-200 hover:text-amber-300 transition-colors py-1 px-1.5 cursor-pointer whitespace-nowrap"
            >
              Amenities
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('location')} 
              className="text-gray-200 hover:text-amber-300 transition-colors py-1 px-1.5 cursor-pointer whitespace-nowrap"
            >
              Location
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('gallery')} 
              className="text-gray-200 hover:text-amber-300 transition-colors py-1 px-1.5 cursor-pointer whitespace-nowrap"
            >
              Real Photos
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('lead-form')} 
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-3 py-1 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION (First Impression & Hook) */}
      <section className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Real Entrance Gate Background Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/vrindavan/hero-gate-entrance.jpg" 
            alt="Vrindavan City Grand Entrance Gate with Traditional Guard Towers" 
            className="w-full h-full object-cover object-center filter scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          {/* Deep Green & Gold Luxury Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/85 to-[#022c22]/70 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#022c22]/50 to-[#022c22]/90" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          
          {/* Developer Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 backdrop-blur-md px-4 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-lg animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Avika Colonizers & Developers Presents</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-serif tracking-tight drop-shadow-md leading-[1.1] mb-4">
            VRINDAVAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">CITY</span>
          </h1>

          {/* Sub-Headline & Taglines */}
          <div className="space-y-2 mb-6 max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-200 tracking-wide font-serif">
              A Premium Gated Township
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-emerald-200 text-sm sm:text-base font-medium">
              <span>"A Better Tomorrow Begins Here..."</span>
              <span className="hidden sm:inline text-amber-400">•</span>
              <span>"Invest Today, Build Your Tomorrow"</span>
            </div>
            {/* Hindi Cultural Tagline from Creative */}
            <p className="text-amber-100/90 text-sm sm:text-base italic font-serif bg-emerald-950/60 border border-amber-500/30 rounded-xl py-2 px-4 inline-block mt-2">
              “सही लोकेशन पर लिया गया आज का निर्णय, आपके कल का बेहतर भविष्य बनाता है”
            </p>
          </div>

          {/* Location Marker */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-gray-200 text-xs sm:text-sm font-medium mb-8 max-w-2xl mx-auto">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mothu ka bas, Main Jaipur-Sikar Express Highway & Jhunjhunu Bypass Road, Jaipur</span>
          </div>

          {/* Hero Standout Pricing Callout */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            <div className="bg-gradient-to-b from-amber-500/20 to-emerald-950/80 border-2 border-amber-400/80 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-md">
              <span className="text-[11px] font-extrabold tracking-widest text-amber-300 uppercase block">
                Exclusive Launch Price
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white font-serif">
                ₹55,900<span className="text-base sm:text-lg font-normal text-amber-300"> / Sq. Yard</span>
              </span>
            </div>

            <div className="bg-black/40 border border-white/20 rounded-2xl px-6 py-3 backdrop-blur-md text-left">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                Plot Sizes Available
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">
                51, 75, 100, 125, 150 <span className="text-sm font-normal text-gray-300">to 250 Gaj</span>
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <button 
              onClick={() => scrollToSection('lead-form')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Calendar className="w-5 h-5 text-emerald-950" />
              <span>Book a Free Site Visit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleDownloadBrochure}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold text-sm sm:text-base px-7 py-4 rounded-2xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5 text-amber-300" />
              <span>Download Brochure</span>
            </button>

            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </section>

      {/* 2. KEY HIGHLIGHTS BAR (Floating/Sticky Trust Signals) */}
      <section id="highlights" className="relative -mt-8 z-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-amber-200/90 shadow-2xl p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          
          {/* Trust 1: JDA Approved */}
          <div className="flex items-center gap-3.5 p-2 sm:p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-[#064e3b]">
                JDA Approved
              </span>
              <span className="text-[11px] text-gray-500 font-medium leading-tight block">
                100% Legally Verified Layout
              </span>
            </div>
          </div>

          {/* Trust 2: RERA Registered */}
          <div className="flex items-center gap-3.5 p-2 sm:p-3 pt-4 lg:pt-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-amber-900">
                RERA Registered
              </span>
              <span className="text-[11px] text-gray-500 font-medium leading-tight block">
                Full Govt Compliance & Clear Title
              </span>
            </div>
          </div>

          {/* Trust 3: Up to 80% Loanable */}
          <div className="flex items-center gap-3.5 p-2 sm:p-3 pt-4 lg:pt-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-blue-950">
                Up to 80% Loanable
              </span>
              <span className="text-[11px] text-gray-500 font-medium leading-tight block">
                Easy Bank Financing Options
              </span>
            </div>
          </div>

          {/* Trust 4: Zero Brokerage */}
          <div className="flex items-center gap-3.5 p-2 sm:p-3 pt-4 lg:pt-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-[#064e3b]">
                Zero Brokerage
              </span>
              <span className="text-[11px] text-gray-500 font-medium leading-tight block">
                Direct From Avika Colonizers
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PRICING & PLOT DETAILS SECTION */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#064e3b] bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full inline-block mb-3">
            Transparent Pricing & Unit Variants
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 font-serif">
            Choose Your Ideal Residential Plot
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Premium JDA residential plots designed for independent villa construction and high-yield capital investment on Sikar Road.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Main Launch Pricing & Offer Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-amber-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

            <div className="inline-block bg-amber-400 text-[#022c22] text-[11px] font-black uppercase px-3 py-1 rounded-lg tracking-wider mb-4 shadow">
              Official Launch Rate
            </div>

            <div className="mb-6">
              <div className="text-gray-200 text-xs font-semibold tracking-wider uppercase">
                Base Selling Price
              </div>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 font-serif mt-1">
                ₹55,900
                <span className="text-lg text-white font-medium"> / Sq. Yard</span>
              </div>
              <div className="text-xs text-emerald-200 mt-1">
                (per Gaj • All Govt JDA Compliant Clear Title)
              </div>
            </div>

            {/* Special Offer Box from Prompt */}
            <div className="bg-amber-400/10 border-2 border-amber-400/60 rounded-2xl p-4.5 mb-6 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Special PLC Offer</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-100 font-medium">
                <strong>5% PLC</strong> on 60 ft road and corner plots. Prime locations available on first-come-first-serve basis!
              </p>
            </div>

            {/* Road Connectivity Highlights */}
            <div className="space-y-3 pt-2 border-t border-emerald-600/60">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                <span>Planned Road Infrastructure</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
                  <span className="text-amber-300 font-bold block text-sm">125 Ft</span>
                  <span className="text-gray-300 text-[11px]">Connecting Main Road</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
                  <span className="text-amber-300 font-bold block text-sm">60 Ft</span>
                  <span className="text-gray-300 text-[11px]">Sector Arterial Road</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
                  <span className="text-amber-300 font-bold block text-sm">30 Ft</span>
                  <span className="text-gray-300 text-[11px]">Internal Colony Road</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
                  <span className="text-amber-300 font-bold block text-sm">25 Ft</span>
                  <span className="text-gray-300 text-[11px]">Wide Interblock Street</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => scrollToSection('lead-form')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer text-center block"
              >
                Inquire For Available Plot Numbers
              </button>
            </div>
          </div>

          {/* Right: Interactive Plot Size Calculator (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                  Interactive Plot Cost Estimator
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Select your desired plot size to calculate estimated price and bank loan eligibility.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5 text-amber-700" />
              </div>
            </div>

            {/* Plot Size Buttons */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Select Plot Size (in Gaj / Sq. Yards):
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {plotSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedGaj(size)}
                    className={`py-3 px-2 rounded-xl text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      selectedGaj === size
                        ? 'bg-[#064e3b] text-amber-300 shadow-md scale-105 border-2 border-amber-400'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block font-black">{size}</span>
                    <span className="text-[10px] opacity-80">Gaj</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PLC Checkbox */}
            <div className="mb-8 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="plcCheck"
                  checked={includePlc}
                  onChange={(e) => setIncludePlc(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="plcCheck" className="text-xs sm:text-sm text-gray-800 font-semibold cursor-pointer">
                  Prefer Corner Plot or 60 Ft Road (+5% PLC)
                </label>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                +₹{plcCost.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Cost Breakdown Grid */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Plot Dimensions</span>
                <span className="font-bold text-gray-900">{selectedGaj} Gaj ({selectedGaj * 9} Sq. Feet)</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Base Cost (at ₹55,900/Gaj)</span>
                <span className="font-bold text-gray-900">₹{baseCost.toLocaleString('en-IN')}</span>
              </div>
              {includePlc && (
                <div className="flex items-center justify-between text-xs sm:text-sm text-amber-800 font-medium">
                  <span>5% Road/Corner PLC</span>
                  <span>+₹{plcCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-[#064e3b]">
                    Total Estimated Price
                  </span>
                  <span className="text-xs text-gray-500">Zero Brokerage direct deal</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#064e3b] font-serif">
                  ₹{totalCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Bank Loan Estimates */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  Eligible Bank Loan (Up to 80%)
                </span>
                <span className="text-lg font-black text-emerald-900 font-serif">
                  ≈ ₹{maxLoan.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">
                  Down Payment (approx 20%)
                </span>
                <span className="text-lg font-black text-amber-900 font-serif">
                  ≈ ₹{downPayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, plotSize: `${selectedGaj} Gaj` }));
                scrollToSection('lead-form');
              }}
              className="w-full bg-[#064e3b] hover:bg-[#047857] text-amber-300 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <span>Book Site Visit for {selectedGaj} Gaj Plot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </section>

      {/* 4. PREMIUM FACILITIES & AMENITIES (Grid Layout with Icons) */}
      <section id="amenities" className="py-20 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 border border-amber-400/40 px-3.5 py-1 rounded-full inline-block mb-3">
              Modern Infrastructure & Lifestyle
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-white">
              World-Class Facilities & Amenities
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 mt-3">
              Designed with a sustainable ecological balance ("Live Green, Live Happy"), modern underground utilities, and round-the-clock security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Amenity 1: Secure Gated Township */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Secure Gated Township
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Grand royal Rajasthani entrance gate with boom barriers, 24x7 security guard cabins, and complete boundary wall security.
              </p>
            </div>

            {/* Amenity 2: Underground Electricity & Water Facility */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Underground Electricity & Water
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Modern wire-free aesthetics with underground electrical cables, robust transformer setups, and dedicated 24x7 potable water connection pipeline.
              </p>
            </div>

            {/* Amenity 3: Sewerage Line & Drainage */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Droplets className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Underground Sewerage Line
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Standard government approved underground sewerage system and storm-water drainage for a clean, hygienic, and eco-friendly township.
              </p>
            </div>

            {/* Amenity 4: Wide Interblocks Roads */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Car className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Wide Interblock Paver Roads
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Well-engineered heavy-duty paver block roads ranging from 25 ft, 30 ft, 60 ft, up to 125 ft wide connecting road networks with roadside tree lines.
              </p>
            </div>

            {/* Amenity 5: Kids Play Area & Green Environment */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trees className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Kids Play Area & Green Parks
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Lush green landscaped central parks, walking tracks, safe dedicated kids play zone with swings, and "Live Green, Live Happy" eco ambience.
              </p>
            </div>

            {/* Amenity 6: Block Boundary & Temple */}
            <div className="bg-white/10 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                Block Boundary & Temple
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Distinct plot and block boundary demarcation, community temple space for spiritual well-being, and dedicated street light fixtures.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. LOCATION ADVANTAGE & SATELLITE MAP SECTION */}
      <section id="location" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#064e3b] bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full inline-block">
              Prime Strategic Location
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-serif">
              Unmatched Highway Connectivity & High Growth Belt
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Situated directly on the thriving growth corridor of Sikar Road & Jhunjhunu Bypass. Surrounded by established resorts, educational hubs, and industrial developments.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Main Jaipur - Sikar Express Highway</span>
                  <span className="text-xs text-gray-500">Fast express transit with direct road approach to Jaipur city center and Ring Road</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Jaipur - Jhunjhunu Bypass Road</span>
                  <span className="text-xs text-gray-500">Dual highway connectivity giving phenomenal commercial & residential appreciation</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Near Landmark Resorts & Hubs</span>
                  <span className="text-xs text-gray-500">Opposite Annapoorna Highway Treats, near City Escape & Friends Farm House</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">GPS Coordinates</span>
                  <span className="text-xs text-gray-500 font-mono">27°04'54.7"N 75°44'50.0"E (Mothu ka bas, Jaipur)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="https://www.google.com/maps?q=27.081867,75.747329" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#047857] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>Open in Google Maps</span>
              </a>

              <button
                onClick={() => setLightboxImage({
                  src: '/images/vrindavan/satellite-map-layout.jpg',
                  caption: 'Vrindavan City - Google Satellite Aerial View & Red Township Boundary'
                })}
                className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-amber-700" />
                <span>View Satellite Boundary</span>
              </button>
            </div>
          </div>

          {/* Right Satellite Map Image Card (7 cols) */}
          <div className="lg:col-span-7">
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/satellite-map-layout.jpg',
                caption: 'Vrindavan City Township Boundary on Jaipur-Jhunjhunu Bypass / Sikar Road'
              })}
              className="group relative rounded-3xl overflow-hidden border-2 border-emerald-800 shadow-2xl cursor-pointer bg-slate-900"
            >
              <img 
                src="/images/vrindavan/satellite-map-layout.jpg" 
                alt="Vrindavan City Satellite Boundary on Google Maps" 
                className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <div className="absolute top-4 left-4 bg-emerald-900/90 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>Township Site Boundary (Red Outline)</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-lg flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900 block">
                    Actual Satellite Aerial Survey
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Fronting Jaipur-Jhunjhunu Bypass Road, Sikar Road corridor
                  </span>
                </div>
                <span className="bg-[#064e3b] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enlarge</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. PROJECT PHOTO & CREATIVE GALLERY */}
      <section id="gallery" className="py-20 bg-gray-100 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#064e3b] bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full inline-block mb-3">
              Real Site Media & Creatives
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 font-serif">
              Project Visual Showcase
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Browse actual photographs of the grand royal entrance gate, aerial boundary survey, and official developer creatives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Image 1: Main Grand Entrance Gate */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/hero-gate-entrance.jpg',
                caption: 'Vrindavan City - Grand Entrance Gate with Traditional Guard Towers & Landscaping'
              })}
              className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="/images/vrindavan/hero-gate-entrance.jpg" 
                  alt="Vrindavan City Entrance Gate Front View"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider block">
                  Grand Entrance Gate
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Yellow Guard Towers & Rajasthani Chhatris
                </p>
              </div>
            </div>

            {/* Image 2: Gate Entrance Angle 2 */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/gate-entrance-angle2.jpg',
                caption: 'Vrindavan City - Royal Archway and Paver Roads'
              })}
              className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="/images/vrindavan/gate-entrance-angle2.jpg" 
                  alt="Vrindavan City Royal Entrance Side Angle"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider block">
                  Township Architecture
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Lush Greenery & Broad Entry Corridor
                </p>
              </div>
            </div>

            {/* Image 3: Official Brochure Poster */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/avika-brochure-poster.jpg',
                caption: 'Avika Colonizers & Developers - Vrindavan City Official Brochure & Rate Card'
              })}
              className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="/images/vrindavan/avika-brochure-poster.jpg" 
                  alt="Avika Colonizers Vrindavan City Official Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider block">
                  Official Rate Card & Poster
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  ₹55,900/- Launch Price & 5% PLC Details
                </p>
              </div>
            </div>

            {/* Image 4: Highway Connectivity Poster */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/sikar-road-poster.jpg',
                caption: 'Vrindavan City - Sikar Road Prime Location Poster'
              })}
              className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="/images/vrindavan/sikar-road-poster.jpg" 
                  alt="Vrindavan City Sikar Road Jaipur Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider block">
                  Highway Connect Creative
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Jaipur-Jhunjhunu Bypass Road Linkage
                </p>
              </div>
            </div>

            {/* Image 5: Satellite Aerial Boundary Map */}
            <div 
              onClick={() => setLightboxImage({
                src: '/images/vrindavan/satellite-map-layout.jpg',
                caption: 'Vrindavan City - Satellite Boundary Map on Google Maps'
              })}
              className="group relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="/images/vrindavan/satellite-map-layout.jpg" 
                  alt="Google Maps Satellite Layout"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider block">
                  Satellite Layout Plan
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Actual Perimeter & Internal Road Cuts
                </p>
              </div>
            </div>

            {/* Video / Virtual Tour Card */}
            <div 
              onClick={() => scrollToSection('lead-form')}
              className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#064e3b] to-[#022c22] p-6 text-white flex flex-col justify-between shadow-md hover:shadow-2xl transition-all border-2 border-amber-400/50"
            >
              <div>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-3">
                  Drone & Site Video
                </span>
                <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                  Request Exclusive Drone Walkthrough Video
                </h3>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Get high-definition drone footage of the entrance gate, 125 ft road approach, and internal plots directly on your WhatsApp.
                </p>
              </div>
              <div className="pt-6">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Get Video on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. LEAD GENERATION FORM (The Conversion Engine) */}
      <section id="lead-form" className="py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-white via-amber-50/30 to-emerald-50/40 rounded-3xl border-2 border-amber-300 shadow-2xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full inline-block mb-3">
              Direct Developer Desk • Zero Brokerage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-serif">
              Interested? Get More Details
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Fill the quick form below to download the master plan, get available plot numbers, and arrange a free VIP cab pickup for your site visit.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center max-w-xl mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[#064e3b] font-serif">
                Thank You, {formData.name}!
              </h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                Your inquiry for <strong>{formData.plotSize}</strong> plot at <strong>Vrindavan City</strong> has been received by Avika Colonizers. Our project manager will contact you within 15 minutes.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp Instantly</span>
                </a>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-gray-500 underline hover:text-gray-900"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5 max-w-2xl mx-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number (WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 97721 17575"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Interested Plot Size
                  </label>
                  <select 
                    name="plotSize"
                    value={formData.plotSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white font-medium cursor-pointer"
                  >
                    <option value="51 Gaj">51 Gaj (approx 459 sq.ft)</option>
                    <option value="75 Gaj">75 Gaj (approx 675 sq.ft)</option>
                    <option value="100 Gaj">100 Gaj (approx 900 sq.ft)</option>
                    <option value="125 Gaj">125 Gaj (approx 1125 sq.ft)</option>
                    <option value="150 Gaj">150 Gaj (approx 1350 sq.ft)</option>
                    <option value="200 Gaj">200 Gaj (approx 1800 sq.ft)</option>
                    <option value="250 Gaj">250 Gaj (approx 2250 sq.ft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Preferred Date for Free Site Visit
                </label>
                <input 
                  type="date" 
                  name="visitDate" 
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Message or Specific Question
                </label>
                <textarea 
                  name="message" 
                  rows={2}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#064e3b] hover:from-[#047857] hover:to-[#064e3b] text-amber-300 border border-amber-400/50 font-black text-base py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Send className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                  <span>{isSubmitting ? 'Submitting Details...' : 'Submit & Book Free Site Visit'}</span>
                </button>
              </div>

              {/* Instant WhatsApp Quick Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-200 mt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Privacy Protected. No Spams. Direct Developer Response.</span>
                </div>

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-800 font-bold hover:underline"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                  <span>Or Chat Instantly on WhatsApp ({officialPhone})</span>
                </a>
              </div>

            </form>
          )}

        </div>
      </section>

      {/* Legal & Indicative Disclaimer Note */}
      <div className="bg-[#022c22] text-gray-400 py-6 px-4 text-center border-t border-amber-500/30 text-[11px] leading-relaxed">
        <div className="max-w-5xl mx-auto space-y-1">
          <p className="text-amber-300 font-semibold">
            Vrindavan City – Main Jaipur-Sikar Highway (Mothu ka bas) • JDA Approved & RERA Registered Township
          </p>
          <p className="text-gray-400 text-[10px]">
            Disclaimer: All visual representations, plot numbers, dimensions, and images are indicative artistic impressions and project site photographs. Buyers are advised to inspect government JDA/RERA registration records and documents before entering into any transaction.
          </p>
        </div>
      </div>

      {/* Floating Bottom Sticky Bar for Mobile Users */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 sm:hidden flex items-center justify-between gap-2 shadow-2xl">
        <a 
          href={`tel:+91${officialPhone}`}
          className="flex-1 bg-[#064e3b] text-amber-300 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <Phone className="w-3.5 h-3.5 text-amber-300" />
          <span>Call: {officialPhone}</span>
        </a>

        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </a>

        <button 
          onClick={() => scrollToSection('lead-form')}
          className="flex-1 bg-amber-400 text-emerald-950 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Visit</span>
        </button>
      </div>

    </div>
  );
};
