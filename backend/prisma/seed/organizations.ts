import { PrismaClient } from '../../generated/prisma/client';

export const organizations = [
  {
    id: 'org-acme-corp',
    name: 'Acme Corporation',
  },
];

export async function seedOrganizations(prisma: PrismaClient) {
  console.log('Seeding organizations...');

  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: {},
      create: org,
    });
  }

  console.log(`Seeded ${organizations.length} organizations`);
}
