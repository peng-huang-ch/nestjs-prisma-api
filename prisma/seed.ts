import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

// initialize the Prisma Client
const prisma = new PrismaClient();

async function createUser() {
  const email = faker.string.alpha(5);
  const user = {
    name: faker.string.alpha(10),
    email,
    roles: ['admin'],
  };
  return await prisma.user.upsert({
    where: { email },
    update: user,
    create: { ...user, email },
  });
}

async function main() {
  const user = await createUser();
  console.log('user : ', user);
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close the Prisma Client at the end
    await prisma.$disconnect();
  });
