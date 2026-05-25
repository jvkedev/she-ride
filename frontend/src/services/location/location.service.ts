import axios from "axios";

export interface LocationSuggestion {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

export async function searchLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) return [];

  const { data } = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 5,
        countrycodes: "in",
      },
      headers: {
        "Accept-Language": "en",
      },
    },
  );

  return data.map((item: any) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
