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
  /** When false (default for pickup), never use network/IP fallbacks. */
  allowApproximateFallback?: boolean;
};

/** Thrown when geolocation fails; `code` matches GeolocationPositionError. */
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

/** Pickup/SOS: reject fixes worse than this. */
export const POOR_ACCURACY_M = 1000;

/** Ideal accuracy before early return. */
const TARGET_GPS_ACCURACY_M = 80;

/** Max accuracy to accept for pickup (live mode). */
const LIVE_MAX_ACCEPT_ACCURACY_M = 500;

/** Minimum time to keep watching GPS before accepting a mediocre fix. */
const LIVE_MIN_WATCH_MS = 12_000;

const GPS_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0,
};

const CACHED_GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5 * 60 * 1000,
};

const NETWORK_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 0,
};

/**
 * Browser/ISP defaults that appear when real GPS is unavailable (central Delhi).
 * Reject these so we keep waiting for a real device fix.
 */
const SPOOFED_DEFAULT_COORDS: Array<[number, number]> = [
  [28.6139, 77.209], // old app default (India Gate)
  [28.593, 77.2197], // Lodhi Garden
  [28.5925, 77.22],
  [28.6129, 77.2295],
  [28.7041, 77.1025], // common IP-geocode center (Connaught Place area)
];

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

export function isSpoofedDefaultLocation(lat: number, lng: number): boolean {
  return SPOOFED_DEFAULT_COORDS.some(
    ([dLat, dLng]) =>
      Math.abs(lat - dLat) < 0.008 && Math.abs(lng - dLng) < 0.008,
  );
}

export function isAcceptablePickupFix(result: GeolocationResult): boolean {
  if (result.source === "network" || result.source === "ip") return false;
  if (result.accuracy > LIVE_MAX_ACCEPT_ACCURACY_M) return false;
  if (isSpoofedDefaultLocation(result.latitude, result.longitude)) return false;
  return true;
}

function log(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (data !== undefined) {
    console.info(LOG_PREFIX, message, data);
  } else {
    console.info(LOG_PREFIX, message);
  }
}

function logWarn(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (data !== undefined) {
    console.warn(LOG_PREFIX, message, data);
  } else {
    console.warn(LOG_PREFIX, message);
  }
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
      return "Could not get a precise GPS fix. Enable GPS on your device, move near a window or outdoors, then tap Use current location again.";
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
    log("permission state", status.state);
    if (status.state === "granted") return "granted";
    if (status.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "unsupported";
  }
}

function classifyBrowserFix(
  pos: GeolocationPosition,
  requestedHighAccuracy: boolean,
  maximumAgeMs: number,
): LocationSource {
  if (!requestedHighAccuracy) return "network";
  if (maximumAgeMs > 0) return "cached-gps";

  const accuracy = pos.coords.accuracy ?? 9999;
  // Browsers often return Wi‑Fi/cell fixes through the high-accuracy API.
  if (accuracy > 1500) return "network";

  return "gps";
}

function readPosition(
  pos: GeolocationPosition,
  requestedHighAccuracy: boolean,
  maximumAgeMs: number,
): GeolocationResult | null {
  const latitude = Number(pos.coords.latitude);
  const longitude = Number(pos.coords.longitude);
  const accuracy = Number(pos.coords.accuracy ?? 9999);
  const source = classifyBrowserFix(pos, requestedHighAccuracy, maximumAgeMs);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (isSpoofedDefaultLocation(latitude, longitude)) {
    logWarn("rejecting known default/spoof coordinates", {
      latitude,
      longitude,
      accuracyM: Math.round(accuracy),
      source,
    });
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy,
    source,
    timestamp: pos.timestamp || Date.now(),
  };
}

function isBetterReading(
  next: GeolocationResult,
  current: GeolocationResult | null,
): boolean {
  if (!current) return true;
  if (next.source === "gps" && current.source !== "gps") return true;
  if (next.source !== "gps" && current.source === "gps") return false;
  return next.accuracy < current.accuracy;
}

function logLocationResult(result: GeolocationResult, context: string) {
  log(context, {
    latitude: result.latitude,
    longitude: result.longitude,
    accuracyM: Math.round(result.accuracy),
    source: result.source,
    sourceLabel: getLocationSourceLabel(result.source),
    timestamp: result.timestamp,
  });
}

