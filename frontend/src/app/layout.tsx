import type { Metadata } from "next";
import "./globals.css";

import PublicShell from "@/components/layout/public-shell";
import ToastProvider from "@/components/providers/toast-provider";
import QueryProvider from "@/components/providers/query-provider";
import AuthSessionProvider from "@/components/providers/auth-session-provider";

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
        <QueryProvider>
          <ToastProvider />
          <AuthSessionProvider>
            <PublicShell>{children}</PublicShell>
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
