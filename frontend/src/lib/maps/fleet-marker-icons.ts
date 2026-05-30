import L from "leaflet";

const VEHICLE_META: Record<
  string,
  { color: string; glyph: string; label: string }
> = {
  BIKE: { color: "#ff2e6d", glyph: "🏍", label: "Bike" },
  AUTO: { color: "#f59e0b", glyph: "🛺", label: "Auto" },
  CAR: { color: "#2563eb", glyph: "🚗", label: "Car" },
  SUV: { color: "#7c3aed", glyph: "🚙", label: "SUV" },
};

export function computeBearing(
  from: [number, number],
  to: [number, number],
): number {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function createFleetCaptainIcon(
  vehicleType?: string | null,
  headingDeg = 0,
  isMoving = false,
): L.DivIcon {
  const meta = VEHICLE_META[vehicleType ?? "CAR"] ?? VEHICLE_META.CAR;

  return L.divIcon({
    className: "fleet-marker-leaflet-icon",
    html: `
      <div class="fleet-marker ${isMoving ? "fleet-marker--moving" : ""}" style="--fleet-color:${meta.color};--fleet-heading:${headingDeg}deg">
        <span class="fleet-marker__pulse"></span>
        <span class="fleet-marker__ring"></span>
        <span class="fleet-marker__arrow"></span>
        <span class="fleet-marker__body">
          <span class="fleet-marker__glyph">${meta.glyph}</span>
        </span>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20],
  });
}

export function getVehicleLabel(vehicleType?: string | null) {
  return VEHICLE_META[vehicleType ?? "CAR"]?.label ?? "Captain";
}
