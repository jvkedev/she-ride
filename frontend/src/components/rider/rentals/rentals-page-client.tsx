"use client";

import dynamic from "next/dynamic";

import BookingLoading from "@/components/rider/booking/booking-loading";

const RentalsLayout = dynamic(
  () => import("@/components/rider/rentals/rentals-layout"),
  {
    loading: () => <BookingLoading />,
    ssr: false,
  },
);

export default function RentalsPageClient() {
  return <RentalsLayout />;
}
