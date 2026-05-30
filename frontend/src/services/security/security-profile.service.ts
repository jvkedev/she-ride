import axiosClient from "@/services/api/axios-client";

export type SecurityProfileApi = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  memberSince: string;
  accountStatus: string;
};

export interface SecurityProfile {
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  memberSince: string;
  accountStatus: string;
}

function mapProfile(data: SecurityProfileApi): SecurityProfile {
  return {
    name: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    profileImage: data.profileImage,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    memberSince: data.memberSince,
    accountStatus: data.accountStatus,
  };
}

export async function getSecurityProfile(): Promise<SecurityProfile> {
  const { data } = await axiosClient.get<SecurityProfileApi>(
    "/security/profile",
  );
  return mapProfile(data);
}

export async function updateSecurityProfile(
  payload: Partial<SecurityProfile>,
): Promise<SecurityProfile> {
  const { data } = await axiosClient.patch<SecurityProfileApi>(
    "/security/profile",
    {
      fullName: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      gender:
        payload.gender && payload.gender !== "" ? payload.gender : undefined,
      dateOfBirth:
        payload.dateOfBirth && payload.dateOfBirth !== ""
          ? payload.dateOfBirth
          : undefined,
    },
  );
  return mapProfile(data);
}

export async function uploadSecurityPhoto(
  file: File,
): Promise<{ profileImage: string }> {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/security/profile/photo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  if (!res.ok) throw new Error("Failed to upload photo");
  return res.json() as Promise<{ profileImage: string }>;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await axiosClient.post("/auth/change-password", payload);
}

export type SecurityOverviewStats = {
  activeSos: number;
  fraudAttempts: number;
  suspiciousAccounts: number;
  highRiskRides: number;
  blockedUsers: number;
  openIncidents: number;
};

export type SecurityAlertsTrendPoint = {
  day: string;
  sos: number;
  fraud: number;
  alerts: number;
};

export async function fetchSecurityOverviewStats(): Promise<SecurityOverviewStats> {
  const { data } = await axiosClient.get<SecurityOverviewStats>(
    "/security/overview/stats",
  );
  return data;
}

export async function fetchSecurityAlertsTrend(): Promise<
  SecurityAlertsTrendPoint[]
> {
  const { data } = await axiosClient.get<SecurityAlertsTrendPoint[]>(
    "/security/overview/alerts-trend",
  );
  return data;
}

export async function fetchLiveOperations() {
  const { data } = await axiosClient.get("/admin/operations/live");
  return data as {
    stats: {
      activeRides: number;
      onlineCaptains: number;
      ridersOnTrip: number;
      activeSos: number;
    };
    activeRides: Array<{
      id: string;
      status: string;
      riderName: string;
      riderPhone: string;
      captainName: string | null;
      captainPhone: string | null;
      captainId: string | null;
      pickup: string;
      dropoff: string;
      pickupLat: number;
      pickupLng: number;
      dropLat: number;
      dropLng: number;
      captainLat: number | null;
      captainLng: number | null;
      vehicleType: string | null;
    }>;
    captains: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      vehicleType: string | null;
    }>;
  };
}
