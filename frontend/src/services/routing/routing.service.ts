import { apiFetch } from "@/services/api/api-client";

export interface RouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  isPreview?: boolean;
}

const memoryCache = new Map<string, RouteResult>();
const inflight = new Map<string, Promise<RouteResult>>();

function routeKey(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  return `${fromLat.toFixed(5)},${fromLng.toFixed(5)};${toLat.toFixed(5)},${toLng.toFixed(5)}`;
}

/** Instant straight-line polyline for zero-delay map feedback */
export function buildPreviewRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  segments = 24,
): [number, number][] {
  if (
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLng) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLng)
  ) {
    return [];
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push([
      fromLat + (toLat - fromLat) * t,
      fromLng + (toLng - fromLng) * t,
    ]);
  }
  return points;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchOsrmRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteResult> {
  try {
    const res = await apiFetch(
      `/rides/route?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data.coordinates?.length > 1) {
        return {
          coordinates: data.coordinates,
          distanceKm: data.distanceKm ?? 0,
          durationMinutes: data.durationMinutes ?? 1,
        };
      }
    }
  } catch {
    // fallback to public OSRM
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) {
    return {
      coordinates: buildPreviewRoute(fromLat, fromLng, toLat, toLng),
      distanceKm: haversineKm(fromLat, fromLng, toLat, toLng),
      durationMinutes: 1,
      isPreview: true,
    };
  }

  return {
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
    ),
    distanceKm: (route.distance ?? 0) / 1000,
    durationMinutes: Math.max(1, Math.round((route.duration ?? 0) / 60)),
  };
}

export async function getRouteWithMeta(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteResult> {
  const empty: RouteResult = {
    coordinates: [],
    distanceKm: 0,
    durationMinutes: 0,
  };

  if (
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLng) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLng) ||
    Math.abs(fromLat) > 90 ||
    Math.abs(toLat) > 90
  ) {
    return empty;
  }

  const key = routeKey(fromLat, fromLng, toLat, toLng);
  const cached = memoryCache.get(key);
  if (cached && !cached.isPreview) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const task = fetchOsrmRoute(fromLat, fromLng, toLat, toLng)
    .then((result) => {
      memoryCache.set(key, result);
      inflight.delete(key);
      return result;
    })
    .catch(() => {
      inflight.delete(key);
      const fallback: RouteResult = {
        coordinates: buildPreviewRoute(fromLat, fromLng, toLat, toLng),
        distanceKm: haversineKm(fromLat, fromLng, toLat, toLng),
        durationMinutes: 1,
        isPreview: true,
      };
      return fallback;
    });

  inflight.set(key, task);
  return task;
}

export function getInstantPreviewRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): RouteResult {
  const coordinates = buildPreviewRoute(fromLat, fromLng, toLat, toLng);
  const distanceKm = haversineKm(fromLat, fromLng, toLat, toLng);
  return {
    coordinates,
    distanceKm,
    durationMinutes: Math.max(1, Math.round((distanceKm / 30) * 60)),
    isPreview: true,
  };
}

export function prefetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  void getRouteWithMeta(fromLat, fromLng, toLat, toLng);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
