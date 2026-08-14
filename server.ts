import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Supabase Client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://fucisvuntdonaipcodqz.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_NaZZz6vzuF3BxoLa_fcoSA_Y6Gbk3VK";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// File-system persistence fallback for live server
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn("Could not create data directory:", e);
  }
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), "site_settings.json");
const DATA_SETTINGS_FILE_PATH = path.join(DATA_DIR, "site_settings.json");
const PROPERTIES_FILE_PATH = path.join(DATA_DIR, "properties.json");
const INQUIRIES_FILE_PATH = path.join(DATA_DIR, "inquiries.json");

let globalSyncVersion = Date.now();
let globalSiteSettings: any = null;
let globalProperties: any[] = [];
let globalInquiries: any[] = [];

// Default Seed Properties
const SEED_PROPERTIES = [
  {
    id: 'jpr-1',
    title: '3 BHK Luxury Apartment in Vaishali Nagar',
    description: 'Ultra-modern 3 BHK apartment with premium wooden flooring, modular kitchen, power backup, and 24/7 gated security in the heart of Vaishali Nagar. Excellent connectivity to Amrapali Circle and Ajmer Road.',
    price: 7500000,
    priceDisplay: '₹75 Lac',
    pricePerSqFt: 5172,
    areaSqFt: 1450,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    propertyType: 'Apartment',
    listingType: 'Buy',
    city: 'Jaipur',
    locality: 'Vaishali Nagar',
    address: 'Amrapali Circle, Block B, Vaishali Nagar, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '1-3 Years',
    floor: '4th',
    totalFloors: '10',
    facing: 'East',
    furnishing: 'Semi-Furnished',
    parking: '1 Covered Slot',
    postedBy: 'Owner',
    postedByName: 'Rajesh Sharma',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'rajesh.jaipur@example.com',
    isVerified: true,
    isExclusive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Gymnasium', 'Clubhouse', '24/7 Security', 'Power Backup', 'Stilt Parking', 'EV Charging', 'Gated Community'],
    postedDate: '2026-08-08',
    viewsCount: 1890,
    leadsCount: 24
  },
  {
    id: 'jpr-2',
    title: '4 BHK Royal Independent Villa with Private Garden',
    description: 'Spacious 4 BHK architect-designed villa near World Trade Park. Features private landscaped lawn, modular kitchen, rooftop gazebo, staff quarters, and JDA approved clear title.',
    price: 24000000,
    priceDisplay: '₹2.40 Cr',
    pricePerSqFt: 8000,
    areaSqFt: 3000,
    bedrooms: 4,
    bathrooms: 5,
    balconies: 3,
    propertyType: 'Villa',
    listingType: 'Buy',
    city: 'Jaipur',
    locality: 'Malviya Nagar',
    address: 'Near World Trade Park, D-Block, Malviya Nagar, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '0-1 Years',
    floor: 'Ground + 2',
    totalFloors: '3',
    facing: 'North-East',
    furnishing: 'Furnished',
    parking: '2 Covered Slots',
    postedBy: 'Owner',
    postedByName: 'Vikram Singh Rathore',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'vikram.rathore@jaipurproperties.com',
    isVerified: true,
    isExclusive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Garden', 'Rooftop Terrace', 'Servant Quarter', 'Solar Water Heater', 'CCTV Camera', 'Intercom'],
    postedDate: '2026-08-07',
    viewsCount: 2450,
    leadsCount: 38
  },
  {
    id: 'jpr-3',
    title: '2 BHK Smart Apartment near Jagatpura Airport Road',
    description: 'Affordable and well-ventilated 2 BHK flat near Bombay Hospital & SKIT College. Proximity to Jaipur International Airport, Expressways, and top hospitals.',
    price: 4200000,
    priceDisplay: '₹42 Lac',
    pricePerSqFt: 3818,
    areaSqFt: 1100,
    bedrooms: 2,
    bathrooms: 2,
    balconies: 2,
    propertyType: 'Apartment',
    listingType: 'Buy',
    city: 'Jaipur',
    locality: 'Jagatpura',
    address: 'Near Bombay Hospital, Mahal Road, Jagatpura, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '1-3 Years',
    floor: '3rd',
    totalFloors: '8',
    facing: 'East',
    furnishing: 'Semi-Furnished',
    parking: '1 Covered Slot',
    postedBy: 'Agent',
    postedByName: 'Pink City Prime Housing',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'info@pinkcityhousing.com',
    isVerified: true,
    isExclusive: false,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Elevator', 'Swimming Pool', 'Kids Play Area', 'Visitor Parking', 'Water Storage', 'Security'],
    postedDate: '2026-08-06',
    viewsCount: 1620,
    leadsCount: 19
  },
  {
    id: 'jpr-4',
    title: '3 BHK Ultra-Luxury Residence in C-Scheme',
    description: 'Exclusive heritage-style high-end luxury flat in C-Scheme with Italian marble flooring, VRV central AC, private lift lobby, and high capital growth value.',
    price: 18500000,
    priceDisplay: '₹1.85 Cr',
    pricePerSqFt: 9736,
    areaSqFt: 1900,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    propertyType: 'Apartment',
    listingType: 'Buy',
    city: 'Jaipur',
    locality: 'C-Scheme',
    address: 'Ashok Nagar, Near Rajmandir Cinema, C-Scheme, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '1-2 Years',
    floor: '5th',
    totalFloors: '7',
    facing: 'North',
    furnishing: 'Furnished',
    parking: '2 Reserved Covered Slots',
    postedBy: 'Owner',
    postedByName: 'Sunil Mathur',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'sunil.m@example.com',
    isVerified: true,
    isExclusive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Central Air Conditioning', 'Private Lift Access', '100% Power Backup', 'Gymnasium', 'Concierge Desk'],
    postedDate: '2026-08-05',
    viewsCount: 3100,
    leadsCount: 42
  },
  {
    id: 'jpr-5',
    title: 'Furnished Commercial Office in Mansarovar Metro Corridor',
    description: 'Ready-to-occupy office space with 20 workstations, 2 director cabins, conference room, and pantry near Mansarovar Metro Station.',
    price: 65000,
    priceDisplay: '₹65,000/mo',
    pricePerSqFt: 54,
    areaSqFt: 1200,
    bedrooms: 0,
    bathrooms: 2,
    balconies: 0,
    propertyType: 'Commercial Office',
    listingType: 'Commercial',
    city: 'Jaipur',
    locality: 'Mansarovar',
    address: 'Shipra Path, Main Market Corridor, Mansarovar, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Immediate',
    ageOfBuilding: '2 Years',
    floor: '2nd',
    totalFloors: '5',
    facing: 'East',
    furnishing: 'Furnished',
    parking: 'Reserved Parking',
    postedBy: 'Agent',
    postedByName: 'Jaipur Commercial Real Estate',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'office@jaipurcommercial.com',
    isVerified: true,
    isExclusive: false,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Power Backup', 'Wi-Fi Ready', 'Pantry Area', 'Central AC', '24/7 Security'],
    postedDate: '2026-08-04',
    viewsCount: 1450,
    leadsCount: 17
  }
];

