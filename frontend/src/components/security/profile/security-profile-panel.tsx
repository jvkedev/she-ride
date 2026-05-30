"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  User,
  Calendar,
  Shield,
  Briefcase,
  Pencil,
  X,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import SecurityCard from "@/components/security/shared/security-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";
import {
  useSecurityProfile,
  useSetSecurityProfileCache,
  useInvalidateSecurityProfile,
} from "@/hooks/security/use-security-profile";
import {
  updateSecurityProfile,
  uploadSecurityPhoto,
  type SecurityProfile,
} from "@/services/security/security-profile.service";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  PENDING: "Pending",
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

export default function SecurityProfilePanel() {
  const { data: cachedProfile, isLoading: profileLoading } = useSecurityProfile();
  const setProfileCache = useSetSecurityProfileCache();
  const invalidateProfile = useInvalidateSecurityProfile();
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<SecurityProfile>>({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cachedProfile) {
      setProfile(cachedProfile);
      setForm(cachedProfile);
      setLoading(false);
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [cachedProfile, profileLoading]);

  function handleChange(key: keyof SecurityProfile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateSecurityProfile(form);
      setProfile(updated);
      setForm(updated);
      setProfileCache(updated);
      setEditing(false);
      invalidateProfile();
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
      const { profileImage } = await uploadSecurityPhoto(file);
      setProfile((prev) => {
        const next = prev ? { ...prev, profileImage } : prev;
        if (next) setProfileCache(next);
        return next;
      });
      invalidateProfile();
    } catch {
      toast.error("Failed to upload photo");
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

  const accountStatusLabel =
    ACCOUNT_STATUS_LABELS[profile.accountStatus] ?? profile.accountStatus;

  return (
    <div className="space-y-4">
      <SecurityCard className="text-center">
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
            <p className="mt-1 text-sm text-neutral-500">She Ride Security</p>
          </>
        )}

        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
          <div>
            <dt className="text-xs text-neutral-500">Role</dt>
            <dd className="font-semibold text-neutral-900">Security</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Member since</dt>
            <dd className="font-semibold text-neutral-900">
              {formatDate(profile.memberSince)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Status</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {accountStatusLabel}
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
      </SecurityCard>

      <SecurityCard>
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
      </SecurityCard>

      <SecurityCard>
        <h2 className={cn(dashboardHeading, "flex items-center gap-2")}>
          <Briefcase className="size-4 text-primary" /> Operations details
        </h2>
        <ul className="mt-4 space-y-3">
          <InfoRow
            icon={<Shield className="size-4" />}
            label="Team"
            value="Safety & Verification"
          />
          <InfoRow
            icon={<Briefcase className="size-4" />}
            label="Access level"
            value="Security staff"
          />
          <InfoRow
            icon={<Calendar className="size-4" />}
            label="Joined platform"
            value={formatDate(profile.memberSince)}
          />
        </ul>
      </SecurityCard>
    </div>
  );
}
