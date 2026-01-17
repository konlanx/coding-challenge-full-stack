import { prisma } from '../../prisma';

export const deleteIncentiveHandler = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const existingIncentive = await prisma.incentive.findUnique({ where: { id } });
    if (!existingIncentive) {
        return {
            status: 404 as const,
            body: { error: 'Incentive not found' },
        };
    }

    await prisma.incentive.update({
        where: { id },
        data: {
            beneficiaries: { set: [] },
        },
    });

    await prisma.incentive.delete({ where: { id } });

    return {
        status: 204 as const,
        body: undefined,
    };
};
