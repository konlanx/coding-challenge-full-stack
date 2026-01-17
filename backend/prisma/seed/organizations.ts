import { PrismaClient } from '../../generated/prisma/client';

export const organizations = [
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
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
