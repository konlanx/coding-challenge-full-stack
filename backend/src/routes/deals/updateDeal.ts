import { prisma } from '../../prisma';
import { z } from 'zod';
import { UpdateDealSchema } from '@shared/schemas';

export const updateDealHandler = async ({
    params: { id },
    body,
}: {
    params: { id: string };
    body: unknown;
}) => {
    const bodyResult = UpdateDealSchema.safeParse(body);
    if (!bodyResult.success) {
        return {
            status: 400 as const,
            body: { errors: z.treeifyError(bodyResult.error) },
        };
    }

    const existingDeal = await prisma.deal.findUnique({ where: { id } });
    if (!existingDeal) {
        return {
            status: 404 as const,
            body: { error: 'Deal not found' },
        };
    }

    const { name, value, owners } = bodyResult.data;
    const deal = await prisma.$transaction(async (transaction) => {
        await transaction.dealOwner.deleteMany({ where: { dealId: id } });
        return transaction.deal.update({
            where: { id },
            data: {
                name,
                value,
                owners: {
                    create: owners.map((owner) => ({
                        id: crypto.randomUUID(),
                        employeeId: owner.employeeId,
                        percentage: owner.percentage,
                    })),
                },
            },
            include: {
                owners: {
                    include: {
                        employee: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
            },
        });
    });

    return {
        status: 200 as const,
        body: deal,
    };
};
