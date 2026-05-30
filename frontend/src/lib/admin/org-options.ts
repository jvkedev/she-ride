export const ADMIN_DEPARTMENT_OPTIONS = [
  { value: "OPERATIONS", label: "Operations" },
  { value: "SAFETY", label: "Safety" },
  { value: "SUPPORT", label: "Support" },
  { value: "FINANCE", label: "Finance" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MANAGEMENT", label: "Management" },
] as const;

export const ADMIN_JOB_TITLE_OPTIONS = [
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "OPERATIONS_MANAGER", label: "Operations Manager" },
  { value: "SAFETY_MANAGER", label: "Safety Manager" },
  { value: "SUPPORT_EXECUTIVE", label: "Support Executive" },
  { value: "FINANCE_OFFICER", label: "Finance Officer" },
  { value: "TECHNICAL_ADMINISTRATOR", label: "Technical Administrator" },
] as const;

export const ADMIN_PERMISSION_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export function labelDepartment(value?: string | null) {
  if (!value) return "—";
  return (
    ADMIN_DEPARTMENT_OPTIONS.find((o) => o.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}

export function labelJobTitle(value?: string | null) {
  if (!value) return "—";
  return (
    ADMIN_JOB_TITLE_OPTIONS.find((o) => o.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}

export function labelPermissionRole(value?: string | null) {
  if (!value) return "—";
  return ADMIN_PERMISSION_ROLE_LABELS[value] ?? value.replace(/_/g, " ");
}
