import { prisma } from '../../prisma';

export const getDealsHandler = async ({ params: { ownerId } }: { params: { ownerId: string } }) => {
    const deals = await prisma.deal.findMany({
        where: { owners: { some: { employeeId: ownerId } } },
        include: { owners: true },
    });
    return {
        status: 200 as const,
        body: deals,
    };
};
