import axios from "axios";

export interface LocationSuggestion {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface LocationApiResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

function buildDisplayNameFromAddress(
  address: Record<string, string | undefined>,
  fallback: string,
) {
  const preferredParts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.city,
    address.state,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  const uniqueParts = preferredParts.filter(
    (part, index) =>
      preferredParts.findIndex(
        (candidate) => candidate.toLowerCase() === part.toLowerCase(),
      ) === index,
  );

  return uniqueParts.slice(0, 3).join(", ") || fallback;
}

function mapResults(items: LocationApiResult[]): LocationSuggestion[] {
  return items
    .map((item) => ({
      placeId: String(item.place_id),
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
    .filter(
      (s) =>
        Number.isFinite(s.lat) &&
        Number.isFinite(s.lng) &&
        Math.abs(s.lat) <= 90 &&
        Math.abs(s.lng) <= 180,
    );
}

async function searchViaNominatim(query: string): Promise<LocationSuggestion[]> {
  const { data } = await axios.get<LocationApiResult[]>(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 8,
        countrycodes: "in",
      },
      headers: { "User-Agent": "SheRide/1.0" },
      timeout: 8000,
    },
  );
  return mapResults(data ?? []);
}

export async function searchLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) return [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const { data } = await axios.get<LocationApiResult[]>(
      `${apiUrl}/location/search`,
      {
        params: { q: query },
        timeout: 8000,
      },
    );
    const results = mapResults(data ?? []);
    if (results.length > 0) return results;
  } catch {
    // fall through to Nominatim
  }

  try {
    return await searchViaNominatim(query);
  } catch (err) {
    console.error("Location search failed:", err);
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<LocationSuggestion | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV !== "production") {
    console.info("[SheRide][reverseGeocode] start", { lat, lng });
  }

  try {
    if (apiUrl) {
      const { data } = await axios.get<LocationApiResult>(
        `${apiUrl}/location/reverse`,
        {
          params: { lat, lng },
          timeout: 8000,
        },
      );

      if (data?.display_name) {
        const result = {
          placeId: String(data.place_id) || `${lat},${lng}`,
          displayName: data.display_name,
          lat,
          lng,
        };
        if (process.env.NODE_ENV !== "production") {
          console.info("[SheRide][reverseGeocode] api success", result);
        }
        return result;
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[SheRide][reverseGeocode] api failed, using Nominatim", err);
    }
  }

  try {
    const { data } = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
          zoom: 18,
          addressdetails: 1,
        },
        headers: { "User-Agent": "SheRide/1.0" },
        timeout: 5000,
      },
    );

    if (data?.address) {
      const displayName = buildDisplayNameFromAddress(
        data.address,
        data.display_name || `${lat}, ${lng}`,
      );

      return {
        placeId: String(data.place_id) || `${lat},${lng}`,
        displayName: displayName || data.display_name,
        lat,
        lng,
      };
    }

    if (data?.display_name) {
      return {
        placeId: String(data.place_id) || `${lat},${lng}`,
        displayName: data.display_name,
        lat,
        lng,
      };
    }

    return null;
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return null;
  }
}
