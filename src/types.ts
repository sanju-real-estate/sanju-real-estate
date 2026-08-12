export type ListingType = 'Buy' | 'Rent' | 'Commercial' | 'New Projects';

export type PropertyType = 
  | 'Apartment' 
  | 'Villa' 
  | 'Plot' 
  | 'Penthouse' 
  | 'Commercial Office' 
  | 'Commercial Shop';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type ConstructionStatus = 'Ready to Move' | 'Under Construction';

export type PostedBy = 'Owner' | 'Agent' | 'Builder';

export type Facing = 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // In INR Rupees (e.g. 8500000 = 85 Lacs)
  priceDisplay: string; // e.g. "₹85 Lac" or "₹1.25 Cr" or "₹45,000/mo"
  pricePerSqFt: number;
  areaSqFt: number;
  bedrooms: number; // BHK count
  bathrooms: number;
  balconies: number;
  propertyType: PropertyType;
  listingType: ListingType;
  city: string;
  locality: string;
  address: string;
  constructionStatus: ConstructionStatus;
  possessionDate: string;
  ageOfBuilding: string;
  floor: string;
  totalFloors: string;
  facing: Facing;
  furnishing: FurnishingStatus;
  parking: string;
  postedBy: PostedBy;
  postedByName: string;
  postedByPhone: string;
  postedByEmail: string;
  isVerified: boolean;
  isExclusive: boolean;
  isFeatured: boolean;
  images: string[];
  videoUrl?: string;
  floorPlanUrl?: string;
  amenities: string[];
  postedDate: string;
  viewsCount: number;
  leadsCount: number;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userType: 'Buyer' | 'Tenant' | 'Investor' | 'Agent';
  message: string;
  scheduleVisitDate?: string;
  status: 'New' | 'Contacted' | 'Site Visit Scheduled' | 'Closed';
  createdAt: string;
}

export interface LocalityInfo {
  id: string;
  name: string;
  city: string;
  avgPriceSqFt: number;
  priceGrowthYr: string;
  image: string;
  description: string;
  highlights: string[];
}

export interface FilterState {
  listingType: ListingType;
  city: string;
  locality: string;
  propertyTypes: PropertyType[];
  bhk: number[];
  minPrice: number;
  maxPrice: number;
  constructionStatus: ConstructionStatus[];
  postedBy: PostedBy[];
  furnishing: FurnishingStatus[];
  searchQuery: string;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'area_high';
}

export interface AiValuationRequest {
  city: string;
  locality: string;
  propertyType: string;
  bhk: number;
  areaSqFt: number;
  furnishing: string;
  ageYears: number;
}

export interface AiValuationResult {
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  estimatedPriceDisplay: string;
  avgPricePerSqFt: number;
  estimatedRentMonthly: string;
  rentalYield: string;
  localityRating: number;
  investmentRecommendation: string;
  keyDrivers: string[];
}

export interface UserProfile {
  id?: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  city?: string;
  userType: 'Buyer / Tenant' | 'Owner' | 'Agent / Builder';
  role?: string;
  isVerified?: boolean;
  stats?: {
    myPropertiesCount: number;
    favoritesCount: number;
    myEnquiriesCount: number;
  };
}

