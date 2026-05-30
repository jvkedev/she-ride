"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";
import {
  fetchFareSettings,
  updateFareSettings,
  type AdminFareSetting,
} from "@/services/admin/admin.service";

export default function FareSettingsForm() {
  const [rates, setRates] = useState<AdminFareSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFareSettings();
      setRates(data);
    } catch {
      setMessage("Failed to load fare settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateField(
    vehicleType: string,
    field: "base" | "perKm",
    value: string,
  ) {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;
    setRates((prev) =>
      prev.map((row) =>
        row.vehicleType === vehicleType ? { ...row, [field]: num } : row,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateFareSettings(
        rates.map((r) => ({
          vehicleType: r.vehicleType,
          base: r.base,
          perKm: r.perKm,
        })),
      );
      setRates(updated);
      setMessage("Fare settings saved. New ride estimates will use these rates.");
    } catch {
      setMessage("Could not save fare settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SurfaceCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={dashboardHeading}>Fare settings</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Base fare and per-km rates for each vehicle type.
          </p>
        </div>
        <Button
          className="rounded-lg"
          disabled={saving || loading}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save fares"}
        </Button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-neutral-600">{message}</p>
      )}

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" />
          Loading fare settings…
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {rates.map((cat) => (
            <li
              key={cat.vehicleType}
              className="grid gap-3 rounded-lg border border-neutral-100 p-3 sm:grid-cols-3"
            >
              <p className="text-sm font-medium text-neutral-900 sm:col-span-3">
                {cat.label}
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  {cat.vehicleType}
                </span>
              </p>
              <div>
                <label className="text-xs text-neutral-500">Base fare (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={cat.base}
                  onChange={(e) =>
                    updateField(cat.vehicleType, "base", e.target.value)
                  }
                  className="mt-1 h-9 rounded-lg bg-[#eeeeee]"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Per km (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={cat.perKm}
                  onChange={(e) =>
                    updateField(cat.vehicleType, "perKm", e.target.value)
                  }
                  className="mt-1 h-9 rounded-lg bg-[#eeeeee]"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
