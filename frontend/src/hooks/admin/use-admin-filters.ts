"use client";

import { useMemo, useState } from "react"
import { adminRiders } from "@/lib/admin/mock-data";;

export function useAdminFilters<T extends object>(
  items: T[],
  options: {
    searchKeys: (keyof T)[];
    statusKey?: keyof T;
  },
) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        options.searchKeys.some((key) => {
          const val = item[key];
          return String(val ?? "").toLowerCase().includes(q);
        }),
      );
    }

    if (statusFilter !== "all" && options.statusKey) {
      result = result.filter(
        (item) => String(item[options.statusKey!]) === statusFilter,
      );
    }

    return result;
  }, [items, search, statusFilter, options.searchKeys, options.statusKey]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered,
  };
}