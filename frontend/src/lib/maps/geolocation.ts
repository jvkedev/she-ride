export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: "cached" | "low-accuracy" | "high-accuracy" | "watch";
};

export type LocationFetchMode = "live" | "balanced";

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

/** IP/network fixes are often >1km; GPS fixes are usually <100m. */
const LIVE_GPS_MAX_ACCURACY_M = 250;
const BALANCED_ACCEPT_ACCURACY_M = 150;

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
      return "Location request timed out. Move near a window, enable GPS/Wi‑Fi, or try again.";
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

function readPosition(
  pos: GeolocationPosition,
  source: GeolocationResult["source"],
): GeolocationResult | null {
  const latitude = Number(pos.coords.latitude);
  const longitude = Number(pos.coords.longitude);
  const accuracy = Number(pos.coords.accuracy ?? 9999);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude, accuracy, source };
}

function isBetterReading(
  next: GeolocationResult,
  current: GeolocationResult | null,
): boolean {
  if (!current) return true;
  return next.accuracy < current.accuracy;
}

function isLiveGpsQuality(accuracy: number): boolean {
  return accuracy <= LIVE_GPS_MAX_ACCURACY_M;
}

type PositionAttemptOptions = {
  enableHighAccuracy: boolean;
  timeoutMs: number;
  maximumAgeMs: number;
};

function getCurrentPositionOnce(
  options: PositionAttemptOptions,
  source: GeolocationResult["source"],
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    log("getCurrentPosition attempt", {
      source,
      enableHighAccuracy: options.enableHighAccuracy,
      timeoutMs: options.timeoutMs,
      maximumAgeMs: options.maximumAgeMs,
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = readPosition(pos, source);
        if (!result) {
          reject(new Error("Invalid coordinates from browser."));
          return;
        }
        log("getCurrentPosition success", result);
        resolve(result);
      },
      (err) => {
        logWarn("getCurrentPosition failed", {
          code: err.code,
          message: err.message,
          source,
        });
        reject(err);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeoutMs,
        maximumAge: options.maximumAgeMs,
      },
    );
  });
}

async function watchForBestPosition(options: {
  overallTimeoutMs: number;
  targetAccuracyM: number;
  minWatchMs: number;
  maxStaleAccuracyM: number;
  initialBest: GeolocationResult | null;
}): Promise<GeolocationResult | null> {
  const {
    overallTimeoutMs,
    targetAccuracyM,
    minWatchMs,
    maxStaleAccuracyM,
    initialBest,
  } = options;

  if (overallTimeoutMs < 2000) return initialBest;

  return new Promise((resolve) => {
    let best = initialBest;
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
      if (elapsed >= minWatchMs && best.accuracy <= targetAccuracyM) {
        finish(best);
      }
    };

    const onPosition = (pos: GeolocationPosition) => {
      const candidate = readPosition(pos, "watch");
      if (!candidate) return;
      if (candidate.accuracy > maxStaleAccuracyM && best) return;
      if (isBetterReading(candidate, best)) {
        best = candidate;
        log("watch position", best);
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
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 60000,
      },
    );

    getCurrentPositionOnce(
      {
        enableHighAccuracy: true,
        timeoutMs: Math.min(25000, overallTimeoutMs),
        maximumAgeMs: 0,
      },
      "high-accuracy",
    )
      .then((result) => {
        if (isBetterReading(result, best)) best = result;
        considerFinish();
      })
      .catch(() => {});

    overallTimer = setTimeout(() => finish(best), overallTimeoutMs);
  });
}

