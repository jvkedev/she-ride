"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getStoredUser } from "@/lib/auth/session";
import type { SosAlertRecord, SosLocationSnapshot } from "@/lib/security/sos-utils";
import {
  connectSocket,
  joinSecurityRoom,
  subscribeSosEvents,
  type SosLocationPayload,
} from "@/services/socket/socket.service";
import { sosKeys } from "@/hooks/security/use-sos";

function appendRiderSnapshot(
  alert: SosAlertRecord,
  snapshot: SosLocationSnapshot,
): SosAlertRecord {
  const existing = alert.locationSnapshots ?? [];
  const last = existing[existing.length - 1];
  if (
    last &&
    last.latitude === snapshot.latitude &&
    last.longitude === snapshot.longitude
  ) {
    return alert;
  }
  return {
    ...alert,
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    locationSnapshots: [...existing, snapshot],
  };
}

function applyCaptainLive(
  alert: SosAlertRecord,
  latitude: number,
  longitude: number,
): SosAlertRecord {
  return {
    ...alert,
    captainLive: { latitude, longitude },
  };
}

export function useSosLiveUpdates(selectedId?: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) return;

    connectSocket(user.id, { role: user.role });
    joinSecurityRoom();

    const applyLocation = (payload: SosLocationPayload) => {
      const isCaptain = payload.role === "CAPTAIN";

      const patch = (alert: SosAlertRecord) => {
        if (alert.id !== payload.sosAlertId) return alert;
        if (isCaptain) {
          return applyCaptainLive(
            alert,
            payload.latitude,
            payload.longitude,
          );
        }
        return appendRiderSnapshot(alert, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          capturedAt: payload.capturedAt,
        });
      };

      qc.setQueryData<SosAlertRecord[]>(sosKeys.active(), (prev) =>
        prev ? prev.map(patch) : prev,
      );

      if (selectedId === payload.sosAlertId) {
        qc.setQueryData<SosAlertRecord>(
          sosKeys.detail(payload.sosAlertId),
          (prev) => (prev ? patch(prev) : prev),
        );
      }
    };

    const unsub = subscribeSosEvents({
      onCreated: () => {
        void qc.invalidateQueries({ queryKey: sosKeys.active() });
        void qc.invalidateQueries({ queryKey: sosKeys.stats() });
      },
      onLocation: applyLocation,
      onResolved: (payload) => {
        void qc.invalidateQueries({ queryKey: sosKeys.active() });
        void qc.invalidateQueries({
          queryKey: sosKeys.detail(payload.sosAlertId),
        });
        void qc.invalidateQueries({ queryKey: sosKeys.stats() });
      },
    });

    return () => {
      unsub();
    };
  }, [qc, selectedId]);
}
