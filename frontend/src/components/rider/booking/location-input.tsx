"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { useDebounce } from "@/hooks/debouncing/use-debounce";

import {

  searchLocations,

  reverseGeocode,

  LocationSuggestion,

} from "@/services/location/location.service";

import {

  GeolocationFailure,

  getCurrentLocation,

  getGeolocationErrorMessage,

  isGeolocationSupported,

  queryGeolocationPermission,

} from "@/lib/maps/geolocation";

import { normalizeLatLng } from "@/lib/maps/map-camera";

import { cn } from "@/lib/utils";

import { MapPin, Navigation } from "lucide-react";



const LOG_PREFIX = "[SheRide][location-input]";



function log(message: string, data?: unknown) {

  if (process.env.NODE_ENV === "production") return;

  if (data !== undefined) {

    console.info(LOG_PREFIX, message, data);

  } else {

    console.info(LOG_PREFIX, message);

  }

}



interface LocationInputProps {

  placeholder: string;

  icon?: React.ReactNode;

  value?: LocationSuggestion | null;

  onSelect: (location: LocationSuggestion) => void;

  showGpsIcon?: boolean;

  showCurrentLocationButton?: boolean;

  currentLocationLabel?: string;

  autoLocateOnMount?: boolean;

}



function getDisplayLabel(location: LocationSuggestion) {

  const parts = location.displayName

    .split(",")

    .map((part) => part.trim())

    .filter(Boolean);



  return parts.slice(0, 2).join(", ") || location.displayName;

}



function geolocationErrorMessage(err: unknown): string {

  if (err instanceof GeolocationFailure) {

    return err.message;

  }

  if (err instanceof GeolocationPositionError) {

    return getGeolocationErrorMessage(err);

  }

  if (err instanceof Error) {

    return err.message;

  }

  return getGeolocationErrorMessage({ code: 0 });

}



