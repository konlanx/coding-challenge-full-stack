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

    const { name, value, closeDate, owners } = result.data;
    const deal = await prisma.deal.create({
        data: {
            id: crypto.randomUUID(),
            name,
            value,
            closeDate: new Date(closeDate),
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

    return {
        status: 201 as const,
        body: {
            ...deal,
            closeDate: deal.closeDate.toISOString(),
        },
    };
};
