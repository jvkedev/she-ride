const {
  PrismaClient,
  UserRole,
  AdminDepartment,
  AdminJobTitle,
  AdminPermissionRole,
} = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureAdminProfiles() {
  const adminUsers = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: {
      id: true,
      fullName: true,
      admin: { select: { id: true } },
    },
  });

  let created = 0;

  for (const user of adminUsers) {
    if (user.admin) {
      console.log(`Admin profile already exists for ${user.fullName}`);
      continue;
    }

    await prisma.admin.create({
      data: {
        userId: user.id,
        department: AdminDepartment.OPERATIONS,
        jobTitle: AdminJobTitle.ADMINISTRATOR,
        permissionRole: AdminPermissionRole.ADMIN,
      },
    });

    created += 1;
    console.log(`Created admin profile for ${user.fullName}`);
  }

  const total = await prisma.admin.count();
  console.log(
    `Admins: ${created} profile(s) created. ${total} row(s) in admins table.`,
  );
}

async function ensureSecurityProfiles() {
  const securityUsers = await prisma.user.findMany({
    where: { role: UserRole.SECURITY },
    select: {
      id: true,
      fullName: true,
      securityStaff: { select: { id: true } },
    },
  });

  let created = 0;

  for (const user of securityUsers) {
    if (user.securityStaff) {
      console.log(`Security profile already exists for ${user.fullName}`);
      continue;
    }

    await prisma.securityStaff.create({
      data: { userId: user.id },
    });

    created += 1;
    console.log(`Created security profile for ${user.fullName}`);
  }

  const total = await prisma.securityStaff.count();
  console.log(
    `Security: ${created} profile(s) created. ${total} row(s) in security_staff table.`,
  );
}

async function main() {
  await ensureAdminProfiles();
  await ensureSecurityProfiles();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
