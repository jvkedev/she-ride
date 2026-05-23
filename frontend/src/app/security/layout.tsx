import SecurityLayoutShell from "@/components/security/layout/security-layout-shell";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecurityLayoutShell>{children}</SecurityLayoutShell>;
}
