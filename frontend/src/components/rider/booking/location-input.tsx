"use client";
import { useState, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/debouncing/use-debounce";
import {
  searchLocations,
  LocationSuggestion,
} from "@/services/location/location.service";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  placeholder: string;
  icon?: React.ReactNode;
  onSelect: (location: LocationSuggestion) => void;
}

export default function LocationInput({
  placeholder,
  icon,
  onSelect,
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    searchLocations(debouncedQuery)
      .then((results) => {
        setSuggestions(results);
        setOpen(true);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await searchLocations(debouncedQuery);
        setSuggestions(results);
        setOpen(true);
      } catch (error) {
        console.error("Location search failed:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  function handleSelect(suggestion: LocationSuggestion) {
    setQuery(suggestion.displayName.split(",")[0]); // show short name
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
        />
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
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
              <span className="font-medium">{s.displayName.split(",")[0]}</span>
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
