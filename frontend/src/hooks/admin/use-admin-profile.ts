import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getAdminProfile } from "@/services/admin/admin-profile.service";

export const ADMIN_PROFILE_QUERY_KEY = ["admin", "profile"] as const;

export function useAdminProfile() {
  return useQuery({
    queryKey: ADMIN_PROFILE_QUERY_KEY,
    queryFn: getAdminProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useInvalidateAdminProfile() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_PROFILE_QUERY_KEY });
}
