"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/debouncing/use-debounce";
import {
  searchLocations,
  reverseGeocode,
  LocationSuggestion,
} from "@/services/location/location.service";
import { cn } from "@/lib/utils";
import { Navigation } from "lucide-react";

interface LocationInputProps {
  placeholder: string;
  icon?: React.ReactNode;
  onSelect: (location: LocationSuggestion) => void;
  autoLocate?: boolean;
}

export default function LocationInput({
  placeholder,
  icon,
  onSelect,
  autoLocate = false,
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const locationWatchRef = useRef<number | null>(null);
  const locationTimeoutRef = useRef<number | null>(null);
  const activeLocationRequestRef = useRef(0);
  const hasAutoLocatedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }

      if (locationTimeoutRef.current !== null) {
        window.clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      return;
    }

    const searchTimer = window.setTimeout(() => {
      setLoading(true);
      searchLocations(debouncedQuery)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(searchTimer);
  }, [debouncedQuery]);

  function clearLocationTracking() {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }

    if (locationTimeoutRef.current !== null) {
      window.clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }

  function getDisplayLabel(location: LocationSuggestion) {
    const parts = location.displayName
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.slice(0, 2).join(", ") || location.displayName;
  }

  const fetchCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    activeLocationRequestRef.current += 1;
    const requestId = activeLocationRequestRef.current;
    let bestCoords: { latitude: number; longitude: number; accuracy: number } | null =
      null;

    clearLocationTracking();
    setLocating(true);

    const finalizeLocation = async (
      latitude: number,
      longitude: number,
      accuracy: number,
    ) => {
      try {
        const location = await reverseGeocode(latitude, longitude);

        if (requestId !== activeLocationRequestRef.current) return;

        if (location) {
          onSelect({
            ...location,
            lat: latitude,
            lng: longitude,
          });
          setQuery(getDisplayLabel(location));
          setSuggestions([]);
          setOpen(false);
          return;
        }

        setQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        onSelect({
          placeId: `${latitude},${longitude}`,
          displayName: `Current location (${Math.round(accuracy)}m accuracy)`,
          lat: latitude,
          lng: longitude,
        });
      } finally {
        clearLocationTracking();
        if (requestId === activeLocationRequestRef.current) {
          setLocating(false);
        }
      }
    };

    const applyPosition = (coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
    }) => {
      void finalizeLocation(coords.latitude, coords.longitude, coords.accuracy);
    };

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = Number(pos.coords.latitude);
        const longitude = Number(pos.coords.longitude);
        const accuracy = Number(pos.coords.accuracy ?? Number.POSITIVE_INFINITY);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        if (!bestCoords || accuracy < bestCoords.accuracy) {
          bestCoords = { latitude, longitude, accuracy };
        }

        if (accuracy <= 120) {
          applyPosition({ latitude, longitude, accuracy });
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message);

        if (bestCoords) {
          applyPosition(bestCoords);
          return;
        }

        clearLocationTracking();
        if (requestId === activeLocationRequestRef.current) {
          setLocating(false);
        }
        alert("Could not fetch your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );

    locationTimeoutRef.current = window.setTimeout(() => {
      if (bestCoords) {
        applyPosition(bestCoords);
        return;
      }

      clearLocationTracking();
      setLocating(false);
      alert("Could not fetch your location");
    }, 12000);
  }, [onSelect]);

  // Auto-fetch current location on mount if enabled
  useEffect(() => {
    if (autoLocate && !hasAutoLocatedRef.current) {
      hasAutoLocatedRef.current = true;
      void fetchCurrentLocation();
    }
  }, [autoLocate, fetchCurrentLocation]);

  function handleSelect(suggestion: LocationSuggestion) {
    setQuery(getDisplayLabel(suggestion));
    setSuggestions([]);
    setOpen(false);
    onSelect(suggestion);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
        {icon}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);

            if (value.trim().length < 3) {
              setSuggestions([]);
              setOpen(false);
            }
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
        />
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
        )}
        {autoLocate && !loading && (
          <button
            type="button"
            onClick={fetchCurrentLocation}
            disabled={locating}
            className="shrink-0 p-1 text-neutral-500 hover:text-pink-500 transition disabled:opacity-50"
            title="Use current location"
          >
            <Navigation className={cn("h-4 w-4", locating && "animate-spin")} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-4 py-3 text-sm text-neutral-700 hover:bg-pink-50 border-b border-neutral-100 last:border-0"
            >
              <span className="font-medium">{getDisplayLabel(s)}</span>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {s.displayName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
