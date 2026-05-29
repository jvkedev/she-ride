import axiosClient from "@/services/api/axios-client";

type AdminProfileApi = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  department: string | null;
  jobTitle: string | null;
  memberSince: string;
};

export interface AdminProfile {
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  department: string | null;
  jobTitle: string | null;
  memberSince: string;
}

function mapAdminProfile(data: AdminProfileApi): AdminProfile {
  return {
    name: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    profileImage: data.profileImage,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    department: data.department,
    jobTitle: data.jobTitle,
    memberSince: data.memberSince,
  };
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const { data } = await axiosClient.get<AdminProfileApi>("/admin/profile");
  return mapAdminProfile(data);
}

export async function updateAdminProfile(
  payload: Partial<AdminProfile>,
): Promise<AdminProfile> {
  const updatePayload = {
    fullName: payload.name,
    gender: payload.gender && payload.gender !== "" ? payload.gender : undefined,
    dateOfBirth:
      payload.dateOfBirth && payload.dateOfBirth !== ""
        ? payload.dateOfBirth
        : undefined,
    department: payload.department ?? undefined,
    jobTitle: payload.jobTitle ?? undefined,
  };

  const { data } = await axiosClient.patch<AdminProfileApi>(
    "/admin/profile",
    updatePayload,
  );
  return mapAdminProfile(data);
}

export async function uploadAdminPhoto(
  file: File,
): Promise<{ profileImage: string }> {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/profile/photo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  if (!res.ok) throw new Error("Failed to upload photo");
  return res.json() as Promise<{ profileImage: string }>;
}
