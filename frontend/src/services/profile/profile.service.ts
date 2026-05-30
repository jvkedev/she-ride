import axios from "axios";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

function authHeader() {
  const token = localStorage.getItem("accessToken") ?? "";
  return { Authorization: `Bearer ${token}` };
}

export interface RiderProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  rating: number;
  totalRides: number;
  cancelledRides: number;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  ridePreference: string | null;
  safetyAlertEnabled: boolean;
  shareLiveLocation: boolean;
  notifyRideUpdates: boolean;
  defaultPaymentMethod: string;
  memberSince: string;
}

export async function getRiderProfile(): Promise<RiderProfile> {
  const { data } = await api.get("/profile/rider", {
    headers: authHeader(),
  });
  return data;
}

export async function updateRiderProfile(
  payload: Partial<
    Pick<
      RiderProfile,
      | "fullName"
      | "email"
      | "gender"
      | "emergencyContactName"
      | "emergencyContactPhone"
      | "ridePreference"
      | "safetyAlertEnabled"
      | "shareLiveLocation"
      | "notifyRideUpdates"
    >
  > & { dateOfBirth?: string },
): Promise<Partial<RiderProfile>> {
  const { data } = await api.patch("/profile/rider", payload, {
    headers: authHeader(),
  });
  return data;
}

export async function uploadProfilePhoto(
  file: File,
): Promise<{ profileImage: string }> {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/profile/rider/photo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );
  if (!res.ok) throw new Error("Failed to upload photo");
  return res.json();
}
