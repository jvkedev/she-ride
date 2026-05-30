import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'SheRide/1.0 (ride-hailing-app)';

@Injectable()
export class LocationService {
  async search(query: string): Promise<LocationResult[]> {
    const q = query?.trim();
    if (!q || q.length < 3) {
      return [];
    }

    const { data } = await axios.get<LocationResult[]>(`${NOMINATIM_BASE}/search`, {
      params: {
        q,
        format: 'json',
        addressdetails: 1,
        limit: 8,
        countrycodes: 'in',
      },
      headers: { 'User-Agent': USER_AGENT },
      timeout: 8000,
    });

    return (data ?? []).map((item) => ({
      place_id: String(item.place_id),
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));
  }

  async reverse(lat: number, lng: number): Promise<LocationResult | null> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const { data } = await axios.get<{
      place_id?: number;
      display_name?: string;
      lat?: string;
      lon?: string;
      address?: Record<string, string>;
    }>(`${NOMINATIM_BASE}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        zoom: 18,
        addressdetails: 1,
      },
      headers: { 'User-Agent': USER_AGENT },
      timeout: 8000,
    });

    if (!data?.display_name) return null;

    const shortName = this.buildShortAddress(data.address, data.display_name);

    return {
      place_id: String(data.place_id ?? `${lat},${lng}`),
      display_name: shortName,
      lat: data.lat ?? String(lat),
      lon: data.lon ?? String(lng),
    };
  }

  private buildShortAddress(
    address: Record<string, string> | undefined,
    fallback: string,
  ): string {
    if (!address) return fallback;

    const parts = [
      address.house_number,
      address.road,
      address.neighbourhood,
      address.suburb,
      address.city_district,
      address.city,
      address.state,
    ]
      .map((p) => p?.trim())
      .filter(Boolean) as string[];

    const unique = parts.filter(
      (part, i) =>
        parts.findIndex((c) => c.toLowerCase() === part.toLowerCase()) === i,
    );

    return unique.slice(0, 4).join(', ') || fallback;
  }
}
