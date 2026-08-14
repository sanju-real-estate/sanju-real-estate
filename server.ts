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

// Global Anti-Caching Middleware for all API endpoints
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Initialize Supabase Client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://fucisvuntdonaipcodqz.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_NaZZz6vzuF3BxoLa_fcoSA_Y6Gbk3VK";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Persistent Local Database Setup
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          settings: parsed.settings || {},
          properties: Array.isArray(parsed.properties) ? parsed.properties : [],
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : []
        };
      }
    }
  } catch (err) {
    console.warn("Failed to read db.json, initializing fresh store:", err);
  }
  return null;
}

function saveDb(data: { settings: any; properties: any[]; inquiries: any[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save db.json:", err);
  }
}

// Default Seed Data
const DEFAULT_SITE_SETTINGS = {
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

const INITIAL_PROPERTIES = [
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
    address: 'Near SKIT College Road, Jagatpura, Jaipur',
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    ageOfBuilding: '1-2 Years',
    floor: '2nd',
    totalFloors: '7',
    facing: 'East',
    furnishing: 'Semi-Furnished',
    parking: '1 Covered Slot',
    postedBy: 'Builder',
    postedByName: 'Trimurty Builders Jaipur',
    postedByPhone: '+91 97721 17575',
    postedByEmail: 'sales@trimurtybuilders.com',
    isVerified: true,
    isExclusive: false,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['24/7 Water Supply', 'Elevator', 'Security Guard', 'Covered Parking', 'Community Hall'],
    postedDate: '2026-08-06',
    viewsCount: 1280,
    leadsCount: 19
  }
];

const INITIAL_INQUIRIES = [
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
    propertyId: 'jpr-2',
    propertyTitle: '4 BHK Royal Independent Villa with Private Garden',
    userName: 'Ananya Roy',
    userEmail: 'ananya.roy@yahoo.com',
    userPhone: '+91 98301 99887',
    userType: 'Buyer',
    message: 'Is home loan approval available from HDFC / ICICI for this property?',
    status: 'Contacted',
    createdAt: '2026-08-07 10:15'
  }
];

// Initialize Master Database
let db = readDb();
if (!db || !db.properties || db.properties.length === 0) {
  db = {
    settings: DEFAULT_SITE_SETTINGS,
    properties: INITIAL_PROPERTIES,
    inquiries: INITIAL_INQUIRIES
  };
  saveDb(db);
}

// -------------------------------------------------------------
// Site Settings API
// -------------------------------------------------------------
app.get("/api/settings", async (req, res) => {
  return res.json({ settings: db.settings });
});

app.post("/api/settings", async (req, res) => {
  try {
    const newSettings = req.body.settings || req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: "Missing settings payload" });
    }

    db.settings = { ...db.settings, ...newSettings };
    saveDb(db);

    // Background sync to Supabase settings table if exists
    try {
      const payload = {
        value: db.settings,
        updated_at: new Date().toISOString()
      };
      const { data: existing } = await supabase.from("settings").select("*").limit(1);
      if (existing && existing.length > 0) {
        await supabase.from("settings").update(payload).eq("id", existing[0].id);
      } else {
        await supabase.from("settings").insert([payload]);
      }
    } catch (e) {
      console.warn("Supabase settings sync notice:", e);
    }

    return res.json({ status: "ok", settings: db.settings });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return res.status(500).json({ error: error.message || "Server error saving settings" });
  }
});

// -------------------------------------------------------------
// Properties API
// -------------------------------------------------------------
app.get("/api/properties", async (req, res) => {
  return res.json({ properties: db.properties });
});

app.post("/api/properties", async (req, res) => {
  try {
    const property = req.body.property || req.body;
    if (!property || !property.id) {
      return res.status(400).json({ error: "Property object with id is required" });
    }

    const existingIdx = db.properties.findIndex(p => p.id === property.id);
    if (existingIdx >= 0) {
      db.properties[existingIdx] = { ...db.properties[existingIdx], ...property };
    } else {
      db.properties = [property, ...db.properties];
    }
    saveDb(db);

    return res.json({ status: "ok", property, properties: db.properties });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error saving property" });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.updates || req.body;

    db.properties = db.properties.map(p => p.id === id ? { ...p, ...updates } : p);
    saveDb(db);

    return res.json({ status: "ok", properties: db.properties });
  } catch (error: any) {
    console.error("PUT /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error updating property" });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    db.properties = db.properties.filter(p => p.id !== id);
    saveDb(db);

    return res.json({ status: "ok", properties: db.properties });
  } catch (error: any) {
    console.error("DELETE /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error deleting property" });
  }
});

// -------------------------------------------------------------
// Inquiries API
// -------------------------------------------------------------
app.get("/api/inquiries", async (req, res) => {
  return res.json({ inquiries: db.inquiries });
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const inquiry = req.body.inquiry || req.body;
    if (!inquiry || !inquiry.id) {
      return res.status(400).json({ error: "Inquiry object with id is required" });
    }

    db.inquiries = [inquiry, ...db.inquiries];
    saveDb(db);

    return res.json({ status: "ok", inquiry, inquiries: db.inquiries });
  } catch (error: any) {
    console.error("POST /api/inquiries error:", error);
    return res.status(500).json({ error: error.message || "Server error creating inquiry" });
  }
});

app.put("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    db.inquiries = db.inquiries.map(inq => inq.id === id ? { ...inq, status } : inq);
    saveDb(db);

    return res.json({ status: "ok", inquiries: db.inquiries });
  } catch (error: any) {
    console.error("PUT /api/inquiries error:", error);
    return res.status(500).json({ error: error.message || "Server error updating inquiry" });
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
  res.json({ status: "ok", service: "Jaipur Properties Hub with Express Server Store" });
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
