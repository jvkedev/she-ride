"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentLocation,
  subscribeLiveLocation,
  type GeolocationResult,
  type LocationFetchMode,
  type LocationSource,
} from "@/lib/maps/geolocation";

export type LiveLocationState = {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: LocationSource;
  isLiveGps: boolean;
  updatedAt: number;
};

function toState(result: GeolocationResult): LiveLocationState {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    accuracy: result.accuracy,
    source: result.source,
    isLiveGps: result.source === "gps" && result.accuracy <= 250,
    updatedAt: Date.now(),
  };
}

type UseLiveLocationOptions = {
  /** Start continuous GPS watch on mount */
  watch?: boolean;
  /** One-shot fetch on mount */
  fetchOnMount?: boolean;
  mode?: LocationFetchMode;
};

export function useLiveLocation(options: UseLiveLocationOptions = {}) {
  const { watch = false, fetchOnMount = false, mode = "live" } = options;

  const [location, setLocation] = useState<LiveLocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentLocation({
        mode,
        overallTimeoutMs: 20_000,
      });
      if (id !== requestRef.current) return;
      setLocation(toState(result));
    } catch (err) {
      if (id !== requestRef.current) return;
      setError(
        err instanceof Error ? err.message : "Could not get your location.",
      );
    } finally {
      if (id === requestRef.current) setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (!fetchOnMount) return;
    void refresh();
  }, [fetchOnMount, refresh]);

  useEffect(() => {
    if (!watch) return;

    const stop = subscribeLiveLocation(
      (result) => {
        setLocation(toState(result));
        setError(null);
      },
      () => {},
    );

    return stop;
  }, [watch]);

  return { location, loading, error, refresh, setLocation };
}
