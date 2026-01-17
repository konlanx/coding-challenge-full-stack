import { z } from 'zod';

export const DealOwnerInputSchema = z.object({
    employeeId: z.uuid(),
    percentage: z.number().min(0).max(1),
});

export const DealOwnerSchema = z.object({
    id: z.string(),
    dealId: z.string(),
    employeeId: z.string(),
    percentage: z.number(),
    employee: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
    }),
});

export const DealSchema = z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    owners: z.array(DealOwnerSchema),
});

const ownersArraySchema = z
    .array(DealOwnerInputSchema)
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

export const OrganizationSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const EmployeeSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    organizationId: z.string(),
});

export type DealOwner = z.infer<typeof DealOwnerSchema>;
export type Deal = z.infer<typeof DealSchema>;
export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;

export const IncentiveStatusSchema = z.enum(['ACTIVE', 'DRAFT', 'INACTIVE']);
export const IncentiveTypeSchema = z.enum(['DEAL_PARTICIPATION']);

export const BeneficiarySchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
});

export const IncentiveSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: IncentiveTypeSchema,
    commissionPercentage: z.number(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    status: IncentiveStatusSchema,
    beneficiaries: z.array(BeneficiarySchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const CreateIncentiveSchema = z.object({
    organizationId: z.uuid(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    type: IncentiveTypeSchema.default('DEAL_PARTICIPATION'),
    commissionPercentage: z.number().min(0, 'Commission must be at least 0').max(1, 'Commission cannot exceed 1'),
    startDate: z.iso.datetime({ message: 'Invalid start date format' }),
    endDate: z.iso.datetime({ message: 'Invalid end date format' }).nullable().optional(),
    status: IncentiveStatusSchema.default('DRAFT'),
    beneficiaryIds: z.array(z.uuid()).default([]),
});

export const UpdateIncentiveSchema = CreateIncentiveSchema.omit({ organizationId: true });

export type IncentiveStatus = z.infer<typeof IncentiveStatusSchema>;
export type IncentiveType = z.infer<typeof IncentiveTypeSchema>;
export type Beneficiary = z.infer<typeof BeneficiarySchema>;
export type Incentive = z.infer<typeof IncentiveSchema>;
export type CreateIncentiveInput = z.infer<typeof CreateIncentiveSchema>;
export type UpdateIncentiveInput = z.infer<typeof UpdateIncentiveSchema>;
