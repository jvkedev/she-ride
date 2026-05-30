import axiosClient from "@/services/api/axios-client";

export type AdminProfileApi = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  department: string | null;
  departmentLabel: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  permissionRole: string;
  permissionRoleLabel: string;
};

export interface AdminProfile {
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  department: string | null;
  departmentLabel: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  permissionRole: string;
  permissionRoleLabel: string;
}

export type AdminTeamMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  authRole: string;
  status: string;
  department: string | null;
  departmentLabel: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  permissionRole: string;
  permissionRoleLabel: string;
  profileImage: string | null;
};

function mapAdminProfile(data: AdminProfileApi): AdminProfile {
  return {
    name: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    profileImage: data.profileImage,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    department: data.department,
    departmentLabel: data.departmentLabel,
    jobTitle: data.jobTitle,
    jobTitleLabel: data.jobTitleLabel,
    permissionRole: data.permissionRole,
    permissionRoleLabel: data.permissionRoleLabel,
  };
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const { data } = await axiosClient.get<AdminProfileApi>("/admin/profile");
  return mapAdminProfile(data);
}

export async function fetchAdminTeam(): Promise<AdminTeamMember[]> {
  const { data } = await axiosClient.get<AdminTeamMember[]>("/admin/team");
  return data;
}

export async function updateAdminProfile(
  payload: Partial<AdminProfile>,
): Promise<AdminProfile> {
  const updatePayload = {
    fullName: payload.name,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    gender: payload.gender && payload.gender !== "" ? payload.gender : undefined,
    dateOfBirth:
      payload.dateOfBirth && payload.dateOfBirth !== ""
        ? payload.dateOfBirth
        : undefined,
    department:
      payload.department && payload.department !== ""
        ? payload.department
        : undefined,
    jobTitle:
      payload.jobTitle && payload.jobTitle !== ""
        ? payload.jobTitle
        : undefined,
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

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await axiosClient.post("/auth/change-password", payload);
}
