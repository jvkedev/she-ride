"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Popup } from "react-leaflet";

import AnimatedCaptainMarker from "@/components/maps/animated-captain-marker";
import {
  computeBearing,
  createFleetCaptainIcon,
  getVehicleLabel,
} from "@/lib/maps/fleet-marker-icons";

export type FleetCaptain = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vehicleType?: string | null;
  plate?: string | null;
  updatedAt?: string | null;
};

type FleetCaptainMarkerProps = {
  captain: FleetCaptain;
};

export default function FleetCaptainMarker({ captain }: FleetCaptainMarkerProps) {
  const position: [number, number] = [captain.lat, captain.lng];
  const prevRef = useRef<[number, number] | null>(null);
  const [heading, setHeading] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev) {
      const moved =
        Math.abs(prev[0] - position[0]) > 0.00001 ||
        Math.abs(prev[1] - position[1]) > 0.00001;
      if (moved) {
        setHeading(computeBearing(prev, position));
        setIsMoving(true);
        const timer = setTimeout(() => setIsMoving(false), 1800);
        prevRef.current = position;
        return () => clearTimeout(timer);
      }
    }
    prevRef.current = position;
  }, [position[0], position[1]]);

  const icon = useMemo(
    () => createFleetCaptainIcon(captain.vehicleType, heading, isMoving),
    [captain.vehicleType, heading, isMoving],
  );

  return (
    <AnimatedCaptainMarker position={position} icon={icon}>
      <Popup>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-neutral-900">{captain.name}</p>
          <p className="text-neutral-600">
            {getVehicleLabel(captain.vehicleType)}
            {captain.plate ? ` · ${captain.plate}` : ""}
          </p>
          {captain.updatedAt ? (
            <p className="text-xs text-neutral-400">
              Updated {new Date(captain.updatedAt).toLocaleTimeString("en-IN")}
            </p>
          ) : null}
        </div>
      </Popup>
    </AnimatedCaptainMarker>
  );
}
