import api from "@/services/api/axios-client";
import { reverseGeocode } from "@/services/location/location.service";
import { getCurrentLocation } from "@/lib/maps/geolocation";

export type TriggerSosParams = {
  rideId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export async function triggerSosWithLiveLocation(
  params: TriggerSosParams = {},
): Promise<unknown> {
  let latitude = params.latitude;
  let longitude = params.longitude;
  let address = params.address;

  if (latitude == null || longitude == null) {
    const coords = await getCurrentLocation({
      mode: "live",
      overallTimeoutMs: 45000,
    });
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  if (!address) {
    const place = await reverseGeocode(latitude, longitude);
    address = place?.displayName;
  }

  return api.post("/security/sos/trigger", {
    triggerType: "BUTTON_PRESS",
    latitude,
    longitude,
    address,
    rideId: params.rideId,
  });
}
