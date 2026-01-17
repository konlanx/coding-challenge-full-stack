import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/client';
import { seedOrganizations } from './organizations';
import { seedEmployees } from './employees';
import { seedDeals } from './deals';
import { seedIncentives } from './incentives';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting database seeding...\n');
    console.log('Seeding to', connectionString);

    await seedOrganizations(prisma);
    await seedEmployees(prisma);
    await seedDeals(prisma);
    await seedIncentives(prisma);

    console.log('\nDatabase seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
