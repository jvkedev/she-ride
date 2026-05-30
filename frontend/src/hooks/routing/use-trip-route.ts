"use client";

import { useEffect, useState } from "react";
import {
  getRouteWithMeta,
  getInstantPreviewRoute,
} from "@/services/routing/routing.service";

type Coords = { lat: number; lng: number } | null;

function isValidCoords(c: Coords): c is { lat: number; lng: number } {
  return (
    c != null &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng)
  );
}

export function useTripRoute(pickup: Coords, drop: Coords) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | undefined>();
  const [durationMin, setDurationMin] = useState<number | undefined>();
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isValidCoords(pickup) || !isValidCoords(drop)) {
      setRoute([]);
      setDistanceKm(undefined);
      setDurationMin(undefined);
      setIsPreview(false);
      setIsLoading(false);
      return;
    }

    const preview = getInstantPreviewRoute(
      pickup.lat,
      pickup.lng,
      drop.lat,
      drop.lng,
    );

    setRoute(preview.coordinates);
    setDistanceKm(preview.distanceKm);
    setDurationMin(preview.durationMinutes);
    setIsPreview(true);
    setIsLoading(true);

    let cancelled = false;

    getRouteWithMeta(pickup.lat, pickup.lng, drop.lat, drop.lng).then(
      (result) => {
        if (cancelled) return;
        if (result.coordinates.length > 1) {
          setRoute(result.coordinates);
          setDistanceKm(result.distanceKm);
          setDurationMin(result.durationMinutes);
          setIsPreview(Boolean(result.isPreview));
        }
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng]);

  return { route, distanceKm, durationMin, isPreview, isLoading };
}
