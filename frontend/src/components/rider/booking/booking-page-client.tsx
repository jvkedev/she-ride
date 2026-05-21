"use client";

import dynamic from "next/dynamic";

import BookingLoading from "@/components/rider/booking/booking-loading";

const BookingLayout = dynamic(
  () => import("@/components/rider/booking/booking-layout"),
  {
    loading: () => <BookingLoading />,
    ssr: false,
  },
);

export default function BookingPageClient() {
  return <BookingLayout />;
}
