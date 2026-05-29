const { PrismaClient, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminUsers = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: {
      id: true,
      fullName: true,
      admin: { select: { id: true } },
    },
  });

  if (adminUsers.length === 0) {
    console.log('No ADMIN users found. Create an admin user first, then re-run seed.');
    return;
  }

  let created = 0;

  for (const user of adminUsers) {
    if (user.admin) {
      console.log(`Admin profile already exists for ${user.fullName}`);
      continue;
    }

    await prisma.admin.create({
      data: {
        userId: user.id,
        department: 'Operations',
        jobTitle: 'Platform Admin',
      },
    });

    created += 1;
    console.log(`Created admin profile for ${user.fullName}`);
  }

  const total = await prisma.admin.count();
  console.log(`Done. ${created} profile(s) created. ${total} row(s) in admins table.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
