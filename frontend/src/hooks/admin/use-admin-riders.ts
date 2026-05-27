import { useCallback, useEffect, useState } from "react";
import { fetchRiders, blockRider, unblockRider } from "@/services/admin/admin.service";
import type { AdminRider } from "@/lib/admin/types";

type ActionState = { riderId: string | null; loading: boolean };

export function useAdminRiders() {
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    riderId: null,
    loading: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRiders();
      setRiders(data);
    } catch {
      setError("Failed to load riders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleBlock = useCallback(async (rider: AdminRider) => {
    setActionState({ riderId: rider.id, loading: true });
    try {
      if (rider.status === "active") {
        await blockRider(rider.id);
      } else {
        await unblockRider(rider.id);
      }
      // Optimistic update — no refetch needed
      setRiders((prev) =>
        prev.map((r) =>
          r.id === rider.id
            ? { ...r, status: r.status === "active" ? "inactive" : "active" }
            : r,
        ),
      );
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setActionState({ riderId: null, loading: false });
    }
  }, []);

  return { riders, loading, error, actionState, toggleBlock, refetch: load };
}