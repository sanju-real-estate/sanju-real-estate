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
const SETTINGS_FILE_PATH = path.join(process.cwd(), "site_settings.json");
const PROPERTIES_FILE_PATH = path.join(process.cwd(), "properties.json");
const INQUIRIES_FILE_PATH = path.join(process.cwd(), "inquiries.json");

let globalSiteSettings: any = null;
let globalProperties: any[] = [];
let globalInquiries: any[] = [];

try {
  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
    globalSiteSettings = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Could not load initial site_settings.json:", e);
}

try {
  if (fs.existsSync(PROPERTIES_FILE_PATH)) {
    const raw = fs.readFileSync(PROPERTIES_FILE_PATH, "utf-8");
    globalProperties = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Could not load initial properties.json:", e);
}

// Fallback seed if properties.json is empty or missing
if (!globalProperties || !Array.isArray(globalProperties) || globalProperties.length === 0) {
  globalProperties = [
    {
      id: 'jpr-1',
      title: '3 BHK Luxury Apartment in Vaishali Nagar',
      description: 'Ultra-modern 3 BHK apartment with premium wooden flooring, modular kitchen, power backup, and 24/7 gated security in the heart of Vaishali Nagar.',
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
      slug: '3bhk-luxury-apartment-vaishali-nagar',
      seoTitle: 'Buy 3 BHK Luxury Apartment in Vaishali Nagar Jaipur',
      seoKeywords: '3bhk apartment, vaishali nagar, buy flat jaipur',
      seoDescription: 'Ultra-modern 3 BHK apartment in Vaishali Nagar Jaipur.',
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
      slug: '4bhk-royal-independent-villa-malviya-nagar',
      seoTitle: '4 BHK Royal Independent Villa in Malviya Nagar Jaipur',
      seoKeywords: '4bhk villa, malviya nagar, independent villa jaipur',
      seoDescription: 'Spacious 4 BHK architect-designed villa near World Trade Park.',
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Private Garden', 'Rooftop Terrace', 'Servant Quarter', 'Solar Water Heater', 'CCTV Camera', 'Intercom'],
      postedDate: '2026-08-07',
      viewsCount: 2450,
      leadsCount: 38
    }
  ];
  try {
    fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
  } catch (e) {}
}

try {
  if (fs.existsSync(INQUIRIES_FILE_PATH)) {
    const raw = fs.readFileSync(INQUIRIES_FILE_PATH, "utf-8");
    globalInquiries = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Could not load initial inquiries.json:", e);
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

// Global Site Settings API powered by Server Memory + File Persistence + Supabase Sync
app.get("/api/settings", async (req, res) => {
  if (!globalSiteSettings) {
    try {
      if (fs.existsSync(SETTINGS_FILE_PATH)) {
        const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
        globalSiteSettings = JSON.parse(raw);
      }
    } catch (e) {}
  }

  if (!globalSiteSettings) {
    try {
      const { data } = await supabase.from("settings").select("*").limit(1);
      if (data && data.length > 0) {
        const normalized = normalizeSettingsRow(data[0]);
        if (normalized) {
          globalSiteSettings = normalized;
        }
      }
    } catch (e) {}
  }

  if (!globalSiteSettings) {
    globalSiteSettings = {
      logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80",
      faviconUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80",
      portalName: "Jaipur Properties Hub",
      tagline: "Jaipur’s #1 Verified Real Estate & Property Portal",
      helplinePhone: "+91 97721 17575",
      helplineWhatsapp: "+91 97721 17575",
      helplineEmail: "support@jaipurproperties.hub",
      officeAddress: "Main Tonk Road, Opposite Gaurav Tower, Malviya Nagar, Jaipur, Rajasthan 302017",
      heroHeadline: "Find Your Dream Property in Pink City, Jaipur",
      announcementBarText: "✨ Special Festival Offer: ZERO Brokerage on Verified Direct Builder & Owner Properties in Mansarovar & Vaishali Nagar!",
      announcementBarActive: true
    };
    try {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(globalSiteSettings, null, 2), "utf-8");
    } catch (e) {}
  }

  return res.json({ settings: globalSiteSettings });
});

app.post("/api/settings", async (req, res) => {
  try {
    const newSettings = req.body.settings || req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: "Missing settings payload" });
    }

    // 1. Immediately update global in-memory settings
    globalSiteSettings = { ...globalSiteSettings, ...newSettings };

    // 2. Persist to site_settings.json file
    try {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(globalSiteSettings, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write site_settings.json:", e);
    }

    // 3. Sync to Supabase in background (fire and forget safely)
    (async () => {
      try {
        const { data } = await supabase.from("settings").select("*").limit(1);
        if (data && data.length > 0) {
          const firstRow = data[0];
          const primaryKeyCol = 'id' in firstRow ? 'id' : Object.keys(firstRow)[0];
          const primaryKeyValue = firstRow[primaryKeyCol];
          await supabase.from("settings").update({ value: globalSiteSettings }).eq(primaryKeyCol, primaryKeyValue);
        } else {
          await supabase.from("settings").insert([{ id: 'branding', value: globalSiteSettings }]);
        }
      } catch (dbErr: any) {
        console.warn("Supabase background sync notice:", dbErr?.message);
      }
    })();

    return res.json({ status: "ok", settings: globalSiteSettings });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Properties API (Live Server Memory + Disk + Supabase Sync)
// -------------------------------------------------------------
app.get("/api/properties", async (req, res) => {
  if (!globalProperties || !Array.isArray(globalProperties) || globalProperties.length === 0) {
    try {
      if (fs.existsSync(PROPERTIES_FILE_PATH)) {
        const raw = fs.readFileSync(PROPERTIES_FILE_PATH, "utf-8");
        globalProperties = JSON.parse(raw);
      }
    } catch (e) {}
  }
  return res.json({ properties: globalProperties || [] });
});

app.post("/api/properties", async (req, res) => {
  try {
    const property = req.body.property || req.body;
    if (!property || !property.id) {
      return res.status(400).json({ error: "Property object with id is required" });
    }

    // Upsert into memory
    const existingIndex = globalProperties.findIndex((p: any) => p.id === property.id);
    if (existingIndex >= 0) {
      globalProperties[existingIndex] = { ...globalProperties[existingIndex], ...property };
    } else {
      globalProperties.unshift(property);
    }

    // Save to properties.json file
    try {
      fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write properties.json:", e);
    }

    // Sync to Supabase in background
    try {
      await supabase.from("properties").upsert([property]);
    } catch (dbErr: any) {
      console.warn("Supabase properties background upsert error:", dbErr?.message);
    }

    return res.json({ status: "ok", property, properties: globalProperties });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.updates || req.body;

    const existingIndex = globalProperties.findIndex((p: any) => p.id === id);
    if (existingIndex >= 0) {
      globalProperties[existingIndex] = { ...globalProperties[existingIndex], ...updates };
    } else {
      globalProperties.unshift({ id, ...updates });
    }

    try {
      fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
    } catch (e) {}

    try {
      await supabase.from("properties").update(updates).eq("id", id);
    } catch (dbErr: any) {
      console.warn("Supabase properties background update error:", dbErr?.message);
    }

    return res.json({ status: "ok", properties: globalProperties });
  } catch (error: any) {
    console.error("PUT /api/properties error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    globalProperties = globalProperties.filter((p: any) => p.id !== id);

    try {
      fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(globalProperties, null, 2), "utf-8");
    } catch (e) {}

    try {
      await supabase.from("properties").delete().eq("id", id);
    } catch (dbErr: any) {
      console.warn("Supabase properties background delete error:", dbErr?.message);
    }

    return res.json({ status: "ok", properties: globalProperties });
  } catch (error: any) {
    console.error("DELETE /api/properties error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Inquiries API (Live Server Memory + Disk + Supabase Sync)
// -------------------------------------------------------------
app.get("/api/inquiries", async (req, res) => {
  if (!globalInquiries || !Array.isArray(globalInquiries)) {
    try {
      if (fs.existsSync(INQUIRIES_FILE_PATH)) {
        const raw = fs.readFileSync(INQUIRIES_FILE_PATH, "utf-8");
        globalInquiries = JSON.parse(raw);
      }
    } catch (e) {}
  }
  return res.json({ inquiries: globalInquiries || [] });
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const inquiry = req.body.inquiry || req.body;
    if (!inquiry || !inquiry.id) {
      return res.status(400).json({ error: "Inquiry object with id is required" });
    }

    globalInquiries.unshift(inquiry);

    try {
      fs.writeFileSync(INQUIRIES_FILE_PATH, JSON.stringify(globalInquiries, null, 2), "utf-8");
    } catch (e) {}

    try {
      await supabase.from("inquiries").insert([inquiry]);
    } catch (dbErr: any) {
      console.warn("Supabase inquiry insert error:", dbErr?.message);
    }

    return res.json({ status: "ok", inquiry });
  } catch (error: any) {
    console.error("POST /api/inquiries error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    globalInquiries = globalInquiries.map((i: any) => i.id === id ? { ...i, status } : i);

    try {
      fs.writeFileSync(INQUIRIES_FILE_PATH, JSON.stringify(globalInquiries, null, 2), "utf-8");
    } catch (e) {}

    try {
      await supabase.from("inquiries").update({ status }).eq("id", id);
    } catch (dbErr: any) {
      console.warn("Supabase inquiry status update error:", dbErr?.message);
    }

    return res.json({ status: "ok", inquiries: globalInquiries });
  } catch (error: any) {
    console.error("PUT /api/inquiries error:", error);
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
