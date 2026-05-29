"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/services/api/axios-client";

export interface CaptainProfile {
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  isVerified: boolean;
  isOnline: boolean;
  rating: number;
  totalTrips: number;
  verifiedAt: string | null;
  vehicle: string;
  plateNumber: string;
  vehicleType: string | null;
  vehicleColor: string | null;
}

export function useCaptainProfile() {
  const [profile, setProfile] = useState<CaptainProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosClient.get<CaptainProfile>("/captain/profile");
        setProfile(res.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  return { profile, loading, error };
}