const SEED_INQUIRIES = [
  {
    id: 'inq-1',
    propertyId: 'jpr-1',
    propertyTitle: '3 BHK Luxury Apartment in Vaishali Nagar',
    userName: 'Karan Malhotra',
    userEmail: 'karan.m@gmail.com',
    userPhone: '+91 98112 33445',
    userType: 'Buyer',
    message: 'Interested in taking a site visit this coming Sunday afternoon. Is price negotiable?',
    scheduleVisitDate: '2026-08-16',
    status: 'New',
    createdAt: '2026-08-08 14:30'
  },
  {
    id: 'inq-2',
    propertyId: 'jpr-1',
    propertyTitle: '3 BHK Luxury Apartment in Vaishali Nagar',
    userName: 'Ananya Roy',
    userEmail: 'ananya.roy@yahoo.com',
    userPhone: '+91 98301 99887',
    userType: 'Buyer',
    message: 'Is home loan approval available from HDFC / ICICI for this society?',
    status: 'Contacted',
    createdAt: '2026-08-07 10:15'
  },
  {
    id: 'inq-3',
    propertyId: 'jpr-2',
    propertyTitle: '4 BHK Royal Independent Villa with Private Garden',
    userName: 'Sanjay Reddy',
    userEmail: 'sanjay.reddy@techcorp.com',
    userPhone: '+91 98490 12121',
    userType: 'Investor',
    message: 'Looking for villa investment in Malviya Nagar. Please share floor layout PDF.',
    status: 'Site Visit Scheduled',
    createdAt: '2026-08-06 18:45'
  }
];

