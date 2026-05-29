import 'dotenv/config';

export default {
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.js',
  },
};
