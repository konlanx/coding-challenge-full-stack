import { prisma } from '../../prisma';

export const getIncentivesHandler = async ({
    params: { orgId },
}: {
    params: { orgId: string };
}) => {
    const incentives = await prisma.incentive.findMany({
        where: { organizationId: orgId },
        include: {
            beneficiaries: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

    return {
        status: 200 as const,
        body: incentives.map((incentive) => ({
            ...incentive,
            startDate: incentive.startDate.toISOString(),
            endDate: incentive.endDate?.toISOString() ?? null,
            createdAt: incentive.createdAt.toISOString(),
            updatedAt: incentive.updatedAt.toISOString(),
        })),
    };
};
