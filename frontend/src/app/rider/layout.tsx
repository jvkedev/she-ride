import RiderLayoutShell from "@/components/rider/layout/rider-layout-shell";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RiderLayoutShell>{children}</RiderLayoutShell>;
}
