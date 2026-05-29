"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

import AdminCard from "@/components/admin/shared/admin-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto,
  type AdminProfile,
} from "@/services/admin/admin-profile.service";

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

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

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
    <li className="flex items-center gap-3 border border-neutral-100 rounded-2xl px-3 py-3">
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAdminProfile()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch(console.error)
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
    } catch (err) {
      console.error("Failed to save:", err);
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
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
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
              name="file"
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
          </>
        )}

        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
          <div>
            <dt className="text-xs text-neutral-500">Department</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {profile.department ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Role</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {profile.jobTitle ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Member since</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {formatDate(profile.memberSince)}
            </dd>
          </div>
        </dl>

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
          <User className="size-4 text-primary" /> Personal details
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
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
              label="Date of Birth"
              value={
                form.dateOfBirth
                  ? (form.dateOfBirth as string).split("T")[0]
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
          <Briefcase className="size-4 text-primary" /> Work details
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
            <EditField
              label="Department"
              value={(form.department as string) ?? ""}
              onChange={(v) => handleChange("department", v)}
            />
            <EditField
              label="Job title"
              value={(form.jobTitle as string) ?? ""}
              onChange={(v) => handleChange("jobTitle", v)}
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            <InfoRow
              icon={<Briefcase className="size-4" />}
              label="Department"
              value={profile.department ?? "—"}
            />
            <InfoRow
              icon={<Briefcase className="size-4" />}
              label="Job title"
              value={profile.jobTitle ?? "—"}
            />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label="Member since"
              value={formatDate(profile.memberSince)}
            />
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
