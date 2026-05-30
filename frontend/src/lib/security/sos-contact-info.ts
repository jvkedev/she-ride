import type { MappedSosAlert, SosAlertRecord } from "@/lib/security/sos-utils";
import { mapSosAlert } from "@/lib/security/sos-utils";

type CaptainProfile = NonNullable<SosAlertRecord["ride"]>["captain"];

function resolveCaptainFromAlert(
  alert: SosAlertRecord,
): CaptainProfile | null | undefined {
  return (
    alert.ride?.captain ??
    (alert as SosAlertRecord & { captain?: CaptainProfile }).captain ??
    null
  );
}

export function buildSosContactInfo(
  alert: SosAlertRecord | null | undefined,
): MappedSosAlert | null {
  if (!alert) return null;

  const mapped = mapSosAlert(alert);
  const captain = resolveCaptainFromAlert(alert);

  if (!captain?.user) {
    return {
      ...mapped,
      driverName:
        mapped.driverName === "—" ? "No captain linked" : mapped.driverName,
    };
  }

  return {
    ...mapped,
    driverName: captain.user.fullName,
    driverPhone: captain.user.phoneNumber ?? null,
    driverPhoto: captain.profileImage ?? mapped.driverPhoto,
    driverRating: captain.rating ?? mapped.driverRating,
    pickupAddress: alert.ride?.pickupAddress ?? mapped.pickupAddress,
    dropAddress: alert.ride?.dropAddress ?? mapped.dropAddress,
    rideStatus: alert.ride?.status?.toLowerCase() ?? mapped.rideStatus,
    captainLatitude:
      alert.captainLive?.latitude ?? mapped.captainLatitude,
    captainLongitude:
      alert.captainLive?.longitude ?? mapped.captainLongitude,
  };
}