/** GPS-first: no cached/IP shortcut; waits for device GPS when possible. */
async function getLiveLocation(
  overallTimeoutMs: number,
): Promise<GeolocationResult> {
  const deadline = Date.now() + overallTimeoutMs;
  let best: GeolocationResult | null = null;

  const recordBest = (candidate: GeolocationResult) => {
    if (isBetterReading(candidate, best)) {
      best = candidate;
      log("live best updated", best);
    }
  };

  const timeLeft = () => Math.max(deadline - Date.now(), 0);

  const tryGps = async (
    enableHighAccuracy: boolean,
    source: GeolocationResult["source"],
  ) => {
    const remaining = timeLeft();
    if (remaining < 1500) return null;
    try {
      const result = await getCurrentPositionOnce(
        {
          enableHighAccuracy,
          timeoutMs: Math.min(enableHighAccuracy ? 28000 : 18000, remaining),
          maximumAgeMs: 0,
        },
        source,
      );
      recordBest(result);
      if (isLiveGpsQuality(result.accuracy)) return result;
      return result;
    } catch (err) {
      if (
        (err instanceof GeolocationPositionError ||
          err instanceof GeolocationFailure) &&
        err.code === 1
      ) {
        throw err;
      }
      return null;
    }
  };

  log("getLiveLocation: GPS-first acquisition");

  const watchResult = await watchForBestPosition({
    overallTimeoutMs: Math.min(35000, timeLeft()),
    targetAccuracyM: 80,
    minWatchMs: 2000,
    maxStaleAccuracyM: 5000,
    initialBest: null,
  });

  if (watchResult && isLiveGpsQuality(watchResult.accuracy)) {
    log("using live GPS watch", watchResult);
    return watchResult;
  }
  if (watchResult) recordBest(watchResult);

  const highAcc = await tryGps(true, "high-accuracy");
  if (highAcc && isLiveGpsQuality(highAcc.accuracy)) {
    log("using live high-accuracy fix", highAcc);
    return highAcc;
  }

  if (best && isLiveGpsQuality(best.accuracy)) {
    log("using best live GPS", best);
    return best;
  }

  const lowAcc = await tryGps(false, "low-accuracy");
  if (lowAcc && isLiveGpsQuality(lowAcc.accuracy)) {
    log("using live low-accuracy GPS-quality fix", lowAcc);
    return lowAcc;
  }

  if (best) {
    logWarn("using approximate fix (enable GPS for better accuracy)", best);
    return best;
  }

  throw new GeolocationFailure(3, getGeolocationErrorMessage({ code: 3 }));
}

/** Faster reads for map preview; may use recent cache. */
async function getBalancedLocation(
  overallTimeoutMs: number,
): Promise<GeolocationResult> {
  const deadline = Date.now() + overallTimeoutMs;
  let best: GeolocationResult | null = null;

  const recordBest = (candidate: GeolocationResult) => {
    if (isBetterReading(candidate, best)) best = candidate;
  };

  const timeLeft = () => Math.max(deadline - Date.now(), 0);

  const tryOnce = async (
    attempt: PositionAttemptOptions,
    source: GeolocationResult["source"],
  ): Promise<GeolocationResult | null> => {
    const remaining = timeLeft();
    if (remaining < 1000) return null;
    try {
      const result = await getCurrentPositionOnce(
        { ...attempt, timeoutMs: Math.min(attempt.timeoutMs, remaining) },
        source,
      );
      recordBest(result);
      return result;
    } catch (err) {
      if (
        (err instanceof GeolocationPositionError ||
          err instanceof GeolocationFailure) &&
        err.code === 1
      ) {
        throw err;
      }
      return null;
    }
  };

  const cached = await tryOnce(
    {
      enableHighAccuracy: false,
      timeoutMs: 10000,
      maximumAgeMs: 2 * 60 * 1000,
    },
    "cached",
  );
  if (cached && cached.accuracy <= BALANCED_ACCEPT_ACCURACY_M) return cached;

  const refined = await watchForBestPosition({
    overallTimeoutMs: timeLeft(),
    targetAccuracyM: 120,
    minWatchMs: 1500,
    maxStaleAccuracyM: 8000,
    initialBest: best,
  });
  if (refined) return refined;
  if (best) return best;

  const last = await tryOnce(
    {
      enableHighAccuracy: false,
      timeoutMs: 12000,
      maximumAgeMs: 5 * 60 * 1000,
    },
    "cached",
  );
  if (last) return last;

  throw new GeolocationFailure(3, getGeolocationErrorMessage({ code: 3 }));
}

/**
 * Primary API — use `mode: "live"` for pickup & SOS (GPS, not IP).
 */
export async function getCurrentLocation(options?: {
  overallTimeoutMs?: number;
  mode?: LocationFetchMode;
}): Promise<GeolocationResult> {
  const { overallTimeoutMs = 45000, mode = "live" } = options ?? {};

  if (!isGeolocationSupported()) {
    throw new Error(
      "Geolocation is not supported in this browser. Enter your address manually.",
    );
  }

  const permission = await queryGeolocationPermission();
  if (permission === "denied") {
    throw new GeolocationFailure(1, getGeolocationErrorMessage({ code: 1 }));
  }

  log("getCurrentLocation started", { permission, mode });

  if (mode === "live") {
    return getLiveLocation(overallTimeoutMs);
  }
  return getBalancedLocation(overallTimeoutMs);
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
      const result = readPosition(pos, "watch");
      if (result) onUpdate(result);
    },
    (err) => {
      logWarn("subscribeLiveLocation error", {
        code: err.code,
        message: err.message,
      });
      onError?.(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 60000,
    },
  );

  getCurrentPositionOnce(
    {
      enableHighAccuracy: true,
      timeoutMs: 25000,
      maximumAgeMs: 0,
    },
    "high-accuracy",
  )
    .then(onUpdate)
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
    overallTimeoutMs: options?.timeoutMs ?? 45000,
    mode: options?.highAccuracy === false ? "balanced" : "live",
  });
}
