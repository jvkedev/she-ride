-- Simplify admin organizational enums to match lightweight profile model

CREATE TYPE "AdminDepartment_new" AS ENUM (
  'OPERATIONS',
  'SAFETY',
  'SUPPORT',
  'FINANCE',
  'TECHNOLOGY',
  'MANAGEMENT'
);

CREATE TYPE "AdminJobTitle_new" AS ENUM (
  'ADMINISTRATOR',
  'OPERATIONS_MANAGER',
  'SAFETY_MANAGER',
  'SUPPORT_EXECUTIVE',
  'FINANCE_OFFICER',
  'TECHNICAL_ADMINISTRATOR'
);

CREATE TYPE "AdminPermissionRole_new" AS ENUM (
  'SUPER_ADMIN',
  'ADMIN'
);

ALTER TABLE "admins" ADD COLUMN "department_new" "AdminDepartment_new";
ALTER TABLE "admins" ADD COLUMN "jobTitle_new" "AdminJobTitle_new";
ALTER TABLE "admins" ADD COLUMN "permissionRole_new" "AdminPermissionRole_new" NOT NULL DEFAULT 'ADMIN';

UPDATE "admins" SET "department_new" = CASE
  WHEN "department"::text = 'OPERATIONS' THEN 'OPERATIONS'::"AdminDepartment_new"
  WHEN "department"::text IN ('SAFETY_COMPLIANCE') THEN 'SAFETY'::"AdminDepartment_new"
  WHEN "department"::text IN ('CUSTOMER_SUPPORT') THEN 'SUPPORT'::"AdminDepartment_new"
  WHEN "department"::text = 'FINANCE' THEN 'FINANCE'::"AdminDepartment_new"
  WHEN "department"::text = 'TECHNOLOGY' THEN 'TECHNOLOGY'::"AdminDepartment_new"
  WHEN "department"::text IN ('MANAGEMENT', 'HUMAN_RESOURCES', 'EXECUTIVE', 'OTHER') THEN 'MANAGEMENT'::"AdminDepartment_new"
  ELSE 'OPERATIONS'::"AdminDepartment_new"
END;

UPDATE "admins" SET "jobTitle_new" = CASE
  WHEN "jobTitle"::text IN ('PLATFORM_ADMINISTRATOR', 'SUPER_ADMIN', 'OTHER') THEN 'ADMINISTRATOR'::"AdminJobTitle_new"
  WHEN "jobTitle"::text = 'OPERATIONS_MANAGER' THEN 'OPERATIONS_MANAGER'::"AdminJobTitle_new"
  WHEN "jobTitle"::text = 'SAFETY_MANAGER' THEN 'SAFETY_MANAGER'::"AdminJobTitle_new"
  WHEN "jobTitle"::text IN ('SUPPORT_MANAGER', 'CUSTOMER_SUPPORT_EXECUTIVE') THEN 'SUPPORT_EXECUTIVE'::"AdminJobTitle_new"
  WHEN "jobTitle"::text IN ('FINANCE_MANAGER', 'COMPLIANCE_OFFICER') THEN 'FINANCE_OFFICER'::"AdminJobTitle_new"
  WHEN "jobTitle"::text = 'SYSTEM_ADMINISTRATOR' THEN 'TECHNICAL_ADMINISTRATOR'::"AdminJobTitle_new"
  ELSE 'ADMINISTRATOR'::"AdminJobTitle_new"
END;

UPDATE "admins" SET "permissionRole_new" = CASE
  WHEN "permissionRole"::text = 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::"AdminPermissionRole_new"
  ELSE 'ADMIN'::"AdminPermissionRole_new"
END;

ALTER TABLE "admins" DROP COLUMN "department";
ALTER TABLE "admins" DROP COLUMN "jobTitle";
ALTER TABLE "admins" DROP COLUMN "permissionRole";

ALTER TABLE "admins" RENAME COLUMN "department_new" TO "department";
ALTER TABLE "admins" RENAME COLUMN "jobTitle_new" TO "jobTitle";
ALTER TABLE "admins" RENAME COLUMN "permissionRole_new" TO "permissionRole";

ALTER TABLE "admins" ALTER COLUMN "permissionRole" SET DEFAULT 'ADMIN';

DROP TYPE "AdminDepartment";
DROP TYPE "AdminJobTitle";
DROP TYPE "AdminPermissionRole";

ALTER TYPE "AdminDepartment_new" RENAME TO "AdminDepartment";
ALTER TYPE "AdminJobTitle_new" RENAME TO "AdminJobTitle";
ALTER TYPE "AdminPermissionRole_new" RENAME TO "AdminPermissionRole";
