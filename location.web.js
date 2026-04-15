import { Permissions, webMethod } from "wix-web-module";
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';
import { logError } from 'backend/logger.web';

/**
 * Converts a ZIP code to Latitude and Longitude using Geocodio API.
 * @param {string} zip - The ZIP code to geocode.
 * @returns {Promise<Object>} The coordinates {lat, lng}
 */
export const getCoordsFromZip = webMethod(
  Permissions.Anyone,
  async (zip) => {
    // 🔐 Fetch API Key from Wix Secrets
    const API_KEY = await getSecret("geocodioKey"); 
    const url = `https://api.geocod.io/v1.12/geocode?q=${zip}&api_key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].location;
        return {
          lat: location.lat,
          lng: location.lng,
          success: true
        };
      } else {
        const errMsg = data.error || "No results";
        console.error("Geocoding failed:", errMsg);
        await logError("location.web.getCoordsFromZip", new Error(`Geocoding returned no results for ZIP: ${zip}. API message: ${errMsg}`));
        return { success: false, error: errMsg };
      }
    } catch (error) {
      console.error("Location fetch error:", error);
      await logError("location.web.getCoordsFromZip", error);
      return { success: false, error: error.message };
    }
  }
);
