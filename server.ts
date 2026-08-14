import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Supabase Client (Single Source of Truth)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://fucisvuntdonaipcodqz.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_NaZZz6vzuF3BxoLa_fcoSA_Y6Gbk3VK";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to extract normalized SiteSettings from any database row format
function normalizeSettingsRow(row: any) {
  if (!row) return null;
  const source = (row.value && typeof row.value === 'object') 
    ? row.value 
    : (row.data && typeof row.data === 'object') 
    ? row.data 
    : row;

  return {
    logoUrl: source.logoUrl || source.logo_url || source.logo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
    faviconUrl: source.faviconUrl || source.favicon_url || source.favicon || source.logoUrl || source.logo_url || source.logo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
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

// Default Site Settings Fallback if table is unseeded
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

// -------------------------------------------------------------
// Site Settings API (Pure Supabase Source of Truth)
// -------------------------------------------------------------
app.get("/api/settings", async (req, res) => {
  try {
    const { data, error } = await supabase.from("settings").select("*").limit(1);
    if (error) {
      console.error("GET /api/settings error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch settings from Supabase" });
    }

    if (data && data.length > 0) {
      const normalized = normalizeSettingsRow(data[0]);
      return res.json({ settings: normalized });
    }

    return res.json({ settings: DEFAULT_SITE_SETTINGS });
  } catch (err: any) {
    console.error("GET /api/settings exception:", err);
    return res.status(500).json({ error: err.message || "Server error fetching settings" });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const newSettings = req.body.settings || req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: "Missing settings payload" });
    }

    const payload = {
      id: 'branding',
      value: newSettings,
      data: newSettings,
      logoUrl: newSettings.logoUrl,
      logo_url: newSettings.logoUrl,
      portalName: newSettings.portalName,
      portal_name: newSettings.portalName,
      tagline: newSettings.tagline,
      helplinePhone: newSettings.helplinePhone,
      helpline_phone: newSettings.helplinePhone,
      helplineWhatsapp: newSettings.helplineWhatsapp,
      helpline_whatsapp: newSettings.helplineWhatsapp,
      helplineEmail: newSettings.helplineEmail,
      officeAddress: newSettings.officeAddress,
      heroHeadline: newSettings.heroHeadline,
      hero_headline: newSettings.heroHeadline,
      announcementBarText: newSettings.announcementBarText,
      announcementBarActive: newSettings.announcementBarActive,
      updatedAt: new Date().toISOString()
    };

    const { data: existingRows } = await supabase.from("settings").select("*").limit(1);

    if (existingRows && existingRows.length > 0) {
      const firstRow = existingRows[0];
      const primaryKeyCol = 'id' in firstRow ? 'id' : Object.keys(firstRow)[0];
      const primaryKeyValue = firstRow[primaryKeyCol];
      const { error: updateErr } = await supabase.from("settings").update(payload).eq(primaryKeyCol, primaryKeyValue);
      if (updateErr) {
        console.error("POST /api/settings update error:", updateErr);
        return res.status(500).json({ error: updateErr.message || "Failed to update settings in Supabase" });
      }
    } else {
      const { error: insertErr } = await supabase.from("settings").insert([payload]);
      if (insertErr) {
        console.error("POST /api/settings insert error:", insertErr);
        return res.status(500).json({ error: insertErr.message || "Failed to insert settings in Supabase" });
      }
    }

    return res.json({ status: "ok", settings: newSettings });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return res.status(500).json({ error: error.message || "Server error saving settings" });
  }
});

// -------------------------------------------------------------
// Properties API (Pure Supabase Source of Truth)
// -------------------------------------------------------------
app.get("/api/properties", async (req, res) => {
  try {
    const { data, error } = await supabase.from("properties").select("*");
    if (error) {
      console.error("GET /api/properties error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch properties from Supabase" });
    }
    return res.json({ properties: data || [] });
  } catch (err: any) {
    console.error("GET /api/properties exception:", err);
    return res.status(500).json({ error: err.message || "Server error fetching properties" });
  }
});

