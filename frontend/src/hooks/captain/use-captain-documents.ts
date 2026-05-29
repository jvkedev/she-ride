"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/services/api/axios-client";

export type DocumentStatus = "verified" | "pending" | "rejected";

export interface CaptainDocument {
  name: string;
  status: DocumentStatus;
}

export function useCaptainDocuments() {
  const [documents, setDocuments] = useState<CaptainDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res =
          await axiosClient.get<CaptainDocument[]>("/captain/documents");
        setDocuments(res.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch documents",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchDocuments();
  }, []);

  return { documents, loading, error };
}
