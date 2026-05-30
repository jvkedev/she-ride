import {
  AdminDepartment,
  AdminJobTitle,
  AdminPermissionRole,
} from '@prisma/client';

export const ADMIN_DEPARTMENT_LABELS: Record<AdminDepartment, string> = {
  [AdminDepartment.OPERATIONS]: 'Operations',
  [AdminDepartment.SAFETY]: 'Safety',
  [AdminDepartment.SUPPORT]: 'Support',
  [AdminDepartment.FINANCE]: 'Finance',
  [AdminDepartment.TECHNOLOGY]: 'Technology',
  [AdminDepartment.MANAGEMENT]: 'Management',
};

export const ADMIN_JOB_TITLE_LABELS: Record<AdminJobTitle, string> = {
  [AdminJobTitle.ADMINISTRATOR]: 'Administrator',
  [AdminJobTitle.OPERATIONS_MANAGER]: 'Operations Manager',
  [AdminJobTitle.SAFETY_MANAGER]: 'Safety Manager',
  [AdminJobTitle.SUPPORT_EXECUTIVE]: 'Support Executive',
  [AdminJobTitle.FINANCE_OFFICER]: 'Finance Officer',
  [AdminJobTitle.TECHNICAL_ADMINISTRATOR]: 'Technical Administrator',
};

export const ADMIN_PERMISSION_ROLE_LABELS: Record<
  AdminPermissionRole,
  string
> = {
  [AdminPermissionRole.SUPER_ADMIN]: 'Super Admin',
  [AdminPermissionRole.ADMIN]: 'Admin',
};

export function getOrgOptions() {
  return {
    departments: Object.values(AdminDepartment).map((value) => ({
      value,
      label: ADMIN_DEPARTMENT_LABELS[value],
    })),
    jobTitles: Object.values(AdminJobTitle).map((value) => ({
      value,
      label: ADMIN_JOB_TITLE_LABELS[value],
    })),
  };
}

export function formatDepartmentLabel(
  value: AdminDepartment | null | undefined,
): string | null {
  if (!value) return null;
  return ADMIN_DEPARTMENT_LABELS[value] ?? value;
}

export function formatJobTitleLabel(
  value: AdminJobTitle | null | undefined,
): string | null {
  if (!value) return null;
  return ADMIN_JOB_TITLE_LABELS[value] ?? value;
}

export function formatPermissionRoleLabel(
  value: AdminPermissionRole | null | undefined,
): string | null {
  if (!value) return null;
  return ADMIN_PERMISSION_ROLE_LABELS[value] ?? value;
}
