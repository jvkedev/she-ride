"use client";

import RiderMapPanel from "@/components/rider/shared/rider-map-panel";

type RentalsMapPanelProps = {
  showRouteLabels?: boolean;
  pickup?: string;
  dropoff?: string;
  className?: string;
};

/** @deprecated Use RiderMapPanel from shared */
export default function RentalsMapPanel(props: RentalsMapPanelProps) {
  return <RiderMapPanel {...props} />;
}
