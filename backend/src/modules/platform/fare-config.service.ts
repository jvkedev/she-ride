import { Injectable } from '@nestjs/common';
import { VehicleType } from '@prisma/client';

import { redis } from '../../config/redis';

const FARE_RATES_KEY = 'platform:fare:rates';

export type FareRate = { base: number; perKm: number };

export type FareRatesMap = Record<VehicleType, FareRate>;

const DEFAULT_FARE_RATES: FareRatesMap = {
  BIKE: { base: 20, perKm: 8 },
  AUTO: { base: 30, perKm: 12 },
  CAR: { base: 50, perKm: 18 },
  SUV: { base: 70, perKm: 22 },
};

@Injectable()
export class FareConfigService {
  private cache: FareRatesMap | null = null;

  getDefaultRates(): FareRatesMap {
    return { ...DEFAULT_FARE_RATES };
  }

  async getRates(): Promise<FareRatesMap> {
    if (this.cache) return { ...this.cache };

    const raw = await redis.get(FARE_RATES_KEY);
    if (raw) {
      try {
        this.cache = { ...DEFAULT_FARE_RATES, ...JSON.parse(raw) };
        return { ...this.cache! };
      } catch {
        this.cache = { ...DEFAULT_FARE_RATES };
      }
    } else {
      this.cache = { ...DEFAULT_FARE_RATES };
    }

    return { ...this.cache };
  }

  async updateRates(
    partial: Partial<Record<VehicleType, Partial<FareRate>>>,
  ): Promise<FareRatesMap> {
    const current = await this.getRates();
    const next: FareRatesMap = { ...current };

    for (const type of Object.values(VehicleType)) {
      const patch = partial[type];
      if (!patch) continue;
      next[type] = {
        base: patch.base ?? current[type].base,
        perKm: patch.perKm ?? current[type].perKm,
      };
    }

    await redis.set(FARE_RATES_KEY, JSON.stringify(next));
    this.cache = next;
    return { ...next };
  }

  async calculateFare(
    distanceKm: number,
    vehicleType: VehicleType,
  ): Promise<number> {
    const rates = await this.getRates();
    const { base, perKm } = rates[vehicleType] ?? DEFAULT_FARE_RATES[vehicleType];
    return Math.round(base + distanceKm * perKm);
  }
}
