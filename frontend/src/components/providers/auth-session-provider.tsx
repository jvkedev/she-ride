"use client";

import { useEffect } from "react";

import { getAccessToken } from "@/lib/auth/session";
import { scheduleProactiveTokenRefresh } from "@/services/auth/auth.service";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!getAccessToken()) return;
    return scheduleProactiveTokenRefresh();
  }, []);

  return children;
}
