import { PrismaClient } from '../../generated/prisma/client';

export const deals = [
    { id: '550e8400-e29b-41d4-a716-446655440100', name: 'Enterprise SaaS Platform', value: 150000, closeDate: new Date('2026-01-15') },
    { id: '550e8400-e29b-41d4-a716-446655440101', name: 'Cloud Migration Project', value: 85000, closeDate: new Date('2026-02-10') },
    { id: '550e8400-e29b-41d4-a716-446655440102', name: 'Security Audit & Compliance', value: 45000, closeDate: new Date('2026-03-20') },
    { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Mobile App Development', value: 120000, closeDate: new Date('2026-01-28') },
    { id: '550e8400-e29b-41d4-a716-446655440104', name: 'Data Analytics Dashboard', value: 65000, closeDate: new Date('2026-04-05') },
    { id: '550e8400-e29b-41d4-a716-446655440105', name: 'API Integration Suite', value: 38000, closeDate: new Date('2026-05-12') },
    { id: '550e8400-e29b-41d4-a716-446655440106', name: 'DevOps Pipeline Setup', value: 28000, closeDate: new Date('2026-02-25') },
    { id: '550e8400-e29b-41d4-a716-446655440107', name: 'CRM Implementation', value: 95000, closeDate: new Date('2026-03-10') },
    { id: '550e8400-e29b-41d4-a716-446655440108', name: 'AI Chatbot Solution', value: 72000, closeDate: new Date('2026-06-01') },
    { id: '550e8400-e29b-41d4-a716-446655440109', name: 'E-commerce Platform', value: 180000, closeDate: new Date('2026-02-28') },
];

const ALICE = '550e8400-e29b-41d4-a716-446655440010';
const BOB = '550e8400-e29b-41d4-a716-446655440011';
const CAROL = '550e8400-e29b-41d4-a716-446655440012';
const DAVID = '550e8400-e29b-41d4-a716-446655440013';

export const dealOwners = [
    { dealId: '550e8400-e29b-41d4-a716-446655440100', employeeId: ALICE, percentage: 1.0 },

    { dealId: '550e8400-e29b-41d4-a716-446655440101', employeeId: BOB, percentage: 0.6 },
    { dealId: '550e8400-e29b-41d4-a716-446655440101', employeeId: CAROL, percentage: 0.4 },

    { dealId: '550e8400-e29b-41d4-a716-446655440102', employeeId: CAROL, percentage: 1.0 },

    { dealId: '550e8400-e29b-41d4-a716-446655440103', employeeId: ALICE, percentage: 0.4 },
    { dealId: '550e8400-e29b-41d4-a716-446655440103', employeeId: DAVID, percentage: 0.35 },
    { dealId: '550e8400-e29b-41d4-a716-446655440103', employeeId: BOB, percentage: 0.25 },

    { dealId: '550e8400-e29b-41d4-a716-446655440104', employeeId: ALICE, percentage: 0.5 },
    { dealId: '550e8400-e29b-41d4-a716-446655440104', employeeId: DAVID, percentage: 0.5 },

    { dealId: '550e8400-e29b-41d4-a716-446655440105', employeeId: DAVID, percentage: 1.0 },

    { dealId: '550e8400-e29b-41d4-a716-446655440106', employeeId: BOB, percentage: 0.7 },
    { dealId: '550e8400-e29b-41d4-a716-446655440106', employeeId: DAVID, percentage: 0.3 },

    { dealId: '550e8400-e29b-41d4-a716-446655440107', employeeId: BOB, percentage: 1.0 },

    { dealId: '550e8400-e29b-41d4-a716-446655440108', employeeId: ALICE, percentage: 0.3 },
    { dealId: '550e8400-e29b-41d4-a716-446655440108', employeeId: BOB, percentage: 0.25 },
    { dealId: '550e8400-e29b-41d4-a716-446655440108', employeeId: CAROL, percentage: 0.25 },
    { dealId: '550e8400-e29b-41d4-a716-446655440108', employeeId: DAVID, percentage: 0.2 },

    { dealId: '550e8400-e29b-41d4-a716-446655440109', employeeId: CAROL, percentage: 0.55 },
    { dealId: '550e8400-e29b-41d4-a716-446655440109', employeeId: ALICE, percentage: 0.45 },
];

export async function seedDeals(prisma: PrismaClient) {
    console.log('Seeding deals...');

    for (const deal of deals) {
        await prisma.deal.upsert({
            where: { id: deal.id },
            update: {},
            create: deal,
        });
    }

    console.log(`Seeded ${deals.length} deals`);

    console.log('Seeding deal owners...');

    await prisma.dealOwner.deleteMany({});

    for (const owner of dealOwners) {
        await prisma.dealOwner.create({
            data: owner,
        });
    }

    console.log(`Seeded ${dealOwners.length} deal ownership records`);
}
