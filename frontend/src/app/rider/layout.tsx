import RiderHeader from "@/components/rider/layout/rider-header";
import RiderMain from "@/components/rider/layout/rider-main";
import RiderRoutePrefetch from "@/components/rider/layout/rider-route-prefetch";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <RiderRoutePrefetch />
      <RiderHeader />
      <RiderMain>{children}</RiderMain>
    </div>
  );
}
