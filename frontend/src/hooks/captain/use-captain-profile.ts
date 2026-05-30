import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCaptainProfile,
  type CaptainProfile,
} from "@/services/captain/captain-profile.service";

export const CAPTAIN_PROFILE_QUERY_KEY = ["captain", "profile"] as const;

export function useCaptainProfile() {
  return useQuery({
    queryKey: CAPTAIN_PROFILE_QUERY_KEY,
    queryFn: getCaptainProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useInvalidateCaptainProfile() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: CAPTAIN_PROFILE_QUERY_KEY });
}

export function useSetCaptainProfileCache() {
  const queryClient = useQueryClient();
  return (profile: CaptainProfile) =>
    queryClient.setQueryData(CAPTAIN_PROFILE_QUERY_KEY, profile);
}
