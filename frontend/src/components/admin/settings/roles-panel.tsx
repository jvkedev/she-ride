import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";

const roles = [
  { name: "Super Admin", users: 2, permissions: "Full access" },
  { name: "Operations", users: 5, permissions: "Rides, drivers, tracking" },
  { name: "Support", users: 8, permissions: "Tickets, riders" },
  { name: "Finance", users: 3, permissions: "Payments, payouts" },
];

export default function RolesPanel() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Role management</h2>
      <ul className="mt-4 space-y-3">
        {roles.map((role) => (
          <li
            key={role.name}
            className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-3"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{role.name}</p>
              <p className="text-xs text-neutral-500">{role.permissions}</p>
            </div>
            <span className="text-xs font-medium text-neutral-600">
              {role.users} users
            </span>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
