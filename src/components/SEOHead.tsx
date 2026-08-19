import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { APP_LOGO } from '../assets/logo';

interface SEOHeadProps {
  property?: Property | null;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ property }) => {
  const { activeView, selectedCity, siteSettings } = useApp();

  useEffect(() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.eigentumspaces.com';
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const canonicalUrl = `${origin}${pathname === '/' ? '' : pathname}`;

      // Determine Page Metadata
      let title = `${siteSettings.portalName} | ${siteSettings.tagline}`;
      let description = siteSettings.seoDescription || `Explore verified properties in ${selectedCity}, Rajasthan. Buy, rent, or invest in premium flats, luxury villas, plots, and commercial spaces with zero brokerage and direct owner contact.`;
      let keywords = siteSettings.seoKeywords || `real estate ${selectedCity}, properties in ${selectedCity}, buy flat in ${selectedCity}, rent apartment ${selectedCity}, luxury villas, commercial shops, zero brokerage property`;
      let ogType = 'website';
      let ogImage = siteSettings.logoUrl || APP_LOGO;
      let breadcrumbs = [
        { name: 'Home', url: `${origin}/` }
      ];

      if (property && activeView === 'detail') {
        title = property.seoTitle || `${property.title} in ${property.locality}, ${property.city} | ${siteSettings.portalName}`;
        description = property.seoDescription || `${property.bedrooms ? `${property.bedrooms} BHK ` : ''}${property.propertyType} in ${property.locality}, ${property.city}. Price: ${property.priceDisplay}, Area: ${property.areaSqFt} sq.ft. ${property.description.slice(0, 120)}...`;
        keywords = property.seoKeywords || `${property.title}, ${property.locality} real estate, ${property.propertyType} in ${property.locality}, property for sale in ${property.city}`;
        ogType = 'article';
        ogImage = (property.images && property.images.length > 0) ? property.images[0] : (siteSettings.logoUrl || APP_LOGO);
        breadcrumbs.push(
          { name: property.listingType === 'Rent' ? 'Rent' : 'Buy', url: `${origin}/${property.listingType === 'Rent' ? 'rent' : 'buy'}` },
          { name: property.locality, url: `${origin}/listings?locality=${encodeURIComponent(property.locality)}` },
          { name: property.title, url: canonicalUrl }
        );
      } else if (activeView === 'listings') {
        title = `Verified Properties for Sale & Rent in ${selectedCity} | ${siteSettings.portalName}`;
        description = `Browse 100% verified flats, houses, villas, and commercial spaces in ${selectedCity}. Filter by locality, BHK, price, and amenities.`;
        breadcrumbs.push({ name: 'Properties', url: `${origin}/listings` });
      } else if (activeView === 'valuation') {
        title = `Free Property Valuation & EMI Calculator | ${siteSettings.portalName}`;
        description = `Calculate real-time property market rates, rental yield, stamp duty, and home loan EMIs in ${selectedCity} with instant AI valuation.`;
        breadcrumbs.push({ name: 'Price Estimator', url: `${origin}/valuation` });
      } else if (activeView === 'dashboard') {
        title = `My Dashboard & Saved Properties | ${siteSettings.portalName}`;
        description = `Manage your shortlisted properties, inquiries, and saved searches in ${siteSettings.portalName}.`;
        breadcrumbs.push({ name: 'Dashboard', url: `${origin}/dashboard` });
      }

      // Update Document Title
      document.title = title;

      // Helper function to update or create meta tags
      const setMetaTag = (attrName: string, attrVal: string, content: string) => {
        let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      // Helper function to update or create link tags
      const setLinkTag = (rel: string, href: string) => {
        let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('rel', rel);
          document.head.appendChild(el);
        }
        el.setAttribute('href', href);
      };

      // Set Standard SEO Meta Tags
      setMetaTag('name', 'description', description);
      setMetaTag('name', 'keywords', keywords);
      setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      setMetaTag('name', 'author', siteSettings.portalName || 'Eigentum Spaces');
      setMetaTag('name', 'publisher', siteSettings.portalName || 'Eigentum Spaces');
      setMetaTag('name', 'theme-color', '#dc2626');

      // Set Geo-Location Tags for Local SEO (Jaipur, Rajasthan, India)
      setMetaTag('name', 'geo.region', 'IN-RJ');
      setMetaTag('name', 'geo.placename', `${selectedCity}, Rajasthan`);
      setMetaTag('name', 'geo.position', '26.9124;75.7873');
      setMetaTag('name', 'ICBM', '26.9124, 75.7873');

      // Set Canonical Link
      setLinkTag('canonical', canonicalUrl);

      // Open Graph Tags
      setMetaTag('property', 'og:type', ogType);
      setMetaTag('property', 'og:url', canonicalUrl);
      setMetaTag('property', 'og:title', title);
      setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('property', 'og:site_name', siteSettings.portalName || 'Jaipur Properties Hub');
      setMetaTag('property', 'og:locale', 'en_IN');

      // Twitter Card Tags
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:url', canonicalUrl);
      setMetaTag('name', 'twitter:title', title);
      setMetaTag('name', 'twitter:description', description);
      setMetaTag('name', 'twitter:image', ogImage);
      setMetaTag('name', 'twitter:site', '@JaipurPropHub');

      // JSON-LD Schemas
      const schemas: any[] = [
        // 1. RealEstateAgent / Business Profile Schema
        {
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          'name': siteSettings.portalName || 'Jaipur Properties Hub',
          'alternateName': 'Eigentum Spaces',
          'url': origin,
          'logo': siteSettings.logoUrl || APP_LOGO,
          'image': ogImage,
          'description': siteSettings.seoDescription || description,
          'telephone': siteSettings.helplinePhone || '+91-9772117575',
          'email': siteSettings.helplineEmail || 'eigeltumspaces@gmail.com',
          'priceRange': '₹₹₹',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': siteSettings.officeAddress || 'Vaishali Nagar',
            'addressLocality': selectedCity || 'Jaipur',
            'addressRegion': 'Rajasthan',
            'postalCode': '302021',
            'addressCountry': 'IN'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': 26.9124,
            'longitude': 75.7873
          },
          'openingHoursSpecification': {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'opens': '09:00',
            'closes': '20:00'
          }
        },

        // 2. WebSite with SearchAction Schema
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': siteSettings.portalName || 'Jaipur Properties Hub',
          'url': origin,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${origin}/listings?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        },

        // 3. BreadcrumbList Schema
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url
          }))
        }
      ];

      // 4. Property Detail Specific Schema (SingleFamilyResidence / Apartment / RealEstateListing)
      if (property && activeView === 'detail') {
        const isApartment = property.propertyType === 'Apartment';
        schemas.push({
          '@context': 'https://schema.org',
          '@type': isApartment ? 'Apartment' : 'SingleFamilyResidence',
          'name': property.title,
          'description': property.description,
          'url': canonicalUrl,
          'image': property.images || [APP_LOGO],
          'numberOfBedrooms': property.bedrooms || 1,
          'numberOfBathroomsTotal': property.bathrooms || 1,
          'floorSize': {
            '@type': 'QuantitativeValue',
            'value': property.areaSqFt,
            'unitCode': 'FTK'
          },
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': property.address || property.locality,
            'addressLocality': property.locality,
            'addressRegion': property.city,
            'addressCountry': 'IN'
          },
          'offers': {
            '@type': 'Offer',
            'price': property.price,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
            'validFrom': property.postedDate || '2026-01-01',
            'priceSpecification': {
              '@type': 'PriceSpecification',
              'price': property.price,
              'priceCurrency': 'INR',
              'valueAddedTaxIncluded': true
            }
          },
          'amenityFeature': (property.amenities || []).map(a => ({
            '@type': 'LocationFeatureSpecification',
            'name': a,
            'value': true
          }))
        });
      }

      // 5. Frequently Asked Questions (FAQPage) Schema
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How can I find verified properties in ${selectedCity}?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `You can explore 100% verified residential and commercial properties in ${selectedCity} directly on ${siteSettings.portalName} with zero brokerage and direct owner phone contacts.`
            }
          },
          {
            '@type': 'Question',
            'name': `How does the ${siteSettings.portalName} property valuation calculator work?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Our instant property valuation tool calculates current per-sq.ft market rates, expected monthly rental yield, and appreciation trends across all prime localities of ${selectedCity}.`
            }
          }
        ]
      });

      // Inject or update the JSON-LD Script tag in Document Head
      let scriptEl = document.getElementById('dynamic-jsonld-schema') as HTMLScriptElement;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-jsonld-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schemas, null, 2);

    } catch (e) {
      console.warn('SEO Metadata injection note:', e);
    }
  }, [activeView, property, selectedCity, siteSettings]);

  return null;
};
