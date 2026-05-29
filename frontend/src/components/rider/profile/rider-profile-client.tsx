"use client";
import { useEffect, useState, useRef } from "react";
import {
  getRiderProfile,
  RiderProfile,
  updateRiderProfile,
} from "@/services/profile/profile.service";
import RiderCard from "@/components/rider/shared/rider-card";
import {
  Mail,
  Phone,
  Wallet,
  Shield,
  MapPin,
  User,
  Calendar,
  Heart,
  Navigation,
  Bell,
  Pencil,
  X,
  Check,
  Upload,
} from "lucide-react";
import { uploadProfilePhoto } from "@/services/profile/profile.service";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const PREFERENCE_LABELS: Record<string, string> = {
  QUIET: "Quiet",
  CHATTY: "Chatty",
  WOMEN_ONLY: "Women Only",
  PET_FRIENDLY: "Pet Friendly",
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
    <li className="flex items-center gap-3 roundborder border-neutral-100 px-3 py-3">
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
          onChange={(e) => onChange(e.target.value)}
          max={max}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}

export default function RiderProfileClient() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<RiderProfile>>({});
  // Add ref and handler at the top of the component
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { profileImage } = await uploadProfilePhoto(file);
      setProfile((prev) => (prev ? { ...prev, profileImage } : prev));
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setPhotoUploading(false);
      e.target.value = ""; // reset input
    }
  }

  useEffect(() => {
    getRiderProfile()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: keyof RiderProfile, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateRiderProfile(form);
      setProfile((prev) => ({ ...prev!, ...updated }));
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(profile ?? {});
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
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
      <div className="text-center text-sm text-neutral-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Profile Card ── */}
      <RiderCard className="text-center">
        <div className="mx-auto">
          <div className="relative inline-block">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.fullName}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-700">
                {profile.fullName.charAt(0)}
              </div>
            )}
            {/* Upload Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90 disabled:opacity-50"
              title="Upload photo"
            >
              {photoUploading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
              value={(form.fullName as string) ?? ""}
              onChange={(v) => handleChange("fullName", v)}
            />
          </div>
        ) : (
          <>
            <h2 className="mt-4 text-xl font-semibold text-neutral-900">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">She Ride Rider</p>
          </>
        )}
        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
          <div>
            <dt className="text-xs text-neutral-500">Rating</dt>
            <dd className="font-semibold text-neutral-900">
              {profile.rating.toFixed(1)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Rides</dt>
            <dd className="font-semibold text-neutral-900">
              {profile.totalRides}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Member</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {formatMemberSince(profile.memberSince)}
            </dd>
          </div>
        </dl>

        {/* Edit / Save / Cancel buttons */}
        <div className="mt-4 flex justify-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="size-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <X className="size-4" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Pencil className="size-4" /> Edit Profile
            </button>
          )}
        </div>
      </RiderCard>

      {/* ── Contact Information ── */}
      <RiderCard>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Mail className="size-4 text-primary" /> Contact information
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
            <EditField
              label="Email"
              value={(form.email as string) ?? ""}
              onChange={(v) => handleChange("email", v)}
              type="email"
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
          </ul>
        )}
      </RiderCard>

      {/* ── Personal Details ── */}
      <RiderCard>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
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
            <EditField
              label="Ride Preference"
              value={(form.ridePreference as string) ?? ""}
              onChange={(v) => handleChange("ridePreference", v)}
              options={[
                { value: "QUIET", label: "Quiet" },
                { value: "CHATTY", label: "Chatty" },
                { value: "WOMEN_ONLY", label: "Women Only" },
                { value: "PET_FRIENDLY", label: "Pet Friendly" },
              ]}
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            <InfoRow
              icon={<User className="size-4" />}
              label="Gender"
              value={profile.gender ? GENDER_LABELS[profile.gender] : "—"}
            />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label="Date of Birth"
              value={formatDate(profile.dateOfBirth)}
            />
            <InfoRow
              icon={<Heart className="size-4" />}
              label="Ride Preference"
              value={
                profile.ridePreference
                  ? PREFERENCE_LABELS[profile.ridePreference]
                  : "—"
              }
            />
          </ul>
        )}
      </RiderCard>

      {/* ── Emergency Contact ── */}
      <RiderCard>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Shield className="size-4 text-primary" /> Emergency contact
        </h2>
        {editing ? (
          <div className="mt-4 space-y-3">
            <EditField
              label="Contact Name"
              value={(form.emergencyContactName as string) ?? ""}
              onChange={(v) => handleChange("emergencyContactName", v)}
            />
            <EditField
              label="Contact Phone"
              value={(form.emergencyContactPhone as string) ?? ""}
              onChange={(v) => handleChange("emergencyContactPhone", v)}
              type="tel"
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            <InfoRow
              icon={<User className="size-4" />}
              label="Name"
              value={profile.emergencyContactName ?? "—"}
            />
            <InfoRow
              icon={<Phone className="size-4" />}
              label="Phone"
              value={profile.emergencyContactPhone ?? "—"}
            />
          </ul>
        )}
      </RiderCard>
    </div>
  );
}
