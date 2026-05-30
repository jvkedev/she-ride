export type SosLocationSnapshot = {
  latitude: number;
  longitude: number;
  capturedAt: string;
};

export type SosAlertRecord = {
  id: string;
  rideId: string | null;
  riderId: string;
  status: string;
  address: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  triggerType?: string;
  rider: {
    profileImage?: string | null;
    averageRating?: number;
    user: { fullName: string; phoneNumber: string; email?: string | null };
  };
  ride: {
    id?: string;
    status?: string;
    pickupAddress?: string;
    dropAddress?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    dropLatitude?: number;
    dropLongitude?: number;
    vehicleType?: string;
    captain?: {
      id?: string;
      profileImage?: string | null;
      rating?: number;
      user: { fullName: string; phoneNumber: string };
      vehicle?: { vehicleType?: string; vehicleNumber?: string | null } | null;
    } | null;
  } | null;
  locationSnapshots?: SosLocationSnapshot[];
  captainLive?: {
    latitude: number | null;
    longitude: number | null;
  };
  captainId?: string | null;
  captain?: {
    id?: string;
    profileImage?: string | null;
    rating?: number;
    user: { fullName: string; phoneNumber: string };
  } | null;
};

export type MappedSosAlert = {
  id: string;
  rideId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderPhoto: string | null;
  riderRating: number | null;
  driverName: string;
  driverPhone: string | null;
  driverPhoto: string | null;
  driverRating: number | null;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  triggeredAt: string;
  priority: "critical" | "high" | "medium";
  pickupAddress: string | null;
  dropAddress: string | null;
  rideStatus: string | null;
  captainLatitude: number | null;
  captainLongitude: number | null;
};

export function getSosLatestCoords(alert: SosAlertRecord): {
  latitude: number;
  longitude: number;
} {
  const snapshots = alert.locationSnapshots;
  if (snapshots && snapshots.length > 0) {
    const latest = snapshots.reduce((best, snap) =>
      new Date(snap.capturedAt) > new Date(best.capturedAt) ? snap : best,
    );
    return { latitude: latest.latitude, longitude: latest.longitude };
  }
  return { latitude: alert.latitude, longitude: alert.longitude };
}

export function mapSosAlert(alert: SosAlertRecord): MappedSosAlert {
  const { latitude, longitude } = getSosLatestCoords(alert);
  const captainLive = alert.captainLive;

  return {
    id: alert.id,
    rideId: alert.rideId ?? "—",
    riderId: alert.riderId,
    riderName: alert.rider.user.fullName,
    riderPhone: alert.rider.user.phoneNumber,
    riderPhoto: alert.rider.profileImage ?? null,
    riderRating: alert.rider.averageRating ?? null,
    driverName: alert.ride?.captain?.user.fullName ??
      (alert as SosAlertRecord).captain?.user.fullName ??
      "—",
    driverPhone:
      alert.ride?.captain?.user.phoneNumber ??
      (alert as SosAlertRecord).captain?.user.phoneNumber ??
      null,
    driverPhoto:
      alert.ride?.captain?.profileImage ??
      (alert as SosAlertRecord).captain?.profileImage ??
      null,
    driverRating:
      alert.ride?.captain?.rating ??
      (alert as SosAlertRecord).captain?.rating ??
      null,
    location:
      alert.address ??
      `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    latitude,
    longitude,
    status: alert.status.toLowerCase(),
    triggeredAt: new Date(alert.createdAt).toLocaleString("en-IN"),
    priority: "critical",
    pickupAddress: alert.ride?.pickupAddress ?? null,
    dropAddress: alert.ride?.dropAddress ?? null,
    rideStatus: alert.ride?.status?.toLowerCase() ?? null,
    captainLatitude: captainLive?.latitude ?? null,
    captainLongitude: captainLive?.longitude ?? null,
  };
}

export function mapSosAlerts(alerts: SosAlertRecord[]): MappedSosAlert[] {
  return alerts.map(mapSosAlert);
}

export function buildSosTrail(
  snapshots: SosLocationSnapshot[] | undefined,
  fallback: { latitude: number; longitude: number },
): [number, number][] {
  if (snapshots && snapshots.length > 0) {
    return [...snapshots]
      .sort(
        (a, b) =>
          new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      )
      .map((s) => [s.latitude, s.longitude] as [number, number]);
  }
  return [[fallback.latitude, fallback.longitude]];
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
