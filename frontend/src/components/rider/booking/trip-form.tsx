"use client";

import LocationInput from "./location-input";

import CaptainFoundCard from "./captain-found-card";

import { MapPin, Square } from "lucide-react";

import { useState } from "react";

import { LocationSuggestion } from "@/services/location/location.service";

import { estimateRide, RideEstimate } from "@/services/rides/rides.service";

import type { CaptainInfo } from "@/lib/ride/captain-types";

import { cn } from "@/lib/utils";



interface TripFormProps {

  showSearchButton: boolean;

  pickup: LocationSuggestion | null;

  drop: LocationSuggestion | null;

  onPickupChange: (location: LocationSuggestion) => void;

  onDropChange: (location: LocationSuggestion) => void;

  onSearch: (

    estimates: RideEstimate[],

    pickup: LocationSuggestion,

    drop: LocationSuggestion,

  ) => void;

  /** Active ride tracking — Uber-style captain card below drop */

  isTracking?: boolean;

  rideStatus?: string;

  captain?: CaptainInfo | null;

  findingLabel?: string;

}



export default function TripForm({

  showSearchButton,

  pickup,

  drop,

  onPickupChange,

  onDropChange,

  onSearch,

  isTracking = false,

  rideStatus,

  captain,

  findingLabel,

}: TripFormProps) {

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  const isSearching = rideStatus === "SEARCHING";

  const showCaptain = Boolean(captain && !isSearching);



  async function handleSearch() {

    if (!pickup || !drop) return;



    setLoading(true);

    setError(null);



    try {

      const estimates = await estimateRide({

        pickupAddress: pickup.displayName,

        dropAddress: drop.displayName,

        pickupLatitude: pickup.lat,

        pickupLongitude: pickup.lng,

        dropLatitude: drop.lat,

        dropLongitude: drop.lng,

      });



      onSearch(estimates, pickup, drop);

    } catch (err: unknown) {

      const message =

        err &&

        typeof err === "object" &&

        "response" in err &&

        err.response &&

        typeof err.response === "object" &&

        "data" in err.response &&

        err.response.data &&

        typeof err.response.data === "object" &&

        "message" in err.response.data

          ? String((err.response.data as { message: unknown }).message)

          : "Failed to fetch rides. Try again.";

      setError(message);

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="p-6 space-y-3">

      <h1 className="text-2xl font-semibold">

        {isTracking ? "Your trip" : "Find a trip"}

      </h1>



      {isTracking && isSearching && findingLabel && (

        <p className="rounded-lg bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700">

          {findingLabel}

        </p>

      )}



      <div className="space-y-1">

        <label className="text-xs font-medium text-neutral-500">

          Pickup location

        </label>

        <LocationInput

          placeholder="Where should we pick you up?"

          icon={<MapPin className="h-4 w-4 text-pink-500 shrink-0" />}

          value={pickup}

          onSelect={onPickupChange}

          showGpsIcon

          showCurrentLocationButton

          currentLocationLabel="Use current location"

          autoLocateOnMount={false}

        />

      </div>



      <div className="space-y-1">

        <label className="text-xs font-medium text-neutral-500">

          Drop location

        </label>

        <LocationInput

          placeholder="Where are you going?"

          icon={<Square className="h-4 w-4 text-neutral-800 shrink-0" />}

          value={drop}

          onSelect={onDropChange}

        />

      </div>



      {showCaptain && captain && (

        <CaptainFoundCard captain={captain} rideStatus={rideStatus} />

      )}



      {error && <p className="text-xs text-red-500">{error}</p>}



      {showSearchButton && (

        <button

          type="button"

          onClick={handleSearch}

          disabled={!pickup || !drop || loading}

          className={cn(

            "w-full rounded-xl bg-pink-500 py-3 text-sm font-semibold text-white",

            "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors",

          )}

        >

          {loading ? "Searching..." : "Search"}

        </button>

      )}

    </div>

  );

}


