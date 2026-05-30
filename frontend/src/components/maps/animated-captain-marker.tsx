"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Marker } from "react-leaflet";
import type L from "leaflet";

type AnimatedCaptainMarkerProps = {
  position: [number, number] | null;
  icon: L.DivIcon;
  children?: ReactNode;
};

export default function AnimatedCaptainMarker({
  position,
  icon,
  children,
}: AnimatedCaptainMarkerProps) {
  const [display, setDisplay] = useState<[number, number] | null>(position);
  const fromRef = useRef<[number, number] | null>(position);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!position) {
      setDisplay(null);
      fromRef.current = null;
      return;
    }

    const from = fromRef.current ?? position;
    const to = position;
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = t * (2 - t);
      setDisplay([
        from[0] + (to[0] - from[0]) * ease,
        from[1] + (to[1] - from[1]) * ease,
      ]);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    if (
      fromRef.current &&
      (Math.abs(from[0] - to[0]) > 0.00001 ||
        Math.abs(from[1] - to[1]) > 0.00001)
    ) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(tick);
    } else {
      setDisplay(to);
      fromRef.current = to;
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [position?.[0], position?.[1]]);

  if (!display) return null;

  return (
    <Marker position={display} icon={icon}>
      {children}
    </Marker>
  );
}
