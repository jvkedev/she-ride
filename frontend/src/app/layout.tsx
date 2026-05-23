import type { Metadata } from "next";
import "./globals.css";

import PublicShell from "@/components/layout/public-shell";
import ToastProvider from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: "Fem Safe Ride",
  description: "Secure ride booking platform for women",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
