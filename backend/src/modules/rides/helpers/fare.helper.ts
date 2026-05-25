import { VehicleType } from '@prisma/client';

const FARE_RATES: Record<VehicleType, { base: number; perKm: number }> = {
  BIKE: { base: 20, perKm: 8 },
  AUTO: { base: 30, perKm: 12 },
  CAR: { base: 50, perKm: 18 },
  SUV: { base: 70, perKm: 22 },
};

export function calculateFare(
  distanceKm: number,
  vehicleType: VehicleType,
): number {
  const { base, perKm } = FARE_RATES[vehicleType];
  return Math.round(base + distanceKm * perKm);
}
