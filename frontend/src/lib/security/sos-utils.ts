export type SosAlertRecord = {
  id: string;
  rideId: string | null;
  status: string;
  address: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  rider: { user: { fullName: string } };
  ride: {
    captain?: { user: { fullName: string } } | null;
  } | null;
};

export type MappedSosAlert = {
  id: string;
  rideId: string;
  riderName: string;
  driverName: string;
  location: string;
  status: string;
  triggeredAt: string;
  priority: "critical" | "high" | "medium";
};

export function mapSosAlert(alert: SosAlertRecord): MappedSosAlert {
  return {
    id: alert.id,
    rideId: alert.rideId ?? "—",
    riderName: alert.rider.user.fullName,
    driverName: alert.ride?.captain?.user.fullName ?? "—",
    location:
      alert.address ??
      `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
    status: alert.status.toLowerCase(),
    triggeredAt: new Date(alert.createdAt).toLocaleString("en-IN"),
    priority: "critical",
  };
}

export function mapSosAlerts(alerts: SosAlertRecord[]): MappedSosAlert[] {
  return alerts.map(mapSosAlert);
}
