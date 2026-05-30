import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSecurityProfile,
  type SecurityProfile,
} from "@/services/security/security-profile.service";

export const SECURITY_PROFILE_QUERY_KEY = ["security", "profile"] as const;

export function useSecurityProfile() {
  return useQuery({
    queryKey: SECURITY_PROFILE_QUERY_KEY,
    queryFn: getSecurityProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useInvalidateSecurityProfile() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: SECURITY_PROFILE_QUERY_KEY });
}

export function useSetSecurityProfileCache() {
  const queryClient = useQueryClient();
  return (profile: SecurityProfile) =>
    queryClient.setQueryData(SECURITY_PROFILE_QUERY_KEY, profile);
}
