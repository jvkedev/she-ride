export type LocationSource = "gps" | "cached-gps" | "network" | "ip";

export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: LocationSource;
  timestamp: number;
};

export type LocationFetchMode = "live" | "balanced";

export type GetCurrentLocationOptions = {
  overallTimeoutMs?: number;
  mode?: LocationFetchMode;
  allowApproximateFallback?: boolean;
};

/** Rider pickup — same watch duration as captain dashboard settle time. */
export const RIDER_LOCATION_TIMEOUT_MS = 20_000;

/** Captain dashboard uses the same options (see live-map.tsx). */
export const CAPTAIN_GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 30_000,
  maximumAge: 0,
};

export class GeolocationFailure extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "GeolocationFailure";
    this.code = code;
  }
}

export type GeolocationPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

const LOG_PREFIX = "[SheRide][geolocation]";

export const POOR_ACCURACY_M = 1000;

export function getLocationSourceLabel(source: LocationSource): string {
  switch (source) {
    case "gps":
      return "GPS Location";
    case "cached-gps":
      return "Cached GPS Location";
    case "network":
      return "Network Location";
    case "ip":
      return "IP Location";
    default:
      return "Unknown";
  }
}

function log(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (data !== undefined) console.info(LOG_PREFIX, message, data);
  else console.info(LOG_PREFIX, message);
}

export function getGeolocationErrorMessage(
  error: GeolocationPositionError | { code: number; message?: string },
): string {
  switch (error.code) {
    case 1:
      return "Location permission denied. Click the lock icon in your browser address bar, allow location access, then try again.";
    case 2:
      return "Location unavailable. Enable location services on your device and try again.";
    case 3:
      return "Could not get your location in time. Enable GPS, allow location access, and try again.";
    default:
      return error.message || "Could not determine your current location.";
  }
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.geolocation;
}

export async function queryGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unsupported";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "granted") return "granted";
    if (status.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "unsupported";
  }
}

/**
 * Minimal parsing — identical logic to captain live map.
 * No spoof lists, no stale-cache rejection, no early exit.
 */
export function readCaptainStylePosition(
  pos: GeolocationPosition,
): GeolocationResult | null {
  const latitude = Number(pos.coords.latitude);
  const longitude = Number(pos.coords.longitude);
  const accuracy = Number(pos.coords.accuracy ?? 9999);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const source: LocationSource = accuracy > 1500 ? "network" : "gps";

  return {
    latitude,
    longitude,
    accuracy,
    source,
    timestamp: pos.timestamp || Date.now(),
  };
}

function logLocationResult(result: GeolocationResult, context: string) {
  log(context, {
    latitude: result.latitude,
    longitude: result.longitude,
    accuracyM: Math.round(result.accuracy),
    source: result.source,
    sourceLabel: getLocationSourceLabel(result.source),
    updateTime: new Date(result.timestamp).toISOString(),
  });
}

/**
 * Captain dashboard: continuous watch, always keep the latest non-network fix.
 * Returns unsubscribe cleanup.
 */
export function subscribeLiveLocation(
  onUpdate: (result: GeolocationResult) => void,
  onError?: (err: GeolocationPositionError) => void,
): () => void {
  if (!isGeolocationSupported()) return () => {};

  log("subscribeLiveLocation started (captain-style)");

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const result = readCaptainStylePosition(pos);
      if (result && result.source !== "network") {
        logLocationResult(result, "subscribeLiveLocation update");
        onUpdate(result);
      }
    },
    (err) => {
      log("subscribeLiveLocation error", {
        code: err.code,
        message: err.message,
      });
      onError?.(err);
    },
    CAPTAIN_GPS_OPTIONS,
  );

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const result = readCaptainStylePosition(pos);
      if (result && result.source !== "network") {
        logLocationResult(result, "subscribeLiveLocation initial");
        onUpdate(result);
      }
    },
    () => {},
    CAPTAIN_GPS_OPTIONS,
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
    log("subscribeLiveLocation stopped");
  };
}

