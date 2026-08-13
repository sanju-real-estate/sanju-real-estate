import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
