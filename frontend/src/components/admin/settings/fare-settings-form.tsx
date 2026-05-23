import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Input } from "@/components/ui/input";
import { dashboardHeading } from "@/lib/dashboard/styles";

const categories = [
  { name: "She Bike", base: 25, perKm: 8 },
  { name: "She Auto", base: 35, perKm: 12 },
  { name: "She Go", base: 49, perKm: 14 },
  { name: "She Plus", base: 65, perKm: 18 },
];

export default function FareSettingsForm() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Fare settings</h2>
      <ul className="mt-4 space-y-4">
        {categories.map((cat) => (
          <li
            key={cat.name}
            className="grid gap-3 rounded-lg border border-neutral-100 p-3 sm:grid-cols-3"
          >
            <p className="text-sm font-medium text-neutral-900 sm:col-span-3">
              {cat.name}
            </p>
            <div>
              <label className="text-xs text-neutral-500">Base fare (₹)</label>
              <Input
                type="number"
                defaultValue={cat.base}
                className="mt-1 h-9 rounded-lg bg-[#eeeeee]"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Per km (₹)</label>
              <Input
                type="number"
                defaultValue={cat.perKm}
                className="mt-1 h-9 rounded-lg bg-[#eeeeee]"
              />
            </div>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