export default function LocationInput({

  placeholder,

  icon,

  value,

  onSelect,

  showGpsIcon = false,

  showCurrentLocationButton = false,

  currentLocationLabel = "Use current location",

  autoLocateOnMount = false,

}: LocationInputProps) {

  const [query, setQuery] = useState("");

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [locating, setLocating] = useState(false);

  const [locationError, setLocationError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 350);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeRequestRef = useRef(0);
  const locatingRef = useRef(false);
  const hasAutoLocatedRef = useRef(false);



  useEffect(() => {

    if (value?.displayName) {

      setQuery(getDisplayLabel(value));

    }

  }, [value?.placeId, value?.displayName]);



  useEffect(() => {

    function handleClickOutside(e: MouseEvent) {

      if (

        wrapperRef.current &&

        !wrapperRef.current.contains(e.target as Node)

      ) {

        setOpen(false);

      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);



  useEffect(() => {

    if (debouncedQuery.length < 3) {

      setSuggestions([]);

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



  const applyCurrentLocation = useCallback(

    async (coords: {

      latitude: number;

      longitude: number;

      accuracy: number;

    }) => {

      const pt = normalizeLatLng([coords.latitude, coords.longitude]);

      if (!pt) {

        throw new Error("Invalid coordinates from device.");

      }



      log("reverse geocode start", pt);

      let location: LocationSuggestion | null = null;



      try {

        location = await reverseGeocode(pt[0], pt[1]);

        log("reverse geocode result", location);

      } catch (err) {

        console.error(LOG_PREFIX, "reverse geocode failed", err);

      }



      const accuracyM = Math.round(coords.accuracy);

      const suggestion: LocationSuggestion = {

        placeId: location?.placeId ?? `${pt[0]},${pt[1]}`,

        displayName:

          location?.displayName ?? `Current location (±${accuracyM}m)`,

        lat: pt[0],

        lng: pt[1],

      };



      log("pickup applied", suggestion);

      onSelect(suggestion);

      setQuery(getDisplayLabel(suggestion));

      setSuggestions([]);

      setOpen(false);

      setLocationError(null);

    },

    [onSelect],

  );



  const fetchCurrentLocation = useCallback(async () => {

    if (locatingRef.current) return;

    setLocationError(null);



    if (!isGeolocationSupported()) {

      setLocationError(

        "Location is not supported in this browser. Enter your pickup address manually.",

      );

      return;

    }



    const requestId = ++activeRequestRef.current;
    locatingRef.current = true;
    setLocating(true);

    log("Use current location clicked", { requestId });



    try {

      const permission = await queryGeolocationPermission();

      log("permission before request", permission);



      if (permission === "denied") {

        setLocationError(getGeolocationErrorMessage({ code: 1 }));

        return;

      }



      log("getCurrentLocation start");

      const coords = await getCurrentLocation({
        overallTimeoutMs: 45000,
        mode: "live",
      });



      if (requestId !== activeRequestRef.current) return;



      log("coordinates received", coords);

      await applyCurrentLocation(coords);

    } catch (err) {

      if (requestId !== activeRequestRef.current) return;



      console.error(LOG_PREFIX, "location failed", err);

      setLocationError(geolocationErrorMessage(err));

    } finally {

      if (requestId === activeRequestRef.current) {
        locatingRef.current = false;
        setLocating(false);
      }
    }
  }, [applyCurrentLocation]);



  useEffect(() => {

    if (autoLocateOnMount && !hasAutoLocatedRef.current) {

      hasAutoLocatedRef.current = true;

      void fetchCurrentLocation();

    }

  }, [autoLocateOnMount, fetchCurrentLocation]);



  function handleSelect(suggestion: LocationSuggestion) {

    const pt = normalizeLatLng([suggestion.lat, suggestion.lng]);

    if (!pt) return;



    setQuery(getDisplayLabel(suggestion));

    setSuggestions([]);

    setOpen(false);

    setLocationError(null);

    onSelect({ ...suggestion, lat: pt[0], lng: pt[1] });

  }



  return (

    <div ref={wrapperRef} className="relative w-full space-y-2">

      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100">

        {icon ?? <MapPin className="h-4 w-4 shrink-0 text-pink-500" />}

        <input

          type="text"

          value={query}

          onChange={(e) => {

            const next = e.target.value;

            setQuery(next);

            setLocationError(null);

            if (next.trim().length < 3) {

              setSuggestions([]);

              setOpen(false);

            }

          }}

          onFocus={() => suggestions.length > 0 && setOpen(true)}

          placeholder={placeholder}

          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"

          autoComplete="off"

          enterKeyHint="search"

          aria-busy={locating}

        />

        {loading && (

          <div

            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-pink-400 border-t-transparent"

            aria-hidden

          />

        )}

        {showGpsIcon && !loading && (

          <button

            type="button"

            onClick={() => void fetchCurrentLocation()}

            disabled={locating}

            className="shrink-0 rounded-lg p-1.5 text-neutral-500 transition hover:bg-white hover:text-pink-500 disabled:opacity-50"

            title={currentLocationLabel}

            aria-label={currentLocationLabel}

          >

            <Navigation

              className={cn("h-4 w-4", locating && "animate-spin")}

            />

          </button>

        )}

      </div>



      {showCurrentLocationButton && (

        <button

          type="button"

          onClick={() => void fetchCurrentLocation()}

          disabled={locating}

          className={cn(

            "flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 py-2.5 text-sm font-semibold text-pink-600 transition",

            "hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60",

          )}

        >

          <Navigation

            className={cn("h-4 w-4 shrink-0", locating && "animate-spin")}

          />

          {locating ? "Getting your location…" : currentLocationLabel}

        </button>

      )}



      {locationError && (

        <div

          role="alert"

          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"

        >

          <p>{locationError}</p>

          <button

            type="button"

            onClick={() => void fetchCurrentLocation()}

            disabled={locating}

            className="mt-1.5 font-semibold text-pink-600 underline-offset-2 hover:underline disabled:opacity-50"

          >

            Try again

          </button>

        </div>

      )}



      {open && suggestions.length > 0 && (

        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">

          {suggestions.map((s) => (

            <li key={s.placeId}>

              <button

                type="button"

                onClick={() => handleSelect(s)}

                className="w-full cursor-pointer px-4 py-3 text-left text-sm text-neutral-700 hover:bg-pink-50 border-b border-neutral-100 last:border-0"

              >

                <span className="font-medium">{getDisplayLabel(s)}</span>

                <p className="text-xs text-neutral-400 truncate mt-0.5">

                  {s.displayName}

                </p>

              </button>

            </li>

          ))}

        </ul>

      )}

    </div>

  );

}


