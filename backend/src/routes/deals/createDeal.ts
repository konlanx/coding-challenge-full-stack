import { prisma } from '../../prisma';
import { z } from 'zod';
import { CreateDealSchema } from '@shared/schemas';

export const createDealHandler = async ({ body }: { body: unknown }) => {
    const result = CreateDealSchema.safeParse(body);
    if (!result.success) {
        return {
            status: 400 as const,
            body: { errors: z.treeifyError(result.error) },
        };
    }

    const { name, value, owners } = result.data;
    const deal = await prisma.deal.create({
        data: {
            name,
            value,
            owners: {
                create: owners.map((owner) => ({
                    employeeId: owner.employeeId,
                    percentage: owner.percentage,
                })),
            },
        },
        include: { owners: true },
    });

    return {
        status: 201 as const,
        body: deal,
    };
};
