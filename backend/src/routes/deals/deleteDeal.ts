import { prisma } from '../../prisma';

export const deleteDealHandler = async ({ params: { id } }: { params: { id: string } }) => {
    const existingDeal = await prisma.deal.findUnique({ where: { id } });
    if (!existingDeal) {
        return {
            status: 404 as const,
            body: { error: 'Deal not found' },
        };
    }

    await prisma.$transaction(async (transaction) => {
        await transaction.dealOwner.deleteMany({ where: { dealId: id } });
        await transaction.deal.delete({ where: { id } });
    });

    return {
        status: 204 as const,
        body: undefined,
    };
};
