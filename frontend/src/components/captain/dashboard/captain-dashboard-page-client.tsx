"use client";

import dynamic from "next/dynamic";

import CaptainDashboardLoading from "@/components/captain/dashboard/captain-dashboard-loading";

const CaptainDashboardLayout = dynamic(
  () => import("@/components/captain/dashboard/captain-dashboard-layout"),
  {
    loading: () => <CaptainDashboardLoading />,
    ssr: false,
  },
);

export default function CaptainDashboardPageClient() {
  return (
    <div className="h-full min-h-0 flex-1">
      <CaptainDashboardLayout />
    </div>
  );
}
