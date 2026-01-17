import { prisma } from '../../prisma';
import { z } from 'zod';
import { CreateIncentiveSchema } from '@shared/schemas';

export const createIncentiveHandler = async ({ body }: { body: unknown }) => {
    const result = CreateIncentiveSchema.safeParse(body);
    if (!result.success) {
        return {
            status: 400 as const,
            body: { errors: z.treeifyError(result.error) },
        };
    }

    const {
        organizationId,
        name,
        description,
        type,
        commissionPercentage,
        startDate,
        endDate,
        status,
        beneficiaryIds,
    } = result.data;

    if (endDate && new Date(endDate) <= new Date(startDate)) {
        return {
            status: 400 as const,
            body: { errors: { endDate: 'End date must be after start date' } },
        };
    }

    const incentive = await prisma.incentive.create({
        data: {
            id: crypto.randomUUID(),
            organizationId,
            name,
            description: description ?? null,
            type,
            commissionPercentage,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            status,
            beneficiaries: {
                connect: beneficiaryIds.map((id) => ({ id })),
            },
        },
        include: {
            beneficiaries: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

    return {
        status: 201 as const,
        body: {
            ...incentive,
            startDate: incentive.startDate.toISOString(),
            endDate: incentive.endDate?.toISOString() ?? null,
            createdAt: incentive.createdAt.toISOString(),
            updatedAt: incentive.updatedAt.toISOString(),
        },
    };
};