app.post("/api/properties", async (req, res) => {
  try {
    const property = req.body.property || req.body;
    if (!property || !property.id) {
      return res.status(400).json({ error: "Property object with id is required" });
    }

    const { error: dbErr } = await supabase.from("properties").upsert([property]);
    if (dbErr) {
      console.error("POST /api/properties upsert error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to save property to Supabase" });
    }

    const { data: freshData, error: fetchErr } = await supabase.from("properties").select("*");
    if (fetchErr) {
      console.error("POST /api/properties fetch error:", fetchErr);
      return res.status(500).json({ error: fetchErr.message || "Failed to fetch updated properties list" });
    }

    return res.json({ status: "ok", property, properties: freshData || [] });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error saving property" });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.updates || req.body;

    const { error: dbErr } = await supabase.from("properties").update(updates).eq("id", id);
    if (dbErr) {
      console.error("PUT /api/properties/:id error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to update property in Supabase" });
    }

    const { data: freshData, error: fetchErr } = await supabase.from("properties").select("*");
    if (fetchErr) {
      console.error("PUT /api/properties/:id fetch error:", fetchErr);
      return res.status(500).json({ error: fetchErr.message || "Failed to fetch updated properties list" });
    }

    return res.json({ status: "ok", properties: freshData || [] });
  } catch (error: any) {
    console.error("PUT /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error updating property" });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error: dbErr } = await supabase.from("properties").delete().eq("id", id);
    if (dbErr) {
      console.error("DELETE /api/properties/:id error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to delete property from Supabase" });
    }

    const { data: freshData, error: fetchErr } = await supabase.from("properties").select("*");
    if (fetchErr) {
      console.error("DELETE /api/properties/:id fetch error:", fetchErr);
      return res.status(500).json({ error: fetchErr.message || "Failed to fetch updated properties list" });
    }

    return res.json({ status: "ok", properties: freshData || [] });
  } catch (error: any) {
    console.error("DELETE /api/properties error:", error);
    return res.status(500).json({ error: error.message || "Server error deleting property" });
  }
});

// -------------------------------------------------------------
// Inquiries API (Pure Supabase Source of Truth)
// -------------------------------------------------------------
app.get("/api/inquiries", async (req, res) => {
  try {
    const { data, error } = await supabase.from("inquiries").select("*");
    if (error) {
      console.error("GET /api/inquiries error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch inquiries from Supabase" });
    }
    return res.json({ inquiries: data || [] });
  } catch (err: any) {
    console.error("GET /api/inquiries exception:", err);
    return res.status(500).json({ error: err.message || "Server error fetching inquiries" });
  }
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const inquiry = req.body.inquiry || req.body;
    if (!inquiry || !inquiry.id) {
      return res.status(400).json({ error: "Inquiry object with id is required" });
    }

    const { error: dbErr } = await supabase.from("inquiries").insert([inquiry]);
    if (dbErr) {
      console.error("POST /api/inquiries insert error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to create inquiry in Supabase" });
    }

    const { data: freshData } = await supabase.from("inquiries").select("*");
    return res.json({ status: "ok", inquiry, inquiries: freshData || [] });
  } catch (error: any) {
    console.error("POST /api/inquiries error:", error);
    return res.status(500).json({ error: error.message || "Server error creating inquiry" });
  }
});

app.put("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error: dbErr } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (dbErr) {
      console.error("PUT /api/inquiries/:id error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to update inquiry status in Supabase" });
    }

    const { data: freshData, error: fetchErr } = await supabase.from("inquiries").select("*");
    if (fetchErr) {
      console.error("PUT /api/inquiries/:id fetch error:", fetchErr);
      return res.status(500).json({ error: fetchErr.message || "Failed to fetch updated inquiries list" });
    }

    return res.json({ status: "ok", inquiries: freshData || [] });
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
  res.json({ status: "ok", service: "Jaipur Properties Hub with Supabase" });
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
