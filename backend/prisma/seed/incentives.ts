import { PrismaClient, IncentiveStatus, IncentiveType } from '../../generated/prisma/client';

export const incentives = [
    {
        id: 'incentive-q1-sales-bonus',
        organizationId: 'org-acme-corp',
        name: 'Q1 Sales Bonus',
        description: 'Quarterly sales performance bonus for top performers',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 5.0,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        status: IncentiveStatus.ACTIVE,
    },
    {
        id: 'incentive-enterprise-accelerator',
        organizationId: 'org-acme-corp',
        name: 'Enterprise Deal Accelerator',
        description: 'Extra commission for closing enterprise-level deals over $100k',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 8.0,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: IncentiveStatus.ACTIVE,
    },
    {
        id: 'incentive-new-client-bonus',
        organizationId: 'org-acme-corp',
        name: 'New Client Acquisition Bonus',
        description: 'Bonus for bringing in new clients to the organization',
        type: IncentiveType.DEAL_PARTICIPATION,
        commissionPercentage: 3.5,
        startDate: new Date('2026-02-01'),
        endDate: null, // Ongoing incentive
        status: IncentiveStatus.ACTIVE,
    },
];

export const incentiveBeneficiaries: Record<string, string[]> = {
    'incentive-q1-sales-bonus': [
        'emp-alice-johnson',
        'emp-bob-smith',
        'emp-carol-martinez',
        'emp-david-lee',
    ],
    'incentive-enterprise-accelerator': [
        'emp-alice-johnson',
        'emp-carol-martinez',
    ],
    'incentive-new-client-bonus': [
        'emp-bob-smith',
        'emp-david-lee',
    ],
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