function getCurrentPositionOnce(
  options: PositionOptions,
  sourceOverride?: LocationSource,
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    log("getCurrentPosition attempt", {
      enableHighAccuracy: options.enableHighAccuracy,
      timeout: options.timeout,
      maximumAge: options.maximumAge,
      sourceOverride,
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let result = readPosition(
          pos,
          options.enableHighAccuracy ?? false,
          options.maximumAge ?? 0,
        );
        if (!result) {
          reject(new Error("Invalid or spoofed coordinates from browser."));
          return;
        }
        if (sourceOverride) {
          result = { ...result, source: sourceOverride };
        }
        logLocationResult(result, "getCurrentPosition success");
        resolve(result);
      },
      (err) => {
        logWarn("getCurrentPosition failed", {
          code: err.code,
          message: err.message,
        });
        reject(err);
      },
      options,
    );
  });
}

function isAcceptableLiveFix(
  result: GeolocationResult,
  elapsedMs: number,
): boolean {
  if (!isAcceptablePickupFix(result)) return false;
  if (result.accuracy <= TARGET_GPS_ACCURACY_M) return true;
  if (
    result.accuracy <= LIVE_MAX_ACCEPT_ACCURACY_M &&
    elapsedMs >= LIVE_MIN_WATCH_MS &&
    result.source === "gps"
  ) {
    return true;
  }
  return false;
}

/**
 * High-accuracy GPS watch — keeps refining; rejects network/spoofed fixes.
 */
async function watchForGpsFix(
  overallTimeoutMs: number,
): Promise<GeolocationResult | null> {
  if (overallTimeoutMs < 3000) return null;

  return new Promise((resolve) => {
    let best: GeolocationResult | null = null;
    let watchId: number | null = null;
    let settled = false;
    let overallTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const finish = (result: GeolocationResult | null) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (overallTimer !== undefined) clearTimeout(overallTimer);
      resolve(result);
    };

    const considerFinish = () => {
      if (!best) return;
      const elapsed = Date.now() - startedAt;
      if (isAcceptableLiveFix(best, elapsed)) {
        finish(best);
      }
    };

    const onPosition = (pos: GeolocationPosition) => {
      const candidate = readPosition(pos, true, 0);
      if (!candidate) return;

      if (candidate.source === "network") {
        logWarn("ignoring network-classified fix during GPS watch", candidate);
        return;
      }

      if (isBetterReading(candidate, best)) {
        best = candidate;
        logLocationResult(best, "watchPosition update");
      }
      considerFinish();
    };

    watchId = navigator.geolocation.watchPosition(
      onPosition,
      (err) => {
        logWarn("watchPosition error (non-fatal)", {
          code: err.code,
          message: err.message,
        });
      },
      GPS_POSITION_OPTIONS,
    );

    getCurrentPositionOnce(GPS_POSITION_OPTIONS)
      .then((result) => {
        if (result.source !== "network" && isBetterReading(result, best)) {
          best = result;
        }
        considerFinish();
      })
      .catch(() => {});

    overallTimer = setTimeout(() => {
      if (best && isAcceptableLiveFix(best, Date.now() - startedAt)) {
        finish(best);
        return;
      }
      logWarn("GPS watch ended without acceptable fix", {
        bestAccuracyM: best ? Math.round(best.accuracy) : null,
        bestSource: best?.source,
      });
      finish(null);
    }, overallTimeoutMs);
  });
}

async function fetchIpFallbackLocation(): Promise<GeolocationResult | null> {
  log("attempting IP fallback (last resort only)");
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      latitude?: number;
      longitude?: number;
    };

    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      return null;
    }

    if (isSpoofedDefaultLocation(data.latitude, data.longitude)) {
      logWarn("IP fallback returned known Delhi default — discarding");
      return null;
    }

    const result: GeolocationResult = {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 10_000,
      source: "ip",
      timestamp: Date.now(),
    };

    logLocationResult(result, "IP fallback success");
    return result;
  } catch (err) {
    logWarn("IP fallback failed", err);
    return null;
  }
}