// Initialize Settings
try {
  if (fs.existsSync(DATA_SETTINGS_FILE_PATH)) {
    const raw = fs.readFileSync(DATA_SETTINGS_FILE_PATH, "utf-8");
    globalSiteSettings = JSON.parse(raw);
  } else if (fs.existsSync(SETTINGS_FILE_PATH)) {
    const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
    globalSiteSettings = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Could not load initial site_settings.json:", e);
}

// Initialize Properties
try {
  if (fs.existsSync(PROPERTIES_FILE_PATH)) {
    const raw = fs.readFileSync(PROPERTIES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalProperties = parsed;
    }
  }
  if (!globalProperties || globalProperties.length === 0) {
    globalProperties = SEED_PROPERTIES;
    fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
  }
} catch (e) {
  console.warn("Could not load properties.json, using seed:", e);
  globalProperties = SEED_PROPERTIES;
}

// Initialize Inquiries
try {
  if (fs.existsSync(INQUIRIES_FILE_PATH)) {
    const raw = fs.readFileSync(INQUIRIES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalInquiries = parsed;
    }
  }
  if (!globalInquiries || globalInquiries.length === 0) {
    globalInquiries = SEED_INQUIRIES;
    fs.writeFileSync(INQUIRIES_FILE_PATH, JSON.stringify(globalInquiries, null, 2), "utf-8");
  }
} catch (e) {
  console.warn("Could not load inquiries.json, using seed:", e);
  globalInquiries = SEED_INQUIRIES;
}

function savePropertiesToDisk() {
  try {
    fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write properties.json:", e);
  }
}

function saveInquiriesToDisk() {
  try {
    fs.writeFileSync(INQUIRIES_FILE_PATH, JSON.stringify(globalInquiries, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write inquiries.json:", e);
  }
}

function saveSettingsToDisk(settings: any) {
  try {
    fs.writeFileSync(DATA_SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write site_settings.json:", e);
  }
}

// Helper function to extract normalized SiteSettings from any database row format
function normalizeSettingsRow(row: any) {
  if (!row) return null;
  const source = (row.value && typeof row.value === 'object') 
    ? row.value 
    : (row.data && typeof row.data === 'object') 
    ? row.data 
    : row;

  return {
    logoUrl: source.logoUrl || source.logo_url || source.logo || '',
    faviconUrl: source.faviconUrl || source.favicon_url || source.favicon || source.logoUrl || source.logo_url || source.logo || '',
    portalName: source.portalName || source.portal_name || source.name || 'Jaipur Properties Hub',
    tagline: source.tagline || source.tag_line || 'Jaipur’s #1 Verified Real Estate & Property Portal',
    helplinePhone: source.helplinePhone || source.helpline_phone || source.phone || '+91 97721 17575',
    helplineWhatsapp: source.helplineWhatsapp || source.helpline_whatsapp || source.whatsapp || '+91 97721 17575',
    helplineEmail: source.helplineEmail || source.helpline_email || source.email || 'support@jaipurproperties.hub',
    officeAddress: source.officeAddress || source.office_address || source.address || 'Main Tonk Road, Opposite Gaurav Tower, Malviya Nagar, Jaipur, Rajasthan 302017',
    heroHeadline: source.heroHeadline || source.hero_headline || 'Find Your Dream Property in Pink City, Jaipur',
    announcementBarText: source.announcementBarText || source.announcement_bar_text || '✨ Special Festival Offer: ZERO Brokerage on Verified Direct Builder & Owner Properties in Mansarovar & Vaishali Nagar!',
    announcementBarActive: source.announcementBarActive !== undefined ? Boolean(source.announcementBarActive) : true,
    seoTitle: source.seoTitle || source.seo_title || '',
    seoDescription: source.seoDescription || source.seo_description || '',
    seoKeywords: source.seoKeywords || source.seo_keywords || '',
    seoCanonicalUrl: source.seoCanonicalUrl || source.seo_canonical_url || '',
    updatedAt: source.updatedAt || source.updated_at || new Date().toISOString()
  };
}

// Global Sync-All API for seamless real-time client sync across devices
app.get("/api/sync-all", (req, res) => {
  res.json({
    version: globalSyncVersion,
    settings: globalSiteSettings,
    properties: globalProperties,
    inquiries: globalInquiries,
    timestamp: new Date().toISOString()
  });
});

// Properties REST APIs
app.get("/api/properties", (req, res) => {
  res.json({ properties: globalProperties, version: globalSyncVersion });
});

app.post("/api/properties", async (req, res) => {
  try {
    const newProperty = req.body.property || req.body;
    if (!newProperty || !newProperty.title) {
      return res.status(400).json({ error: "Missing property details" });
    }

    const createdProperty = {
      ...newProperty,
      id: newProperty.id || ('prop-' + Date.now().toString()),
      viewsCount: Number(newProperty.viewsCount) || 1,
      leadsCount: Number(newProperty.leadsCount) || 0,
      postedDate: newProperty.postedDate || new Date().toISOString().split('T')[0]
    };

    // Prepend to list
    globalProperties = [createdProperty, ...globalProperties.filter(p => p.id !== createdProperty.id)];
    globalSyncVersion = Date.now();
    savePropertiesToDisk();

    // Background Supabase Sync
    try {
      await supabase.from("properties").upsert([createdProperty]);
    } catch (e: any) {
      console.warn("Supabase properties upsert notice:", e?.message);
    }

    return res.json({ status: "ok", property: createdProperty, version: globalSyncVersion });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.updates || req.body;

    let found = false;
    globalProperties = globalProperties.map(p => {
      if (p.id === id) {
        found = true;
        return { ...p, ...updates };
      }
      return p;
    });

    if (!found) {
      return res.status(404).json({ error: "Property not found" });
    }

    globalSyncVersion = Date.now();
    savePropertiesToDisk();

    // Background Supabase Sync
    try {
      await supabase.from("properties").update(updates).eq("id", id);
    } catch (e: any) {
      console.warn("Supabase properties update notice:", e?.message);
    }

    return res.json({ status: "ok", version: globalSyncVersion });
  } catch (error: any) {
    console.error("PUT /api/properties/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    globalProperties = globalProperties.filter(p => p.id !== id);
    globalSyncVersion = Date.now();
    savePropertiesToDisk();

    // Background Supabase Sync
    try {
      await supabase.from("properties").delete().eq("id", id);
    } catch (e: any) {
      console.warn("Supabase properties delete notice:", e?.message);
    }

    return res.json({ status: "ok", version: globalSyncVersion });
  } catch (error: any) {
    console.error("DELETE /api/properties/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Inquiries REST APIs
app.get("/api/inquiries", (req, res) => {
  res.json({ inquiries: globalInquiries, version: globalSyncVersion });
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const newInquiry = req.body.inquiry || req.body;
    const createdInquiry = {
      ...newInquiry,
      id: newInquiry.id || ('inq-' + Date.now().toString()),
      status: newInquiry.status || 'New',
      createdAt: newInquiry.createdAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    globalInquiries = [createdInquiry, ...globalInquiries];
    
    // Update leads count on associated property
    if (createdInquiry.propertyId) {
      globalProperties = globalProperties.map(p => 
        p.id === createdInquiry.propertyId ? { ...p, leadsCount: (p.leadsCount || 0) + 1 } : p
      );
      savePropertiesToDisk();
    }

    globalSyncVersion = Date.now();
    saveInquiriesToDisk();

    try {
      await supabase.from("inquiries").insert([createdInquiry]);
    } catch (e: any) {
      console.warn("Supabase inquiries insert notice:", e?.message);
    }

    return res.json({ status: "ok", inquiry: createdInquiry, version: globalSyncVersion });
  } catch (error: any) {
    console.error("POST /api/inquiries error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    globalInquiries = globalInquiries.map(i => i.id === id ? { ...i, ...updates } : i);
    globalSyncVersion = Date.now();
    saveInquiriesToDisk();

    try {
      await supabase.from("inquiries").update(updates).eq("id", id);
    } catch (e: any) {
      console.warn("Supabase inquiries update notice:", e?.message);
    }

    return res.json({ status: "ok", version: globalSyncVersion });
  } catch (error: any) {
    console.error("PUT /api/inquiries/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    globalInquiries = globalInquiries.filter(i => i.id !== id);
    globalSyncVersion = Date.now();
    saveInquiriesToDisk();

    try {
      await supabase.from("inquiries").delete().eq("id", id);
    } catch (e: any) {
      console.warn("Supabase inquiries delete notice:", e?.message);
    }

    return res.json({ status: "ok", version: globalSyncVersion });
  } catch (error: any) {
    console.error("DELETE /api/inquiries/:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Global Site Settings API powered by Supabase settings table + local fallback
app.get("/api/settings", async (req, res) => {
  try {
    const { data } = await supabase.from("settings").select("*").limit(1);
    const firstRow = data && data.length > 0 ? data[0] : null;

    if (firstRow) {
      const normalized = normalizeSettingsRow(firstRow);
      if (normalized) {
        globalSiteSettings = { ...globalSiteSettings, ...normalized };
      }
    }
  } catch (error: any) {
    console.warn("Supabase fetch notice in GET /api/settings:", error?.message);
  }

  return res.json({ settings: globalSiteSettings, version: globalSyncVersion });
});

app.post("/api/settings", async (req, res) => {
  try {
    const newSettings = req.body.settings || req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: "Missing settings payload" });
    }

    // 1. Immediately update global in-memory settings & bump sync version
    globalSiteSettings = newSettings;
    globalSyncVersion = Date.now();

    // 2. Persist to disk files
    saveSettingsToDisk(newSettings);

    // 3. Sync to Supabase in background
    try {
      const { data: existingRows } = await supabase.from("settings").select("*").limit(1);

      if (existingRows && existingRows.length > 0) {
        const firstRow = existingRows[0];
        const primaryKeyCol = 'id' in firstRow ? 'id' : Object.keys(firstRow)[0];
        const primaryKeyValue = firstRow[primaryKeyCol];

        const candidateUpdates: Record<string, any> = {
          logoUrl: newSettings.logoUrl,
          faviconUrl: newSettings.faviconUrl,
          portalName: newSettings.portalName,
          tagline: newSettings.tagline,
          helplinePhone: newSettings.helplinePhone,
          helplineWhatsapp: newSettings.helplineWhatsapp,
          helplineEmail: newSettings.helplineEmail,
          officeAddress: newSettings.officeAddress,
          heroHeadline: newSettings.heroHeadline,
          announcementBarText: newSettings.announcementBarText,
          announcementBarActive: newSettings.announcementBarActive,
          seoTitle: newSettings.seoTitle,
          seoDescription: newSettings.seoDescription,
          seoKeywords: newSettings.seoKeywords,
          seoCanonicalUrl: newSettings.seoCanonicalUrl,
          logo_url: newSettings.logoUrl,
          favicon_url: newSettings.faviconUrl,
          portal_name: newSettings.portalName,
          tag_line: newSettings.tagline,
          helpline_phone: newSettings.helplinePhone,
          helpline_whatsapp: newSettings.helplineWhatsapp,
          helpline_email: newSettings.helplineEmail,
          office_address: newSettings.officeAddress,
          hero_headline: newSettings.heroHeadline,
          announcement_bar_text: newSettings.announcementBarText,
          announcement_bar_active: newSettings.announcementBarActive,
          seo_title: newSettings.seoTitle,
          seo_description: newSettings.seoDescription,
          seo_keywords: newSettings.seoKeywords,
          seo_canonical_url: newSettings.seoCanonicalUrl,
          logo: newSettings.logoUrl,
          favicon: newSettings.faviconUrl,
          phone: newSettings.helplinePhone,
          whatsapp: newSettings.helplineWhatsapp,
          email: newSettings.helplineEmail,
          address: newSettings.officeAddress,
          name: newSettings.portalName,
          value: newSettings,
          data: newSettings,
          updated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updatePayload: Record<string, any> = {};
        const existingCols = Object.keys(firstRow);

        for (const col of existingCols) {
          if (col !== primaryKeyCol && col in candidateUpdates && candidateUpdates[col] !== undefined) {
            updatePayload[col] = candidateUpdates[col];
          }
        }

        if (Object.keys(updatePayload).length === 0) {
          if ('value' in firstRow) {
            updatePayload['value'] = newSettings;
          }
        }

        if (Object.keys(updatePayload).length > 0) {
          const { error: updateErr } = await supabase
            .from("settings")
            .update(updatePayload)
            .eq(primaryKeyCol, primaryKeyValue);

          if (updateErr) {
            console.warn("Supabase update error:", updateErr.message);
          }
        }
      } else {
        const insertPayload = { id: 'branding', value: newSettings, logoUrl: newSettings.logoUrl, portalName: newSettings.portalName };
        const { error: insertErr } = await supabase.from("settings").insert([insertPayload]);
        if (insertErr) {
          console.warn("Supabase insert error:", insertErr.message);
        }
      }
    } catch (dbErr: any) {
      console.warn("Supabase background sync exception:", dbErr?.message);
    }

    return res.json({ status: "ok", settings: globalSiteSettings, version: globalSyncVersion });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Initialize Google GenAI
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Jaipur Properties Hub with Firebase" });
});

// Gemini AI Locality Insights
app.post(["/api/gemini/insights", "/api/gemini/locality-insights"], async (req, res) => {
  try {
    const { city, locality } = req.body;
    const ai = getAi();
    if (!ai) {
      return res.json({
        insights: {
          connectivityScore: 8.8,
          lifestyleRating: 9.0,
          investmentScore: 8.5,
          summary: `${locality || 'Prime Locality'} in ${city || 'Jaipur'} boasts excellent connectivity, commercial hubs, and high tenant demand.`,
          nearbyHighlights: [
            "Convenient transit & metro corridor",
            "Top reputed schools & colleges in 5km radius",
            "Prominent healthcare facilities",
            "Popular retail malls & dining hubs"
          ],
          futureOutlook: "Steady capital appreciation supported by infrastructure upgrades and robust demand."
        }
      });
    }

    const prompt = `Provide real estate locality insights for Locality: ${locality}, City: ${city}. Include connectivity score (out of 10), lifestyle rating, investment score, summary, 4 nearby highlights, and future outlook.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            connectivityScore: { type: Type.NUMBER },
            lifestyleRating: { type: Type.NUMBER },
            investmentScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            nearbyHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            futureOutlook: { type: Type.STRING }
          },
          required: ["connectivityScore", "lifestyleRating", "investmentScore", "summary", "nearbyHighlights", "futureOutlook"]
        }
      }
    });

    const jsonText = response.text;
    if (jsonText) {
      return res.json({ insights: JSON.parse(jsonText) });
    }
    throw new Error("Empty AI response");
  } catch (error: any) {
    console.error("Locality Insights Error:", error);
    return res.json({
      insights: {
        connectivityScore: 8.5,
        lifestyleRating: 8.8,
        investmentScore: 8.4,
        summary: "High-growth residential area with solid infrastructure and excellent connectivity.",
        nearbyHighlights: ["Metro station nearby", "Shopping centers", "Schools & hospitals", "Green parks"],
        futureOutlook: "Strong potential for appreciation over next 3 years."
      }
    });
  }
});

// Gemini AI Property Description Generator
app.post("/api/gemini/ai-description", async (req, res) => {
  try {
    const { propertyType, bhk, city, locality, areaSqFt, expectedPrice, furnishing, amenities, keyHighlights } = req.body;
    const ai = getAi();
    if (!ai) {
      return res.json({
        description: `Stunning ${bhk || 3} BHK ${propertyType || 'Apartment'} for sale in ${locality || 'prime locality'}, ${city || 'Jaipur'}. Spanning ${areaSqFt || 1200} sq.ft carpet area with ${furnishing || 'Semi-Furnished'} layout. Features key amenities such as ${Array.isArray(amenities) ? amenities.slice(0, 3).join(', ') : 'Security, Power Backup, Clubhouse'}. Perfect opportunity for families and investors.`
      });
    }

    const prompt = `Write a compelling, professional 3-paragraph real estate listing description for a ${bhk || 3} BHK ${propertyType || 'Apartment'} located in ${locality}, ${city}. Carpet area: ${areaSqFt} sq.ft. Price: ${expectedPrice}. Furnishing: ${furnishing}. Amenities: ${Array.isArray(amenities) ? amenities.join(', ') : ''}. Highlights: ${keyHighlights || ''}. Highlight luxury, location advantages, connectivity, and investment value.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      return res.json({ description: text.trim() });
    }
    throw new Error("Empty AI description response");
  } catch (error: any) {
    console.error("AI Description Error:", error);
    const { propertyType, bhk, city, locality, areaSqFt } = req.body;
    return res.json({
      description: `Beautiful ${bhk || 3} BHK ${propertyType || 'Apartment'} located in prime locality of ${locality || 'Vaishali Nagar'}, ${city || 'Jaipur'}. Offering ${areaSqFt || 1250} sq.ft of well-planned living space with high-grade construction, excellent natural lighting, and modern society amenities.`
    });
  }
});

// Gemini AI Property Valuation & Yield Estimator
app.post("/api/gemini/valuation", async (req, res) => {
  try {
    const { city, locality, propertyType, bhk, areaSqFt, furnishing, ageYears } = req.body;
    const ai = getAi();
    if (!ai) {
      const baseSqFt = 8000;
      const estimatedVal = baseSqFt * (areaSqFt || 1200);
      const minVal = Math.round(estimatedVal * 0.92);
      const maxVal = Math.round(estimatedVal * 1.08);

      return res.json({
        valuation: {
          estimatedPriceMin: minVal,
          estimatedPriceMax: maxVal,
          estimatedPriceDisplay: `₹${(minVal / 10000000).toFixed(2)} Cr - ₹${(maxVal / 10000000).toFixed(2)} Cr`,
          avgPricePerSqFt: baseSqFt,
          estimatedRentMonthly: `₹${Math.round((estimatedVal * 0.032) / 12).toLocaleString()}/mo`,
          rentalYield: "3.2% - 3.8%",
          localityRating: 8.7,
          investmentRecommendation: "STRONG BUY / HOLD",
          keyDrivers: [
            `High demand for ${bhk || 3} BHK units in ${locality}`,
            "Proximity to major employment corridors",
            "Limited upcoming new land supply in core zone",
            "Favorable tenant occupancy rates"
          ]
        }
      });
    }

    const prompt = `Estimate current market property value in Indian Rupees (INR) for City: ${city}, Locality: ${locality}, Property Type: ${propertyType}, BHK: ${bhk}, Area: ${areaSqFt} sqft, Furnishing: ${furnishing}, Age: ${ageYears} years.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPriceMin: { type: Type.INTEGER },
            estimatedPriceMax: { type: Type.INTEGER },
            estimatedPriceDisplay: { type: Type.STRING },
            avgPricePerSqFt: { type: Type.INTEGER },
            estimatedRentMonthly: { type: Type.STRING },
            rentalYield: { type: Type.STRING },
            localityRating: { type: Type.NUMBER },
            investmentRecommendation: { type: Type.STRING },
            keyDrivers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "estimatedPriceMin",
            "estimatedPriceMax",
            "estimatedPriceDisplay",
            "avgPricePerSqFt",
            "estimatedRentMonthly",
            "rentalYield",
            "localityRating",
            "investmentRecommendation",
            "keyDrivers"
          ]
        }
      }
    });

    const jsonText = response.text;
    if (jsonText) {
      return res.json({ valuation: JSON.parse(jsonText) });
    }
    throw new Error("Empty AI response");
  } catch (error: any) {
    console.error("Valuation Error:", error);
    const area = req.body.areaSqFt || 1200;
    const baseSqFt = 10000;
    const est = area * baseSqFt;
    return res.json({
      valuation: {
        estimatedPriceMin: Math.round(est * 0.9),
        estimatedPriceMax: Math.round(est * 1.1),
        estimatedPriceDisplay: `₹${(est * 0.9 / 10000000).toFixed(2)} Cr - ₹${(est * 1.1 / 10000000).toFixed(2)} Cr`,
        avgPricePerSqFt: baseSqFt,
        estimatedRentMonthly: `₹${Math.round(est * 0.035 / 12).toLocaleString()}/mo`,
        rentalYield: "3.5%",
        localityRating: 8.6,
        investmentRecommendation: "RECOMMENDED BUY",
        keyDrivers: [
          "Established neighborhood infrastructure",
          "Consistent residential demand",
          "Good resale liquidity",
          "Balanced rental returns"
        ]
      }
    });
  }
});

// Server setup with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jaipur Properties Hub server running on http://localhost:${PORT}`);
  });
}

startServer();
