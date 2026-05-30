"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCaptainDocuments,
  type CaptainDocumentsResponse,
} from "@/services/captain/captain-documents.service";

export const CAPTAIN_DOCUMENTS_QUERY_KEY = ["captain", "documents"] as const;

export function useCaptainDocuments() {
  return useQuery({
    queryKey: CAPTAIN_DOCUMENTS_QUERY_KEY,
    queryFn: getCaptainDocuments,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useInvalidateCaptainDocuments() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: CAPTAIN_DOCUMENTS_QUERY_KEY });
}

export function useSetCaptainDocumentsCache() {
  const queryClient = useQueryClient();
  return (data: CaptainDocumentsResponse) =>
    queryClient.setQueryData(CAPTAIN_DOCUMENTS_QUERY_KEY, data);
}

export type { CaptainVerificationStatus, CaptainDocumentItem } from "@/services/captain/captain-documents.service";
