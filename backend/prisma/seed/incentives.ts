import { PrismaClient, IncentiveStatus, IncentiveType } from '../../generated/prisma/client';

// Employee ID references
const ALICE = '550e8400-e29b-41d4-a716-446655440010';
const BOB = '550e8400-e29b-41d4-a716-446655440011';
const CAROL = '550e8400-e29b-41d4-a716-446655440012';
const DAVID = '550e8400-e29b-41d4-a716-446655440013';
const ORG_ACME = '550e8400-e29b-41d4-a716-446655440001';

export const incentives = [
    {
        id: '550e8400-e29b-41d4-a716-446655440200',
        organizationId: ORG_ACME,
        name: 'Q1 Sales Bonus',
        description: 'Quarterly sales performance bonus for top performers',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 0.05,
        basePercentage: 0, // No minimum ownership required
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        status: IncentiveStatus.ACTIVE,
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440201',
        organizationId: ORG_ACME,
        name: 'Enterprise Deal Accelerator',
        description: 'Extra commission for closing enterprise-level deals over $100k',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 0.08,
        basePercentage: 0.5, // Must own at least 50%
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: IncentiveStatus.ACTIVE,
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440202',
        organizationId: ORG_ACME,
        name: 'New Client Acquisition Bonus',
        description: 'Bonus for bringing in new clients to the organization',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 0.035,
        basePercentage: 0.25, // Must own at least 25%
        startDate: new Date('2026-02-01'),
        endDate: null, // Ongoing incentive
        status: IncentiveStatus.ACTIVE,
    },
];

export const incentiveBeneficiaries: Record<string, string[]> = {
    '550e8400-e29b-41d4-a716-446655440200': [ALICE, BOB, CAROL, DAVID],
    '550e8400-e29b-41d4-a716-446655440201': [ALICE, CAROL],
    '550e8400-e29b-41d4-a716-446655440202': [BOB, DAVID],
};

export async function seedIncentives(prisma: PrismaClient) {
    console.log('Seeding incentives...');

    for (const incentive of incentives) {
        const beneficiaryIds = incentiveBeneficiaries[incentive.id] || [];

        await prisma.incentive.upsert({
            where: { id: incentive.id },
            update: {
                beneficiaries: {
                    set: beneficiaryIds.map((id) => ({ id })),
                },
            },
            create: {
                ...incentive,
                beneficiaries: {
                    connect: beneficiaryIds.map((id) => ({ id })),
                },
            },
        });
    }

    console.log(`Seeded ${incentives.length} incentives`);
}
