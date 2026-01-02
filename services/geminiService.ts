
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geocodeAddress = async (address: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract coordinates (latitude, longitude) and the full formatted address for: "${address}". 
      Return the data in valid JSON format. If you cannot find the exact location, provide the most likely coordinates for that city/area.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER, description: "Latitude coordinate" },
            lng: { type: Type.NUMBER, description: "Longitude coordinate" },
            formattedAddress: { type: Type.STRING, description: "Clean, full address" }
          },
          required: ["lat", "lng", "formattedAddress"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Could not geocode the address. Please try again or enter coordinates manually.");
  }
};
