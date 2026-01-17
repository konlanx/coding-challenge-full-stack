import { prisma } from '../../prisma';

export const getIncentiveHandler = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const incentive = await prisma.incentive.findUnique({
        where: { id },
        include: {
            beneficiaries: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

    if (!incentive) {
        return {
            status: 404 as const,
            body: { error: 'Incentive not found' },
        };
    }

    return {
        status: 200 as const,
        body: {
            ...incentive,
            startDate: incentive.startDate.toISOString(),
            endDate: incentive.endDate?.toISOString() ?? null,
            createdAt: incentive.createdAt.toISOString(),
            updatedAt: incentive.updatedAt.toISOString(),
        },
    };
};
