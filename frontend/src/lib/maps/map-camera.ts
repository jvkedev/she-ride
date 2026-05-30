import L from "leaflet";

export type MapCameraMode =
  | "single"
  | "pickup-drop-preview"
  | "approach"
  | "active-trip"
  | "captain-nav-approach"
  | "captain-nav-active";

export type LatLngTuple = [number, number];

export type MapCameraOptions = {
  mode: MapCameraMode;
  points: LatLngTuple[];
  route?: LatLngTuple[];
  padding?: [number, number];
  animate?: boolean;
};

const DEFAULT_PADDING: [number, number] = [72, 72];

/** Coerce and validate; returns a fresh tuple safe for Leaflet. */
export function normalizeLatLng(input: unknown): LatLngTuple | null {
  if (input == null) return null;

  let lat: number;
  let lng: number;

  if (Array.isArray(input)) {
    if (input.length < 2) return null;
    lat = Number(input[0]);
    lng = Number(input[1]);
  } else if (typeof input === "object") {
    const o = input as {
      lat?: unknown;
      lng?: unknown;
      lon?: unknown;
    };
    if ("lat" in o && ("lng" in o || "lon" in o)) {
      lat = Number(o.lat);
      lng = Number(o.lng ?? o.lon);
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return null;
  }

  return [lat, lng];
}

export function isValidLatLng(input: unknown): input is LatLngTuple {
  return normalizeLatLng(input) !== null;
}

export function filterValidLatLngs(points: unknown[]): LatLngTuple[] {
  const out: LatLngTuple[] = [];
  for (const p of points) {
    const n = normalizeLatLng(p);
    if (n) out.push(n);
  }
  return out;
}

function isValid(input: unknown): boolean {
  return normalizeLatLng(input) !== null;
}

function clampZoom(zoom: number, minZoom: number, maxZoom: number): number {
  const z = Number(zoom);
  if (!Number.isFinite(z)) return 16;
  return Math.min(maxZoom, Math.max(minZoom, z));
}

function isMapRenderable(map: L.Map): boolean {
  const el = map.getContainer();
  if (!el) return false;
  return el.clientWidth > 0 && el.clientHeight > 0;
}

export function haversineKm(
  [lat1, lng1]: LatLngTuple,
  [lat2, lng2]: LatLngTuple,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Target zoom from straight-line distance (keeps city trips readable). */
export function zoomForDistanceKm(distanceKm: number): number {
  if (distanceKm < 0.4) return 17;
  if (distanceKm < 1) return 16;
  if (distanceKm < 3) return 15;
  if (distanceKm < 8) return 14;
  if (distanceKm < 20) return 13;
  return 12;
}

function getModeZoomLimits(mode: MapCameraMode): {
  minZoom: number;
  maxZoom: number;
} {
  switch (mode) {
    case "single":
      return { minZoom: 15, maxZoom: 17 };
    case "pickup-drop-preview":
      return { minZoom: 13, maxZoom: 16 };
    case "approach":
      return { minZoom: 14, maxZoom: 17 };
    case "active-trip":
      return { minZoom: 14, maxZoom: 17 };
    case "captain-nav-approach":
      return { minZoom: 14, maxZoom: 17 };
    case "captain-nav-active":
      return { minZoom: 14, maxZoom: 17 };
    default:
      return { minZoom: 13, maxZoom: 16 };
  }
}

function nearestIndexOnRoute(
  route: LatLngTuple[],
  target: LatLngTuple,
): number {
  let best = 0;
  let bestDist = Infinity;
  route.forEach((pt, i) => {
    const d = haversineKm(pt, target);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

/** Points along route ahead of `from` (for in-trip camera, not full polyline). */
export function sampleRouteAhead(
  route: LatLngTuple[],
  from: LatLngTuple,
  maxKm = 4,
  maxPoints = 24,
): LatLngTuple[] {
  if (route.length < 2) return route.filter(isValid);

  const startIdx = nearestIndexOnRoute(route, from);
  const ahead: LatLngTuple[] = [from];
  let accumulated = 0;

  for (let i = startIdx; i < route.length - 1 && ahead.length < maxPoints; i++) {
    const seg = haversineKm(route[i], route[i + 1]);
    accumulated += seg;
    ahead.push(route[i + 1]);
    if (accumulated >= maxKm) break;
  }

  return filterValidLatLngs(ahead);
}

function decimateRoute(route: LatLngTuple[], maxPoints = 40): LatLngTuple[] {
  const valid = route.filter(isValid);
  if (valid.length <= maxPoints) return valid;
  const step = Math.ceil(valid.length / maxPoints);
  return valid.filter((_, i) => i % step === 0 || i === valid.length - 1);
}

function expandBoundsAroundCenter(
  center: LatLngTuple,
  radiusKm: number,
): L.LatLngBounds | null {
  if (!isValid(center)) return null;

  const latDelta = radiusKm / 111;
  const lngDelta =
    radiusKm / (111 * Math.cos((center[0] * Math.PI) / 180));
  return L.latLngBounds(
    [center[0] - latDelta, center[1] - lngDelta],
    [center[0] + latDelta, center[1] + lngDelta],
  );
}

function collectCameraPoints(options: MapCameraOptions): LatLngTuple[] {
  const { mode, points, route = [] } = options;
  const validPoints = filterValidLatLngs(points);

  switch (mode) {
    case "single":
      return validPoints.slice(0, 1);

    case "pickup-drop-preview": {
      if (validPoints.length >= 2) {
        const dist = haversineKm(validPoints[0], validPoints[1]);
        if (dist > 25 && route.length > 2) {
          return [
            validPoints[0],
            validPoints[1],
            ...decimateRoute(route, 12),
          ];
        }
        if (route.length > 2) {
          return [...validPoints, ...decimateRoute(route, 30)];
        }
        return validPoints;
      }
      return validPoints;
    }

    case "approach": {
      const subset = validPoints.slice(0, 2);
      const captain = subset[0];
      if (route.length > 2 && captain) {
        return [...subset, ...sampleRouteAhead(route, captain, 2, 12)];
      }
      return subset;
    }

    case "active-trip": {
      const captain = validPoints[0];
      const destination =
        validPoints.find(
          (p) => captain && (p[0] !== captain[0] || p[1] !== captain[1]),
        ) ?? validPoints[1];
      if (!captain) return validPoints;
      const ahead =
        route.length > 2
          ? sampleRouteAhead(route, captain, 5, 28)
          : destination
            ? [captain, destination]
            : [captain];
      return ahead.filter(isValid);
    }

    case "captain-nav-approach": {
      const captain = validPoints[0];
      const pickup = validPoints[1];
      if (captain && pickup && route.length > 2) {
        return [captain, pickup, ...sampleRouteAhead(route, captain, 2.5, 14)];
      }
      return validPoints.slice(0, 2);
    }

    case "captain-nav-active": {
      const captain = validPoints[0];
      const drop = validPoints[1];
      if (captain && route.length > 2) {
        return sampleRouteAhead(route, captain, 4, 22);
      }
      return captain && drop ? [captain, drop] : validPoints;
    }

    default:
      return validPoints;
  }
}

function sanitizeCameraPoints(points: LatLngTuple[]): LatLngTuple[] {
  return filterValidLatLngs(points);
}

function isBoundsSafe(bounds: L.LatLngBounds): boolean {
  if (!bounds.isValid()) return false;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  return (
    Number.isFinite(sw.lat) &&
    Number.isFinite(sw.lng) &&
    Number.isFinite(ne.lat) &&
    Number.isFinite(ne.lng)
  );
}

/** Build Leaflet bounds; expands degenerate/single-point sets. */
function createBoundsFromPoints(points: LatLngTuple[]): L.LatLngBounds | null {
  const valid = filterValidLatLngs(points);
  if (valid.length === 0) return null;

  if (valid.length === 1) {
    return expandBoundsAroundCenter(valid[0], 0.45);
  }

  let bounds = L.latLngBounds(valid);
  if (!isBoundsSafe(bounds)) {
    const center: LatLngTuple = [
      (valid[0][0] + valid[valid.length - 1][0]) / 2,
      (valid[0][1] + valid[valid.length - 1][1]) / 2,
    ];
    return expandBoundsAroundCenter(center, 0.45);
  }

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const latSpan = Math.abs(ne.lat - sw.lat);
  const lngSpan = Math.abs(ne.lng - sw.lng);

  if (latSpan < 1e-6 && lngSpan < 1e-6) {
    const center: LatLngTuple = [(sw.lat + ne.lat) / 2, (sw.lng + ne.lng) / 2];
    return expandBoundsAroundCenter(center, 0.45);
  }

  return bounds;
}

function flyOrFit(
  map: L.Map,
  bounds: L.LatLngBounds,
  opts: {
    padding: [number, number];
    maxZoom: number;
    minZoom: number;
    animate: boolean;
    targetZoom?: number;
  },
) {
  if (!isBoundsSafe(bounds) || !isMapRenderable(map)) return;

  const flyOpts: L.FitBoundsOptions & { duration?: number } = {
    padding: opts.padding,
    maxZoom: opts.maxZoom,
    animate: opts.animate,
    duration: opts.animate ? 0.85 : 0,
  };

  try {
    if (typeof map.flyToBounds === "function") {
      map.flyToBounds(bounds, flyOpts);
    } else {
      map.fitBounds(bounds, flyOpts);
    }
  } catch {
    const center = bounds.getCenter();
    const pt = normalizeLatLng([center.lat, center.lng]);
    if (!pt) return;
    const z = clampZoom(opts.targetZoom ?? 16, opts.minZoom, opts.maxZoom);
    try {
      map.setView(L.latLng(pt[0], pt[1]), z);
    } catch {
      // map tearing down
    }
  }

  const applyMinZoom = () => {
    const current = map.getZoom();
    const floor = opts.targetZoom
      ? Math.max(opts.minZoom, Math.min(opts.targetZoom, opts.maxZoom))
      : opts.minZoom;

    if (current < floor) {
      const center = bounds.getCenter();
      const c: LatLngTuple = [center.lat, center.lng];
      if (!isValid(c)) return;
      if (typeof map.flyTo === "function") {
        map.flyTo(c, floor, { animate: opts.animate, duration: 0.6 });
      } else {
        map.setView(c, floor);
      }
    }
  };

  if (opts.animate) {
    map.once("moveend", applyMinZoom);
    window.setTimeout(applyMinZoom, 950);
  } else {
    applyMinZoom();
  }
}

export function applyMapCamera(map: L.Map, options: MapCameraOptions): void {
  const {
    mode,
    padding = DEFAULT_PADDING,
    animate = true,
  } = options;

  const safeRoute = filterValidLatLngs(options.route ?? []);
  const cameraPoints = sanitizeCameraPoints(
    collectCameraPoints({ ...options, route: safeRoute }),
  );
  const { minZoom, maxZoom } = getModeZoomLimits(mode);

  if (cameraPoints.length === 0) return;

  const flyToCenter = (center: unknown, zoom: number) => {
    const pt = normalizeLatLng(center);
    if (!pt || !isMapRenderable(map)) return;

    const z = clampZoom(zoom, minZoom, maxZoom);
    const latlng = L.latLng(pt[0], pt[1]);
    if (!Number.isFinite(latlng.lat) || !Number.isFinite(latlng.lng)) return;

    try {
      if (typeof map.flyTo === "function") {
        map.flyTo(latlng, z, { animate, duration: 0.7 });
      } else {
        map.setView(latlng, z);
      }
    } catch {
      // Leaflet throws if coords are invalid or map is tearing down
    }
  };

  if (cameraPoints.length === 1) {
    flyToCenter(cameraPoints[0], clampZoom(16, minZoom, maxZoom));
    return;
  }

  if (mode === "pickup-drop-preview" && cameraPoints.length >= 2) {
    const dist = haversineKm(cameraPoints[0], cameraPoints[1]);
    const targetZoom = zoomForDistanceKm(dist);

    if (dist > 30) {
      const center: LatLngTuple = [
        (cameraPoints[0][0] + cameraPoints[1][0]) / 2,
        (cameraPoints[0][1] + cameraPoints[1][1]) / 2,
      ];
      if (!isValid(center)) return;
      const bounds = expandBoundsAroundCenter(
        center,
        Math.min(dist * 0.35, 8),
      );
      if (bounds) {
        flyOrFit(map, bounds, {
          padding,
          maxZoom,
          minZoom,
          animate,
          targetZoom,
        });
      }
      return;
    }
  }

  if (cameraPoints.length < 2) {
    flyToCenter(cameraPoints[0], clampZoom(16, minZoom, maxZoom));
    return;
  }

  const bounds = createBoundsFromPoints(cameraPoints);
  if (!bounds) {
    flyToCenter(cameraPoints[0], clampZoom(16, minZoom, maxZoom));
    return;
  }

  let targetZoom: number | undefined;

  if (mode === "pickup-drop-preview" && cameraPoints.length >= 2) {
    targetZoom = zoomForDistanceKm(
      haversineKm(cameraPoints[0], cameraPoints[1]),
    );
  }

  if (
    (mode === "approach" || mode === "captain-nav-approach") &&
    cameraPoints.length >= 2
  ) {
    const dist = haversineKm(cameraPoints[0], cameraPoints[1]);
    targetZoom = Math.max(minZoom, Math.min(maxZoom, zoomForDistanceKm(dist)));
    if (dist < 0.15) {
      const center: LatLngTuple = [
        (cameraPoints[0][0] + cameraPoints[1][0]) / 2,
        (cameraPoints[0][1] + cameraPoints[1][1]) / 2,
      ];
      if (isValid(center)) flyToCenter(center, 17);
      return;
    }
  }

  flyOrFit(map, bounds, {
    padding,
    maxZoom,
    minZoom,
    animate,
    targetZoom,
  });
}

export function rideStatusToCameraMode(
  status: string,
  role: "rider" | "captain",
): MapCameraMode {
  if (role === "captain") {
    return status === "IN_PROGRESS"
      ? "captain-nav-active"
      : "captain-nav-approach";
  }

  if (status === "IN_PROGRESS") return "active-trip";
  if (["ACCEPTED", "ARRIVING", "SEARCHING"].includes(status)) {
    return "approach";
  }
  return "approach";
}
