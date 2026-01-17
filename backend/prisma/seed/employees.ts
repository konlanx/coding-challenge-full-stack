import { PrismaClient } from '../../generated/prisma/client';

export const employees = [
    {
        id: 'emp-alice-johnson',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@acme.com',
        organizationId: 'org-acme-corp',
    },
    {
        id: 'emp-bob-smith',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@acme.com',
        organizationId: 'org-acme-corp',
    },
    {
        id: 'emp-carol-martinez',
        firstName: 'Carol',
        lastName: 'Martinez',
        email: 'carol.martinez@acme.com',
        organizationId: 'org-acme-corp',
    },
    {
        id: 'emp-david-lee',
        firstName: 'David',
        lastName: 'Lee',
        email: 'david.lee@acme.com',
        organizationId: 'org-acme-corp',
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