/**
 * One-shot rider pickup: run the same watch as captain, wait for updates,
 * then use the **latest** fix (not the first). Captain map works because
 * GPS keeps refining — we wait for that refinement window.
 */
export function waitForCaptainStyleLocation(
  timeoutMs = RIDER_LOCATION_TIMEOUT_MS,
): Promise<GeolocationResult> {
  if (!isGeolocationSupported()) {
    return Promise.reject(
      new Error(
        "Geolocation is not supported in this browser. Enter your address manually.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    let latest: GeolocationResult | null = null;
    let bestAccuracy: GeolocationResult | null = null;
    let updateCount = 0;
    let settled = false;

    const finish = (result: GeolocationResult) => {
      if (settled) return;
      settled = true;
      stop();
      clearTimeout(timer);
      logLocationResult(result, "waitForCaptainStyleLocation resolved");
      resolve(result);
    };

    const fail = (err: GeolocationFailure) => {
      if (settled) return;
      settled = true;
      stop();
      clearTimeout(timer);
      reject(err);
    };

    const stop = subscribeLiveLocation((result) => {
      latest = result;
      updateCount += 1;

      if (!bestAccuracy || result.accuracy < bestAccuracy.accuracy) {
        bestAccuracy = result;
      }

      log("captain-style update received", {
        updateCount,
        accuracyM: Math.round(result.accuracy),
        latitude: result.latitude,
        longitude: result.longitude,
      });
    });

    const timer = setTimeout(() => {
      // Prefer the most accurate fix in the window (refined GPS), not the first
      // Wi‑Fi reading — captain dashboard converges the same way over time.
      const pick = bestAccuracy ?? latest;
      if (pick) {
        log("captain-style wait complete", {
          updateCount,
          accuracyM: Math.round(pick.accuracy),
          latitude: pick.latitude,
          longitude: pick.longitude,
        });
        finish(pick);
        return;
      }
      fail(
        new GeolocationFailure(
          3,
          "Could not get your location. Enable GPS/Location, allow browser access, then try again.",
        ),
      );
    }, timeoutMs);
  });
}

export async function getCurrentLocation(
  options?: GetCurrentLocationOptions,
): Promise<GeolocationResult> {
  const {
    overallTimeoutMs = RIDER_LOCATION_TIMEOUT_MS,
    mode = "live",
  } = options ?? {};

  const permission = await queryGeolocationPermission();
  if (permission === "denied") {
    throw new GeolocationFailure(1, getGeolocationErrorMessage({ code: 1 }));
  }

  log("getCurrentLocation started", { mode, overallTimeoutMs });

  if (mode === "live") {
    return waitForCaptainStyleLocation(
      Math.min(overallTimeoutMs, RIDER_LOCATION_TIMEOUT_MS),
    );
  }

  return waitForCaptainStyleLocation(
    Math.min(overallTimeoutMs, RIDER_LOCATION_TIMEOUT_MS),
  );
}

/** Rider booking pickup — same pipeline as captain dashboard GPS. */
export function getRiderPickupLocation(
  timeoutMs = RIDER_LOCATION_TIMEOUT_MS,
): Promise<GeolocationResult> {
  return waitForCaptainStyleLocation(timeoutMs);
}

export function watchCurrentPosition(options?: {
  timeoutMs?: number;
}): Promise<GeolocationResult> {
  return waitForCaptainStyleLocation(
    options?.timeoutMs ?? RIDER_LOCATION_TIMEOUT_MS,
  );
}

// Legacy helpers — kept for dev indicator / accuracy warnings in UI.
export function isSpoofedDefaultLocation(_lat: number, _lng: number): boolean {
  return false;
}

export function isAcceptablePickupFix(result: GeolocationResult): boolean {
  return result.source !== "network" && result.source !== "ip";
}
