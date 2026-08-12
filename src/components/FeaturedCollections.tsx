import React from 'react';
import { useApp } from '../context/AppContext';
import { TOP_LOCALITIES } from '../data/mockData';
import { PropertyCard } from './PropertyCard';
import { Property } from '../types';
import { Sparkles, TrendingUp, Building2, ShieldCheck, ArrowRight, Home, MapPin } from 'lucide-react';

interface FeaturedCollectionsProps {
  onContactClick: (property: Property) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ onContactClick }) => {
  const { properties, selectedCity, setFilters, setActiveView } = useApp();

  // Filter collections
  const ownerProperties = properties.filter(p => p.postedBy === 'Owner').slice(0, 3);
  const budgetHomes = properties.filter(p => p.price <= 15000000).slice(0, 3);
  const newProjects = properties.filter(p => p.listingType === 'New Projects' || p.constructionStatus === 'Under Construction').slice(0, 3);

  const handleLocalityClick = (localityName: string) => {
    setFilters(prev => ({
      ...prev,
      city: selectedCity,
      locality: localityName,
      searchQuery: localityName
    }));
    setActiveView('listings');
  };

  const handleViewAllCategory = (listingType?: string, postedBy?: string, maxPrice?: number) => {
    setFilters(prev => ({
      ...prev,
      listingType: (listingType as any) || 'Buy',
      postedBy: postedBy ? [postedBy as any] : [],
      maxPrice: maxPrice || 100000000
    }));
    setActiveView('listings');
  };

  return (
    <div className="py-12 bg-gray-50/80 space-y-16">
      
      {/* Collection 1: Popular Owner Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-red-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Zero Brokerage Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Popular Owner Properties in {selectedCity}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Direct deals posted by verified property owners. Save lakhs on brokerage.
            </p>
          </div>

          <button
            onClick={() => handleViewAllCategory('Buy', 'Owner')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer group"
          >
            <span>View All Owner Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerProperties.map(property => (
            <PropertyCard key={property.id} property={property} onContactClick={onContactClick} />
          ))}
        </div>
      </section>

      {/* Collection 2: Top Localities to Invest */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                Capital Growth Hubs
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Top Localities with High Returns
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Fastest-growing neighborhoods with strong capital appreciation & rental yields.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_LOCALITIES.map(loc => (
              <div
                key={loc.id}
                onClick={() => handleLocalityClick(loc.name)}
                className="group bg-slate-800/90 rounded-2xl border border-slate-700/80 hover:border-red-500/80 p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl"
              >
                <div>
                  <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-slate-950">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      {loc.priceGrowthYr}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      {loc.name}
                    </h3>
                    <span className="text-xs text-slate-400">{loc.city}</span>
                  </div>

                  <div className="text-xs font-semibold text-amber-400 mb-2">
                    Avg Rate: ₹{loc.avgPriceSqFt.toLocaleString()}/sq.ft
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {loc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-red-400 font-bold group-hover:text-red-300">
                  <span>Explore Properties</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection 3: Budget Homes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Home className="w-4 h-4" />
              Affordable Living
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Budget Homes Under ₹1.5 Crore
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              High value homes designed for first-time buyers and smart investors.
            </p>
          </div>

          <button
            onClick={() => handleViewAllCategory('Buy', undefined, 15000000)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer group"
          >
            <span>Explore Budget Homes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetHomes.map(property => (
            <PropertyCard key={property.id} property={property} onContactClick={onContactClick} />
          ))}
        </div>
      </section>

      {/* Collection 4: New Project Launches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              Pre-Launch Offers
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              New Builder Projects & Townships
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upcoming luxury residential developments from premier builders with easy payment plans.
            </p>
          </div>

          <button
            onClick={() => handleViewAllCategory('New Projects')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer group"
          >
            <span>View All New Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newProjects.map(property => (
            <PropertyCard key={property.id} property={property} onContactClick={onContactClick} />
          ))}
        </div>
      </section>

    </div>
  );
};
