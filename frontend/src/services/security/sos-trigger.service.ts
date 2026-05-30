import api from "@/services/api/axios-client";
import { reverseGeocode } from "@/services/location/location.service";
import {
  getCurrentLocation,
  subscribeLiveLocation,
} from "@/lib/maps/geolocation";
import { connectSocket, joinSosRoom } from "@/services/socket/socket.service";
import { getStoredUser } from "@/lib/auth/session";

export type TriggerSosParams = {
  rideId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export type SosAlertResponse = {
  id: string;
  status: string;
};

const activeStreams = new Map<string, () => void>();

export async function triggerSosWithLiveLocation(
  params: TriggerSosParams = {},
): Promise<SosAlertResponse> {
  let latitude = params.latitude;
  let longitude = params.longitude;
  let address = params.address;

  if (latitude == null || longitude == null) {
    const coords = await getCurrentLocation({
      mode: "live",
      overallTimeoutMs: 20_000,
    });
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  if (!address) {
    const place = await reverseGeocode(latitude, longitude);
    address = place?.displayName;
  }

  const { data } = await api.post<SosAlertResponse>("/security/sos/trigger", {
    triggerType: "BUTTON_PRESS",
    latitude,
    longitude,
    address,
    rideId: params.rideId,
  });

  startSosLocationStream(data.id);
  return data;
}

export function startSosLocationStream(sosAlertId: string): () => void {
  stopSosLocationStream(sosAlertId);

  const user = getStoredUser();
  if (user?.id) {
    connectSocket(user.id, { role: user.role });
    joinSosRoom(sosAlertId);
  }

  let lastPush = 0;
  const minIntervalMs = 4_000;

  const stopWatch = subscribeLiveLocation(async (coords) => {
    const now = Date.now();
    if (now - lastPush < minIntervalMs) return;
    lastPush = now;

    try {
      await api.post(`/security/sos/${sosAlertId}/location`, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch {
      stopSosLocationStream(sosAlertId);
    }
  });

  const cleanup = () => {
    stopWatch();
    activeStreams.delete(sosAlertId);
  };

  activeStreams.set(sosAlertId, cleanup);
  return cleanup;
}

export function stopSosLocationStream(sosAlertId: string): void {
  activeStreams.get(sosAlertId)?.();
}
