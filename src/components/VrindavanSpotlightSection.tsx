import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Maximize2, 
  MessageCircle, 
  X,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';

interface GalleryPhoto {
  src: string;
  title: string;
  desc: string;
  tag: string;
}

export const VrindavanSpotlightSection: React.FC = () => {
  const { setActiveView } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<GalleryPhoto | null>(null);

  const officialPhone = '9772117575';
  const whatsappUrl = `https://wa.me/91${officialPhone}?text=${encodeURIComponent(
    'Namaste! I want details about Vrindavan City JDA Approved residential plots on Main Jaipur-Sikar Highway (Launch Rate: ₹55,900/sq.yd). Please share brochure and available plot numbers.'
  )}`;

  const photos: GalleryPhoto[] = [
    {
      src: '/images/vrindavan/hero-gate-entrance.jpg',
      title: 'Grand Gated Royal Entrance Arch',
      desc: 'Iconic monumental entrance gate with Rajasthani chhatris, 24/7 boom barrier & security check post.',
      tag: 'Grand Entrance'
    },
    {
      src: '/images/vrindavan/gate-entrance-angle2.jpg',
      title: 'Direct Main Highway Access',
      desc: 'Wide entrance boulevard directly connecting to Main Jaipur-Sikar Express Highway & Jhunjhunu Bypass.',
      tag: 'Highway Entry'
    },
    {
      src: '/images/vrindavan/satellite-map-layout.jpg',
      title: 'Official Master Layout & Satellite Map',
      desc: 'Complete JDA approved town planning with 125ft, 60ft, 30ft & 25ft internal sector roads.',
      tag: 'Master Plan'
    },
    {
      src: '/images/vrindavan/avika-brochure-poster.jpg',
      title: 'Official Project Brochure & Rate Card',
      desc: 'Avika Colonizers verified launch brochure with plot dimensions, payment schedules and bank approvals.',
      tag: 'Rate Card'
    },
    {
      src: '/images/vrindavan/sikar-road-poster.jpg',
      title: 'Sikar Road Location & Landmarks',
      desc: 'Opposite Annapoorna Highway Treats, near City Escape, Jaipur-Sikar Highway.',
      tag: 'Location Poster'
    }
  ];

  const activePhoto = photos[activePhotoIdx];

  return (
    <section className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white py-14 sm:py-20 border-y border-amber-500/30 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button 
            type="button"
            aria-label="Close Preview"
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-amber-500/40 shadow-2xl bg-black"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={lightboxImg.src} 
              alt={lightboxImg.title}
              className="w-full h-full object-contain max-h-[75vh]" 
            />
            <div className="bg-slate-950/95 text-amber-300 text-xs sm:text-sm font-semibold p-3 text-center border-t border-amber-500/30">
              <span className="font-bold text-white mr-2">{lightboxImg.title}:</span>
              {lightboxImg.desc}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Featured Gated Township • Direct Developer Booking</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            VRINDAVAN CITY <span className="text-amber-400">JAIPUR</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Premium <strong className="text-amber-300">JDA Approved & RERA Registered</strong> Gated Residential Township by <strong className="text-white">Avika Colonizers & Developers</strong> on Main Jaipur-Sikar Express Highway.
          </p>

          {/* Quick Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs">
            <span className="bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Launch Price: ₹55,900 / Sq. Yard
            </span>
            <span className="bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Up to 80% Bank Loan
            </span>
            <span className="bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Zero Brokerage Direct Deal
            </span>
          </div>
        </div>

        {/* 2-Column Showcase: Interactive Photos on Left + Key Township Features on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Image Viewer (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Featured Photo Box */}
            <div 
              onClick={() => setLightboxImg(activePhoto)}
              className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl group cursor-pointer bg-slate-950"
            >
              <img 
                src={activePhoto.src} 
                alt={activePhoto.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activePhoto.tag}</span>
              </div>

              {/* Expand Hint */}
              <div className="absolute top-3 right-3 bg-black/60 text-white hover:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 border border-white/20">
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Click to Zoom</span>
              </div>

              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-amber-300 font-serif">
                  {activePhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                  {activePhoto.desc}
                </p>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx 
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-102' 
                      : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  <img 
                    src={p.src} 
                    alt={p.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 inset-x-0 text-[9px] font-bold text-center text-white bg-black/70 px-0.5 truncate">
                    {p.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Project Highlights & Booking CTAs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Township Fast Facts
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Everything You Need for High-ROI Living
              </h3>
            </div>

            {/* Feature List */}
            <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Plot Sizes:</strong> 51, 75, 100, 125, 150, 200, 250 Gaj ready demarcated plots.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Wide Road Grid:</strong> 25 ft, 30 ft, 60 ft and 125 ft wide sector roads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Infrastructure:</strong> Underground electrical cabling, LED street lights, sweet potable water line & sewage network.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Lifestyle:</strong> Grand temple, landscaped kids park, community gazebo & gated security.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Prime Location:</strong> Mothu ka bas, Main Sikar Road & Jhunjhunu Bypass (Opp. Annapoorna Highway Treats).</span>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveView('vrindavan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>View Complete Township Details & Plots</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:+91${officialPhone}`}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Call {officialPhone}</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Brochure</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
