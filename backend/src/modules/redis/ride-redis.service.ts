import { Injectable } from '@nestjs/common';
import { VehicleType } from '@prisma/client';

import { redis } from '../../config/redis';

const RIDE_STATE_PREFIX = 'ride:state:';
const CAPTAIN_LOC_PREFIX = 'captain:loc:';
const CAPTAINS_GEO_KEY = 'captains:geo';
const ROUTE_CACHE_PREFIX = 'route:cache:';
const SEARCHING_RIDES_KEY = 'rides:searching';
const VERIFICATION_CHANNEL = 'verification:updates';
const VERIFICATION_QUEUE_PREFIX = 'verification:queue:';

export type RideRedisState = {
  rideId: string;
  status: string;
  riderId: string;
  captainId?: string | null;
  vehicleType: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  searchingStep?: string;
  nearbyCaptains?: number;
  updatedAt: string;
};

export type CaptainLocationSnapshot = {
  captainId: string;
  userId: string;
  lat: number;
  lng: number;
  vehicleType?: string;
  updatedAt: string;
};

@Injectable()
export class RideRedisService {
  async setRideState(state: RideRedisState, ttlSeconds = 86_400) {
    await redis.setex(
      `${RIDE_STATE_PREFIX}${state.rideId}`,
      ttlSeconds,
      JSON.stringify(state),
    );
  }

  async getRideState(rideId: string): Promise<RideRedisState | null> {
    const raw = await redis.get(`${RIDE_STATE_PREFIX}${rideId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RideRedisState;
    } catch {
      return null;
    }
  }

  async patchRideState(
    rideId: string,
    patch: Partial<RideRedisState>,
  ): Promise<RideRedisState | null> {
    const current = await this.getRideState(rideId);
    if (!current) return null;
    const next = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.setRideState(next);
    return next;
  }

  async deleteRideState(rideId: string) {
    await redis.del(`${RIDE_STATE_PREFIX}${rideId}`);
  }

  async setCaptainLocation(snapshot: CaptainLocationSnapshot) {
    const key = `${CAPTAIN_LOC_PREFIX}${snapshot.captainId}`;
    await redis.setex(
      key,
      300,
      JSON.stringify(snapshot),
    );

    if (snapshot.vehicleType) {
      await redis.geoadd(
        CAPTAINS_GEO_KEY,
        snapshot.lng,
        snapshot.lat,
        `${snapshot.captainId}:${snapshot.vehicleType}`,
      );
    }
  }

  async getCaptainLocation(
    captainId: string,
  ): Promise<CaptainLocationSnapshot | null> {
    const raw = await redis.get(`${CAPTAIN_LOC_PREFIX}${captainId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CaptainLocationSnapshot;
    } catch {
      return null;
    }
  }

  async setCaptainOnline(
    captainId: string,
    userId: string,
    lat: number | null,
    lng: number | null,
    vehicleType: VehicleType,
    isOnline: boolean,
  ) {
    if (!isOnline) {
      await redis.zrem(CAPTAINS_GEO_KEY, `${captainId}:${vehicleType}`);
      return;
    }

    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      await this.setCaptainLocation({
        captainId,
        userId,
        lat,
        lng,
        vehicleType,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async findNearbyCaptainIds(
    lat: number,
    lng: number,
    vehicleType: VehicleType,
    radiusKm: number,
    limit = 10,
  ): Promise<string[]> {
    const results = await redis.georadius(
      CAPTAINS_GEO_KEY,
      lng,
      lat,
      radiusKm,
      'km',
      'WITHDIST',
      'ASC',
      'COUNT',
      limit * 3,
    );

    const captainIds: string[] = [];
    for (const row of results) {
      const member = String(Array.isArray(row) ? row[0] : row);
      const [captainId, type] = member.split(':');
      if (type === vehicleType && captainId && !captainIds.includes(captainId)) {
        captainIds.push(captainId);
      }
      if (captainIds.length >= limit) break;
    }
    return captainIds;
  }

  async addSearchingRide(rideId: string, vehicleType: string) {
    await redis.sadd(SEARCHING_RIDES_KEY, `${rideId}:${vehicleType}`);
  }

  async removeSearchingRide(rideId: string, vehicleType: string) {
    await redis.srem(SEARCHING_RIDES_KEY, `${rideId}:${vehicleType}`);
  }

  async cacheRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    payload: string,
    ttlSeconds = 3600,
  ) {
    const key = this.routeCacheKey(fromLat, fromLng, toLat, toLng);
    await redis.setex(key, ttlSeconds, payload);
  }

  async getCachedRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<string | null> {
    return redis.get(this.routeCacheKey(fromLat, fromLng, toLat, toLng));
  }

  private routeCacheKey(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ) {
    const r = (n: number) => n.toFixed(4);
    return `${ROUTE_CACHE_PREFIX}${r(fromLat)},${r(fromLng)};${r(toLat)},${r(toLng)}`;
  }

  async setVerificationQueueEntry(captainId: string, payload: object) {
    await redis.setex(
      `${VERIFICATION_QUEUE_PREFIX}${captainId}`,
      604_800,
      JSON.stringify(payload),
    );
  }

  async publishVerificationUpdate(userId: string, payload: object) {
    await redis.publish(
      VERIFICATION_CHANNEL,
      JSON.stringify({ userId, ...payload }),
    );
  }

  getVerificationChannel() {
    return VERIFICATION_CHANNEL;
  }
}
