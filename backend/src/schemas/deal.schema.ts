import { z } from 'zod';
import type { DealOwnerUncheckedCreateWithoutDealInput } from '../../generated/prisma/models';

const DealOwnerSchema = z.object({
    employeeId: z.uuid(),
    percentage: z.number().min(0).max(1),
}) satisfies z.ZodType<Omit<DealOwnerUncheckedCreateWithoutDealInput, 'id' | 'dealId'>>;

const ownersArraySchema = z.array(DealOwnerSchema)
    .min(1, 'At least one owner is required')
    .refine(
        (owners) => {
            const sum = owners.reduce((acc, o) => acc + o.percentage, 0);
            return Math.abs(sum - 1) < 0.001;
        },
        { message: 'Split percentages must sum to exactly 1.0 (100%)' }
    );

export const CreateDealSchema = z.object({
    name: z.string().min(1),
    value: z.number().positive(),
    owners: ownersArraySchema,
});

export const UpdateDealSchema = CreateDealSchema;

export const DealIdParamSchema = z.object({
    id: z.uuid(),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
