"use client";

import dynamic from "next/dynamic";

import BookingLoading from "@/components/rider/booking/booking-loading";

const ParcelLayout = dynamic(
  () => import("@/components/rider/parcel/parcel-layout"),
  {
    loading: () => <BookingLoading />,
    ssr: false,
  },
);

export default function ParcelPageClient() {
  return <ParcelLayout />;
}
