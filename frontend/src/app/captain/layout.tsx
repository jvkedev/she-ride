import CaptainLayoutShell from "@/components/captain/layout/captain-layout-shell";

export default function CaptainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CaptainLayoutShell>{children}</CaptainLayoutShell>;
}
