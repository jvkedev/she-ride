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
}

export async function getCaptainProfile(): Promise<CaptainProfile> {
  const { data } = await axiosClient.get<CaptainProfile>("/captain/profile");
  return data;
}

export async function updateCaptainProfile(
  payload: Partial<CaptainProfile>,
): Promise<CaptainProfile> {
  const updatePayload = {
    fullName: payload.name,
    gender: payload.gender ?? undefined,
    dateOfBirth: payload.dateOfBirth ?? undefined,
  };

  const { data } = await axiosClient.patch<CaptainProfile>(
    "/captain/profile",
    updatePayload,
  );
  return data;
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
