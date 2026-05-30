"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  User,
  Calendar,
  Briefcase,
  Pencil,
  X,
  Check,
  Upload,
  Loader2,
  Shield,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import AdminCard from "@/components/admin/shared/admin-card";
import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";
import { dashboardHeading } from "@/lib/dashboard/styles";
import {
  ADMIN_DEPARTMENT_OPTIONS,
  ADMIN_JOB_TITLE_OPTIONS,
} from "@/lib/admin/org-options";
import { cn } from "@/lib/utils";
import { useInvalidateAdminProfile } from "@/hooks/admin/use-admin-profile";
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto,
  changePassword,
  type AdminProfile,
} from "@/services/admin/admin-profile.service";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-100 px-3 py-3">
      <span className="shrink-0 text-neutral-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="truncate text-sm font-medium text-neutral-900">{value}</p>
      </div>
    </li>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  options,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  options?: { value: string; label: string }[];
  max?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-500">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}

export default function AdminProfilePanel() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<AdminProfile>>({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invalidateProfile = useInvalidateAdminProfile();

  useEffect(() => {
    getAdminProfile()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: keyof AdminProfile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateAdminProfile(form);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      invalidateProfile();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(profile ?? {});
    setEditing(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { profileImage } = await uploadAdminPhoto(file);
      setProfile((prev) => (prev ? { ...prev, profileImage } : prev));
      invalidateProfile();
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
      toast.success("Password updated");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : "Failed to change password";
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-sm text-neutral-500">
        Failed to load profile.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <AdminCard className="text-center">
        <div className="mx-auto">
          <div className="relative inline-block">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-700">
                {profile.name.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90 disabled:opacity-50"
              title="Upload photo"
            >
              {photoUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {editing ? (
          <div className="mt-4">
            <EditField
              label="Full Name"
              value={(form.name as string) ?? ""}
              onChange={(v) => handleChange("name", v)}
            />
          </div>
        ) : (
          <>
            <h2 className="mt-4 text-xl font-semibold text-neutral-900">
              {profile.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">She Ride Admin</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Shield className="size-3" />
              {profile.permissionRoleLabel}
            </span>
          </>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="size-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <X className="size-4" /> Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Pencil className="size-4" /> Edit Profile
            </button>
          )}
        </div>
      </AdminCard>

      <AdminCard>
        <h2 className={cn(dashboardHeading, "flex items-center gap-2")}>
          <User className="size-4 text-primary" /> Basic information
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
            <EditField
              label="Email"
              value={(form.email as string) ?? ""}
              onChange={(v) => handleChange("email", v)}
              type="email"
            />
            <EditField
              label="Phone number"
              value={(form.phoneNumber as string) ?? ""}
              onChange={(v) => handleChange("phoneNumber", v)}
            />
            <EditField
              label="Gender"
              value={(form.gender as string) ?? ""}
              onChange={(v) => handleChange("gender", v)}
              options={[
                { value: "FEMALE", label: "Female" },
                { value: "MALE", label: "Male" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <EditField
              label="Date of birth"
              value={
                form.dateOfBirth
                  ? String(form.dateOfBirth).split("T")[0]
                  : ""
              }
              onChange={(v) => handleChange("dateOfBirth", v)}
              type="date"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            <InfoRow
              icon={<Mail className="size-4" />}
              label="Email"
              value={profile.email}
            />
            <InfoRow
              icon={<Phone className="size-4" />}
              label="Phone"
              value={profile.phoneNumber}
            />
            <InfoRow
              icon={<User className="size-4" />}
              label="Gender"
              value={
                profile.gender
                  ? (GENDER_LABELS[profile.gender] ?? profile.gender)
                  : "—"
              }
            />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label="Date of birth"
              value={formatDate(profile.dateOfBirth)}
            />
          </ul>
        )}
      </AdminCard>

      <AdminCard>
        <h2 className={cn(dashboardHeading, "flex items-center gap-2")}>
          <Briefcase className="size-4 text-primary" /> Organization information
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
            <EditField
              label="Department"
              value={(form.department as string) ?? ""}
              onChange={(v) => handleChange("department", v)}
              options={[...ADMIN_DEPARTMENT_OPTIONS]}
            />
            <EditField
              label="Job title"
              value={(form.jobTitle as string) ?? ""}
              onChange={(v) => handleChange("jobTitle", v)}
              options={[...ADMIN_JOB_TITLE_OPTIONS]}
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            <InfoRow
              icon={<Briefcase className="size-4" />}
              label="Department"
              value={profile.departmentLabel ?? "—"}
            />
            <InfoRow
              icon={<Briefcase className="size-4" />}
              label="Job title"
              value={profile.jobTitleLabel ?? "—"}
            />
            <li className="flex items-center gap-3 rounded-2xl border border-neutral-100 px-3 py-3">
              <span className="shrink-0 text-neutral-400">
                <Shield className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Permission role</p>
                <span className="mt-0.5 inline-flex rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                  {profile.permissionRoleLabel}
                </span>
              </div>
            </li>
          </ul>
        )}
      </AdminCard>

      <AdminCard>
        <h2 className={dashboardHeading}>Profile actions</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Update your account security or sign out on this device.
        </p>

        <div className="mt-4 space-y-3">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Pencil className="size-4" />
              Update profile
            </button>
          ) : null}

          {!changingPassword ? (
            <button
              type="button"
              onClick={() => setChangingPassword(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <KeyRound className="size-4" />
              Change password
            </button>
          ) : (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-3 rounded-xl border border-neutral-100 p-4"
            >
              <EditField
                label="Current password"
                value={passwordForm.currentPassword}
                onChange={(v) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: v }))
                }
                type="password"
              />
              <EditField
                label="New password"
                value={passwordForm.newPassword}
                onChange={(v) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: v }))
                }
                type="password"
              />
              <EditField
                label="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(v) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: v }))
                }
                type="password"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {passwordSaving ? "Saving..." : "Save password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <DashboardLogoutButton />
        </div>
      </AdminCard>
    </div>
  );
}
