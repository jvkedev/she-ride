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

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/location/search`,
      {
        params: { q: query },
      },
    );

    return data.map((item: any) => ({
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
