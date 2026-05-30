import axiosClient from "../api/axios-client";

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
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  safetyAlertEnabled: boolean;
  notifyRequestAlerts: boolean;
  shareLiveLocation: boolean;
}

export async function getCaptainProfile(): Promise<CaptainProfile> {
  const { data } = await axiosClient.get<CaptainProfile>("/captain/profile");
  return data;
}

export async function updateCaptainProfile(
  payload: Partial<
    CaptainProfile & {
      fullName?: string;
      notifyRequestAlerts?: boolean;
      safetyAlertEnabled?: boolean;
      shareLiveLocation?: boolean;
    }
  >,
): Promise<CaptainProfile> {
  const updatePayload = {
    fullName: payload.name ?? payload.fullName,
    gender: payload.gender ?? undefined,
    dateOfBirth: payload.dateOfBirth ?? undefined,
    emergencyContactName: payload.emergencyContactName ?? undefined,
    emergencyContactPhone: payload.emergencyContactPhone ?? undefined,
    safetyAlertEnabled: payload.safetyAlertEnabled,
    notifyRequestAlerts: payload.notifyRequestAlerts,
    shareLiveLocation: payload.shareLiveLocation,
  };

  const { data } = await axiosClient.patch<CaptainProfile>(
    "/captain/profile",
    updatePayload,
  );
  return data;
}

export async function setCaptainOnline(isOnline: boolean): Promise<void> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/online`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isOnline }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;
    throw new Error(
      message ??
        "Your documents are still pending verification. Please wait for approval before going online.",
    );
  }
}

export async function uploadCaptainPhoto(
  file: File,
): Promise<{ profileImage: string }> {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("photo", file); // matches backend field name

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/captain/profile/photo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  if (!res.ok) throw new Error("Failed to upload photo");
  return res.json() as Promise<{ profileImage: string }>;
}
