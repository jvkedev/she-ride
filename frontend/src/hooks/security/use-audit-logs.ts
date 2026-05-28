"use client";

import { useCallback, useEffect, useState } from "react";

import { auditApi } from "@/services/security/security-api";
import type { AuditLog, AuditLogEntry, AuditLogsMeta } from "@/lib/security/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

function mapAuditLog(log: AuditLog): AuditLogEntry {
  const entityType: AuditLogEntry["entityType"] = log.sosAlertId
    ? "sos"
    : log.fraudCaseId
      ? "fraud"
      : log.incidentId
        ? "incident"
        : log.suspiciousAccountId
          ? "account"
          : null;

  const target =
    log.sosAlertId ??
    log.fraudCaseId ??
    log.incidentId ??
    log.suspiciousAccountId ??
    "N/A";

  return {
    id: log.id,
    timestamp: new Date(log.createdAt).toLocaleString("en-IN"),
    actor: log.performedBy || "SYSTEM",
    action: log.action,
    target,
    entityType,
    ip: log.ipAddress ?? null,
    metadata: log.metadata ?? undefined,
  };
}

export function useAuditLogs({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<AuditLogsMeta>({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await auditApi.getAll({
        performedBy: debouncedSearch?.trim() || undefined,
        page,
        limit,
      });

      setData((response.data as AuditLog[]).map(mapAuditLog));
      setMeta(response.meta);
    } catch (loadError) {
      console.error("Failed to load audit logs:", loadError);
      setError("Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, limit, page]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, meta, loading, error, refetch: load };
}
