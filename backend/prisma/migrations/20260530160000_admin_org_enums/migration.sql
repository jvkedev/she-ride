-- Admin organizational enums and permission role

CREATE TYPE "AdminDepartment" AS ENUM (
  'OPERATIONS',
  'SAFETY_COMPLIANCE',
  'CUSTOMER_SUPPORT',
  'FINANCE',
  'HUMAN_RESOURCES',
  'TECHNOLOGY',
  'MANAGEMENT',
  'EXECUTIVE',
  'OTHER'
);

CREATE TYPE "AdminJobTitle" AS ENUM (
  'PLATFORM_ADMINISTRATOR',
  'OPERATIONS_MANAGER',
  'SAFETY_MANAGER',
  'SUPPORT_MANAGER',
  'FINANCE_MANAGER',
  'COMPLIANCE_OFFICER',
  'CUSTOMER_SUPPORT_EXECUTIVE',
  'SYSTEM_ADMINISTRATOR',
  'SUPER_ADMIN',
  'OTHER'
);

CREATE TYPE "AdminPermissionRole" AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'SUPPORT'
);

ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "permissionRole" "AdminPermissionRole" NOT NULL DEFAULT 'ADMIN';

-- Migrate department TEXT -> enum
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "department_enum" "AdminDepartment";

UPDATE "admins" SET "department_enum" = CASE
  WHEN "department" IS NULL THEN NULL
  WHEN LOWER(TRIM("department")) IN ('operations', 'operation') THEN 'OPERATIONS'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%safety%' OR LOWER("department") LIKE '%compliance%' THEN 'SAFETY_COMPLIANCE'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%support%' OR LOWER("department") LIKE '%customer%' THEN 'CUSTOMER_SUPPORT'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%finance%' THEN 'FINANCE'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%human%' OR LOWER("department") = 'hr' OR LOWER("department") LIKE '%human resources%' THEN 'HUMAN_RESOURCES'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%tech%' THEN 'TECHNOLOGY'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%management%' THEN 'MANAGEMENT'::"AdminDepartment"
  WHEN LOWER("department") LIKE '%executive%' THEN 'EXECUTIVE'::"AdminDepartment"
  ELSE 'OTHER'::"AdminDepartment"
END
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'admins' AND column_name = 'department' AND data_type = 'text'
);

UPDATE "admins" SET "department_enum" = 'OPERATIONS'::"AdminDepartment"
WHERE "department_enum" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'department' AND data_type = 'text'
  );

ALTER TABLE "admins" DROP COLUMN IF EXISTS "department";
ALTER TABLE "admins" RENAME COLUMN "department_enum" TO "department";

-- Migrate jobTitle TEXT -> enum
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "jobTitle_enum" "AdminJobTitle";

UPDATE "admins" SET "jobTitle_enum" = CASE
  WHEN "jobTitle" IS NULL THEN NULL
  WHEN LOWER("jobTitle") LIKE '%platform admin%' THEN 'PLATFORM_ADMINISTRATOR'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%operations manager%' THEN 'OPERATIONS_MANAGER'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%safety manager%' THEN 'SAFETY_MANAGER'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%support manager%' THEN 'SUPPORT_MANAGER'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%finance manager%' THEN 'FINANCE_MANAGER'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%compliance%' THEN 'COMPLIANCE_OFFICER'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%support executive%' OR LOWER("jobTitle") LIKE '%customer support%' THEN 'CUSTOMER_SUPPORT_EXECUTIVE'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%system admin%' THEN 'SYSTEM_ADMINISTRATOR'::"AdminJobTitle"
  WHEN LOWER("jobTitle") LIKE '%super admin%' THEN 'SUPER_ADMIN'::"AdminJobTitle"
  ELSE 'OTHER'::"AdminJobTitle"
END
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'admins' AND column_name = 'jobTitle' AND data_type = 'text'
);

UPDATE "admins" SET "jobTitle_enum" = 'PLATFORM_ADMINISTRATOR'::"AdminJobTitle"
WHERE "jobTitle_enum" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'jobTitle' AND data_type = 'text'
  );

ALTER TABLE "admins" DROP COLUMN IF EXISTS "jobTitle";
ALTER TABLE "admins" RENAME COLUMN "jobTitle_enum" TO "jobTitle";
