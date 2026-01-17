import { PrismaClient } from '../../generated/prisma/client';

export const employees = [
    {
        id: '550e8400-e29b-41d4-a716-446655440010',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@acme.com',
        organizationId: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440011',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@acme.com',
        organizationId: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440012',
        firstName: 'Carol',
        lastName: 'Martinez',
        email: 'carol.martinez@acme.com',
        organizationId: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440013',
        firstName: 'David',
        lastName: 'Lee',
        email: 'david.lee@acme.com',
        organizationId: '550e8400-e29b-41d4-a716-446655440001',
    },
];

export async function seedEmployees(prisma: PrismaClient) {
    console.log('Seeding employees...');

    for (const employee of employees) {
        await prisma.employee.upsert({
            where: { id: employee.id },
            update: {},
            create: employee,
        });
    }

    console.log(`Seeded ${employees.length} employees`);
}
