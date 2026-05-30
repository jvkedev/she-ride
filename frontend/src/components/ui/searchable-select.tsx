"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type SearchableSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search or select…",
  disabled,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1", className)}>
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 text-left text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className={cn(!selected && "text-neutral-400")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
            <Search className="size-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="w-full bg-transparent text-sm outline-none"
              autoFocus
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500">No matches</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50",
                      option.value === value && "bg-primary/5",
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-neutral-900">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {option.value === value ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
