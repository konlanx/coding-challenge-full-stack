import { PrismaClient } from '../../generated/prisma/client';

// Deals with various values
export const deals = [
    { id: 'deal-enterprise-saas', name: 'Enterprise SaaS Platform', value: 150000 },
    { id: 'deal-cloud-migration', name: 'Cloud Migration Project', value: 85000 },
    { id: 'deal-security-audit', name: 'Security Audit & Compliance', value: 45000 },
    { id: 'deal-mobile-app', name: 'Mobile App Development', value: 120000 },
    { id: 'deal-data-analytics', name: 'Data Analytics Dashboard', value: 65000 },
    { id: 'deal-api-integration', name: 'API Integration Suite', value: 38000 },
    { id: 'deal-devops-pipeline', name: 'DevOps Pipeline Setup', value: 28000 },
    { id: 'deal-crm-implementation', name: 'CRM Implementation', value: 95000 },
    { id: 'deal-ai-chatbot', name: 'AI Chatbot Solution', value: 72000 },
    { id: 'deal-ecommerce-platform', name: 'E-commerce Platform', value: 180000 },
];

// Deal owners with various split percentages
// Some deals have single owners (100%), others have multiple owners with splits
export const dealOwners = [
    // Enterprise SaaS - solo deal for Alice
    { dealId: 'deal-enterprise-saas', employeeId: 'emp-alice-johnson', percentage: 100 },

    // Cloud Migration - split between Bob and Carol
    { dealId: 'deal-cloud-migration', employeeId: 'emp-bob-smith', percentage: 60 },
    { dealId: 'deal-cloud-migration', employeeId: 'emp-carol-martinez', percentage: 40 },

    // Security Audit - solo deal for Carol
    { dealId: 'deal-security-audit', employeeId: 'emp-carol-martinez', percentage: 100 },

    // Mobile App - three-way split
    { dealId: 'deal-mobile-app', employeeId: 'emp-alice-johnson', percentage: 40 },
    { dealId: 'deal-mobile-app', employeeId: 'emp-david-lee', percentage: 35 },
    { dealId: 'deal-mobile-app', employeeId: 'emp-bob-smith', percentage: 25 },

    // Data Analytics - split between Alice and David
    { dealId: 'deal-data-analytics', employeeId: 'emp-alice-johnson', percentage: 50 },
    { dealId: 'deal-data-analytics', employeeId: 'emp-david-lee', percentage: 50 },

    // API Integration - solo deal for David
    { dealId: 'deal-api-integration', employeeId: 'emp-david-lee', percentage: 100 },

    // DevOps Pipeline - split between Bob and David
    { dealId: 'deal-devops-pipeline', employeeId: 'emp-bob-smith', percentage: 70 },
    { dealId: 'deal-devops-pipeline', employeeId: 'emp-david-lee', percentage: 30 },

    // CRM Implementation - solo deal for Bob
    { dealId: 'deal-crm-implementation', employeeId: 'emp-bob-smith', percentage: 100 },

    // AI Chatbot - four-way split (all team members)
    { dealId: 'deal-ai-chatbot', employeeId: 'emp-alice-johnson', percentage: 30 },
    { dealId: 'deal-ai-chatbot', employeeId: 'emp-bob-smith', percentage: 25 },
    { dealId: 'deal-ai-chatbot', employeeId: 'emp-carol-martinez', percentage: 25 },
    { dealId: 'deal-ai-chatbot', employeeId: 'emp-david-lee', percentage: 20 },

    // E-commerce Platform - split between Carol and Alice
    { dealId: 'deal-ecommerce-platform', employeeId: 'emp-carol-martinez', percentage: 55 },
    { dealId: 'deal-ecommerce-platform', employeeId: 'emp-alice-johnson', percentage: 45 },
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
