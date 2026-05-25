"use client";
import LocationInput from "./location-input";
import { MapPin, Square } from "lucide-react";
import { useState } from "react";
import { LocationSuggestion } from "@/services/location/location.service";
import { estimateRide, RideEstimate } from "@/services/rides/rides.service";

interface TripFormProps {
  showSearchButton: boolean;
  onSearch: (
    estimates: RideEstimate[],
    pickup: LocationSuggestion,
    drop: LocationSuggestion,
  ) => void;
}

export default function TripForm({
  showSearchButton,
  onSearch,
}: TripFormProps) {
  const [pickup, setPickup] = useState<LocationSuggestion | null>(null);
  const [drop, setDrop] = useState<LocationSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to fetch rides. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Find a trip</h1>

      <LocationInput
        placeholder="Pickup location"
        icon={<MapPin className="h-4 w-4 text-pink-500 shrink-0" />}
        onSelect={setPickup}
      />

      <LocationInput
        placeholder="Drop location"
        icon={<Square className="h-4 w-4 text-neutral-800 shrink-0" />}
        onSelect={setDrop}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {showSearchButton && (
        <button
          onClick={handleSearch}
          disabled={!pickup || !drop || loading}
          className="w-full rounded-xl bg-pink-500 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      )}
    </div>
  );
}