/** Pickup/SOS: GPS only — no network, cached, or IP shortcuts. */
async function acquireLiveGpsOnly(
  overallTimeoutMs: number,
): Promise<GeolocationResult> {
  log("live mode: GPS-only (no network/IP fallbacks)");

  const gpsTimeout = Math.min(overallTimeoutMs, 60_000);

  const watchResult = await watchForGpsFix(gpsTimeout);
  if (watchResult) {
    logLocationResult(watchResult, "live GPS fix accepted");
    return watchResult;
  }

  try {
    const direct = await getCurrentPositionOnce(GPS_POSITION_OPTIONS);
    if (direct.source !== "network" && isAcceptablePickupFix(direct)) {
      logLocationResult(direct, "live direct GPS fix accepted");
      return direct;
    }
    logWarn("direct GPS fix rejected", direct);
  } catch (err) {
    if (
      err instanceof GeolocationPositionError &&
      err.code === 1
    ) {
      throw err;
    }
  }

  throw new GeolocationFailure(
    3,
    "Could not get a precise GPS fix. Turn on Location/GPS in Windows settings, allow browser location access, move outdoors, then try again.",
  );
}

/** Map preview: GPS first, then cached/network/IP only if explicitly allowed. */
async function acquireWithFallbacks(
  overallTimeoutMs: number,
  allowApproximateFallback: boolean,
): Promise<GeolocationResult> {
  const gps = await watchForGpsFix(Math.min(overallTimeoutMs, 30_000));
  if (gps) return gps;

  if (!allowApproximateFallback) {
    throw new GeolocationFailure(3, getGeolocationErrorMessage({ code: 3 }));
  }

  try {
    const cached = await getCurrentPositionOnce(CACHED_GPS_OPTIONS, "cached-gps");
    if (isAcceptablePickupFix(cached)) return cached;
  } catch {
    /* continue */
  }

  try {
    const network = await getCurrentPositionOnce(
      NETWORK_POSITION_OPTIONS,
      "network",
    );
    logLocationResult(network, "balanced network fallback");
    return network;
  } catch {
    /* continue */
  }

  const ip = await fetchIpFallbackLocation();
  if (ip) return ip;

  throw new GeolocationFailure(3, getGeolocationErrorMessage({ code: 3 }));
}

/**
 * Primary API — use `mode: "live"` for pickup & SOS (strict GPS, no Delhi IP/network).
 */
export async function getCurrentLocation(
  options?: GetCurrentLocationOptions,
): Promise<GeolocationResult> {
  const {
    overallTimeoutMs = 60_000,
    mode = "live",
    allowApproximateFallback = mode !== "live",
  } = options ?? {};

  if (!isGeolocationSupported()) {
    throw new Error(
      "Geolocation is not supported in this browser. Enter your address manually.",
    );
  }

  const permission = await queryGeolocationPermission();
  if (permission === "denied") {
    throw new GeolocationFailure(1, getGeolocationErrorMessage({ code: 1 }));
  }

  log("getCurrentLocation started", {
    permission,
    mode,
    overallTimeoutMs,
    allowApproximateFallback,
  });

  if (mode === "live") {
    return acquireLiveGpsOnly(overallTimeoutMs);
  }

  return acquireWithFallbacks(overallTimeoutMs, allowApproximateFallback);
}

/** Continuous high-accuracy GPS updates (ride tracking, SOS). */
export function subscribeLiveLocation(
  onUpdate: (result: GeolocationResult) => void,
  onError?: (err: GeolocationPositionError) => void,
): () => void {
  if (!isGeolocationSupported()) {
    return () => {};
  }

  log("subscribeLiveLocation started");

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const result = readPosition(pos, true, 0);
      if (result && result.source !== "network") {
        logLocationResult(result, "subscribeLiveLocation update");
        onUpdate(result);
      }
    },
    (err) => {
      logWarn("subscribeLiveLocation error", {
        code: err.code,
        message: err.message,
      });
      onError?.(err);
    },
    GPS_POSITION_OPTIONS,
  );

  getCurrentPositionOnce(GPS_POSITION_OPTIONS)
    .then((result) => {
      if (result.source !== "network") onUpdate(result);
    })
    .catch(() => {});

  return () => {
    navigator.geolocation.clearWatch(watchId);
    log("subscribeLiveLocation stopped");
  };
}

export function watchCurrentPosition(options?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
}): Promise<GeolocationResult> {
  return getCurrentLocation({
    overallTimeoutMs: options?.timeoutMs ?? 60_000,
    mode: options?.highAccuracy === false ? "balanced" : "live",
    allowApproximateFallback: options?.highAccuracy === false,
  });
}
