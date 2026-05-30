"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SecurityActivity } from "@/lib/security/types";
import { SECURITY_WS_URL } from "@/services/security/security-api";

type UseSecurityWebSocketOptions = {
  simulateLive?: boolean;
};

export function useSecurityWebSocket(
  options: UseSecurityWebSocketOptions = {},
) {
  const { simulateLive = false } = options;
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<SecurityActivity[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const pushEvent = useCallback((event: SecurityActivity) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    let cancelled = false;

    try {
      if (!SECURITY_WS_URL) return;

      const ws = new WebSocket(SECURITY_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!cancelled) setConnected(true);
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data as string) as SecurityActivity;
          if (!cancelled) pushEvent(data);
        } catch {
          /* ignore malformed payloads */
        }
      };

      ws.onclose = () => {
        if (!cancelled) setConnected(false);
      };

      ws.onerror = () => ws.close();
    } catch {
      setConnected(false);
    }

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [pushEvent]);

  return { connected, events, live: connected || simulateLive };
}
