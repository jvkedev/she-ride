import type { Metadata } from "next";
import "./globals.css";

import ToastProvider from "@/components/providers/toast-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

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
        <Navbar />
        <main>
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
