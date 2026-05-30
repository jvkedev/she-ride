import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { RideRedisService } from '../redis/ride-redis.service';

export type RouteGeometry = {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
};

@Injectable()
export class RouteService {
  constructor(private readonly rideRedis: RideRedisService) {}

  async getDrivingRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<RouteGeometry> {
    const empty: RouteGeometry = {
      coordinates: [],
      distanceKm: 0,
      durationMinutes: 0,
    };

    const cached = await this.rideRedis.getCachedRoute(
      fromLat,
      fromLng,
      toLat,
      toLng,
    );
    if (cached) {
      try {
        return JSON.parse(cached) as RouteGeometry;
      } catch {
        // continue to OSRM
      }
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const { data } = await axios.get(url, { timeout: 8000 });
      const route = data.routes?.[0];
      if (!route) return empty;

      const result: RouteGeometry = {
        coordinates: route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        ),
        distanceKm: (route.distance ?? 0) / 1000,
        durationMinutes: Math.max(
          1,
          Math.round((route.duration ?? 0) / 60),
        ),
      };

      await this.rideRedis.cacheRoute(
        fromLat,
        fromLng,
        toLat,
        toLng,
        JSON.stringify(result),
      );

      return result;
    } catch {
      return empty;
    }
  }
}
