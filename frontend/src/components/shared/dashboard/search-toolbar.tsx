"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { cn } from "@/lib/utils";

export type FilterOption = { label: string; value: string };

type SearchToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function SearchToolbar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters,
  filterValue = "all",
  onFilterChange,
  filterLabel = "Status",
  className,
  children,
}: SearchToolbarProps) {
  return (
    <SurfaceCard padding="sm" className={cn("flex flex-col gap-3 lg:flex-row lg:items-center", className)}>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 rounded-lg border-neutral-200 bg-[#eeeeee] pl-9"
        />
      </div>
      {filters && filters.length > 0 ? (
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="h-10 w-full rounded-lg border-neutral-200 bg-white lg:w-44">
            <SelectValue placeholder={filterLabel} />
          </SelectTrigger>
          <SelectContent>
            {filters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {children}
    </SurfaceCard>
  );
}
