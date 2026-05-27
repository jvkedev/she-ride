import axios from "axios";

export interface LocationSuggestion {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimLocationResult {
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

export async function searchLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) return [];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/location/search`,
      {
        params: { q: query },
      },
    );

    return (data as NominatimLocationResult[]).map((item) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.error("Location search failed:", err);
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<LocationSuggestion | null> {
  try {
    // First try backend endpoint if available
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/reverse`,
        {
          params: { lat, lng },
          timeout: 5000,
        },
      );

      if (data) {
        return {
          placeId: data.place_id || `${lat},${lng}`,
          displayName: data.display_name || `${lat}, ${lng}`,
          lat: parseFloat(data.lat) || lat,
          lng: parseFloat(data.lon) || lng,
        };
      }
    } catch {
      console.warn("Backend reverse geocode not available, using Nominatim");
    }

    // Fallback to Nominatim (OpenStreetMap) - with address details for better precision
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat,
          lon: lng,
          format: "json",
          zoom: 18,
          addressdetails: 1, // Get detailed address components
        },
        timeout: 5000,
      },
    );

    if (data && data.address) {
      const displayName = buildDisplayNameFromAddress(
        data.address,
        data.display_name || `${lat}, ${lng}`,
      );

      return {
        placeId: data.place_id || `${lat},${lng}`,
        displayName: displayName || data.display_name,
        lat,
        lng,
      };
    }

    if (data && data.display_name) {
      return {
        placeId: data.place_id || `${lat},${lng}`,
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
