import { prisma } from '../../prisma';
import { z } from 'zod';
import { UpdateIncentiveSchema } from '@shared/schemas';

export const updateIncentiveHandler = async ({
    params: { id },
    body,
}: {
    params: { id: string };
    body: unknown;
}) => {
    const bodyResult = UpdateIncentiveSchema.safeParse(body);
    if (!bodyResult.success) {
        return {
            status: 400 as const,
            body: { errors: z.treeifyError(bodyResult.error) },
        };
    }

    const existingIncentive = await prisma.incentive.findUnique({ where: { id } });
    if (!existingIncentive) {
        return {
            status: 404 as const,
            body: { error: 'Incentive not found' },
        };
    }

    const {
        name,
        description,
        type,
        commissionPercentage,
        basePercentage,
        startDate,
        endDate,
        status,
        beneficiaryIds,
    } = bodyResult.data;

    if (endDate && new Date(endDate) <= new Date(startDate)) {
        return {
            status: 400 as const,
            body: { errors: { endDate: 'End date must be after start date' } },
        };
    }

    const incentive = await prisma.incentive.update({
        where: { id },
        data: {
            name,
            description: description ?? null,
            type,
            commissionPercentage,
            basePercentage,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            status,
            beneficiaries: {
                set: beneficiaryIds.map((beneficiaryId) => ({ id: beneficiaryId })),
            },
        },
        include: {
            beneficiaries: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

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
