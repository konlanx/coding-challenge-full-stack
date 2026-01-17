import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrganizationEarningsHandler, getEmployeeEarningsHandler } from '../earnings';

vi.mock('../../prisma', () => ({
    prisma: {
        incentive: {
            findMany: vi.fn(),
        },
        employee: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
        deal: {
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from '../../prisma';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440001';
const ALICE_ID = '550e8400-e29b-41d4-a716-446655440010';
const BOB_ID = '550e8400-e29b-41d4-a716-446655440011';
const INCENTIVE_ID = '550e8400-e29b-41d4-a716-446655440200';
const DEAL_ID = '550e8400-e29b-41d4-a716-446655440100';

describe('getOrganizationEarnings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty array when no incentives exist', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([]);
        vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([]);

        const result = await getOrganizationEarningsHandler({
            params: { orgId: ORG_ID },
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should return empty array when no deals match incentive date range', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.05,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                beneficiaries: [{ id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' }],
            },
        ] as any);
        vi.mocked(prisma.employee.findMany).mockResolvedValue([{ id: ALICE_ID }] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: DEAL_ID,
                name: 'Test Deal',
                value: 10000,
                closeDate: new Date('2025-06-15'), // Before incentive range
                owners: [
                    {
                        employeeId: ALICE_ID,
                        percentage: 1.0,
                        employee: { id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' },
                    },
                ],
            },
        ] as any);

        const result = await getOrganizationEarningsHandler({
            params: { orgId: ORG_ID },
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should calculate correct earnings for single owner beneficiary', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.05,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                beneficiaries: [{ id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' }],
            },
        ] as any);
        vi.mocked(prisma.employee.findMany).mockResolvedValue([{ id: ALICE_ID }] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: DEAL_ID,
                name: 'Test Deal',
                value: 100000,
                closeDate: new Date('2026-02-15'),
                owners: [
                    {
                        employeeId: ALICE_ID,
                        percentage: 1.0,
                        employee: { id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' },
                    },
                ],
            },
        ] as any);

        const result = await getOrganizationEarningsHandler({
            params: { orgId: ORG_ID },
        });

        expect(result.status).toBe(200);
        if (!Array.isArray(result.body)) throw new Error('Expected array');
        expect(result.body).toHaveLength(1);
        // 100000 * 1.0 * 0.05 = 5000
        expect(result.body[0].totalEarning).toBe(5000);
        expect(result.body[0].employeeName).toBe('Alice Smith');
        expect(result.body[0].dealCount).toBe(1);
    });

    it('should aggregate earnings from multiple deals per employee per incentive', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.05,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                beneficiaries: [{ id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' }],
            },
        ] as any);
        vi.mocked(prisma.employee.findMany).mockResolvedValue([{ id: ALICE_ID }] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: 'deal-1',
                name: 'Deal 1',
                value: 100000,
                closeDate: new Date('2026-01-15'),
                owners: [
                    {
                        employeeId: ALICE_ID,
                        percentage: 0.5,
                        employee: { id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' },
                    },
                ],
            },
            {
                id: 'deal-2',
                name: 'Deal 2',
                value: 50000,
                closeDate: new Date('2026-02-20'),
                owners: [
                    {
                        employeeId: ALICE_ID,
                        percentage: 1.0,
                        employee: { id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' },
                    },
                ],
            },
        ] as any);

        const result = await getOrganizationEarningsHandler({
            params: { orgId: ORG_ID },
        });

        expect(result.status).toBe(200);
        if (!Array.isArray(result.body)) throw new Error('Expected array');
        expect(result.body).toHaveLength(1);
        // Deal 1: 100000 * 0.5 * 0.05 = 2500
        // Deal 2: 50000 * 1.0 * 0.05 = 2500
        // Total: 5000
        expect(result.body[0].totalEarning).toBe(5000);
        expect(result.body[0].dealCount).toBe(2);
    });

    it('should not include earnings for owner who is not a beneficiary', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.05,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                beneficiaries: [{ id: ALICE_ID, firstName: 'Alice', lastName: 'Smith' }],
            },
        ] as any);
        vi.mocked(prisma.employee.findMany).mockResolvedValue([
            { id: ALICE_ID },
            { id: BOB_ID },
        ] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: DEAL_ID,
                name: 'Test Deal',
                value: 100000,
                closeDate: new Date('2026-02-15'),
                owners: [
                    {
                        employeeId: BOB_ID, // Bob is owner but not beneficiary
                        percentage: 1.0,
                        employee: { id: BOB_ID, firstName: 'Bob', lastName: 'Jones' },
                    },
                ],
            },
        ] as any);

        const result = await getOrganizationEarningsHandler({
            params: { orgId: ORG_ID },
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});

describe('getEmployeeEarnings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 when employee does not exist', async () => {
        vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

        const result = await getEmployeeEarningsHandler({
            params: { employeeId: ALICE_ID },
        });

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Employee not found' });
    });

    it('should return empty array when employee has no incentives', async () => {
        vi.mocked(prisma.employee.findUnique).mockResolvedValue({
            id: ALICE_ID,
            firstName: 'Alice',
            lastName: 'Smith',
            organizationId: ORG_ID,
        } as any);
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([]);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([]);

        const result = await getEmployeeEarningsHandler({
            params: { employeeId: ALICE_ID },
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should calculate correct earnings for employee', async () => {
        vi.mocked(prisma.employee.findUnique).mockResolvedValue({
            id: ALICE_ID,
            firstName: 'Alice',
            lastName: 'Smith',
            organizationId: ORG_ID,
        } as any);
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.10,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: DEAL_ID,
                name: 'Test Deal',
                value: 80000,
                closeDate: new Date('2026-02-01'),
                owners: [
                    {
                        employeeId: ALICE_ID,
                        percentage: 0.5,
                    },
                ],
            },
        ] as any);

        const result = await getEmployeeEarningsHandler({
            params: { employeeId: ALICE_ID },
        });

        expect(result.status).toBe(200);
        if (!Array.isArray(result.body)) throw new Error('Expected array');
        expect(result.body).toHaveLength(1);
        // 80000 * 0.5 * 0.10 = 4000
        expect(result.body[0].totalEarning).toBe(4000);
        expect(result.body[0].employeeName).toBe('Alice Smith');
        expect(result.body[0].incentiveName).toBe('Q1 Bonus');
        expect(result.body[0].dealCount).toBe(1);
    });

    it('should aggregate earnings across multiple deals for same incentive', async () => {
        vi.mocked(prisma.employee.findUnique).mockResolvedValue({
            id: ALICE_ID,
            firstName: 'Alice',
            lastName: 'Smith',
            organizationId: ORG_ID,
        } as any);
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([
            {
                id: INCENTIVE_ID,
                organizationId: ORG_ID,
                name: 'Q1 Bonus',
                description: null,
                type: 'DEAL_PARTICIPATION',
                commissionPercentage: 0.05,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ] as any);
        vi.mocked(prisma.deal.findMany).mockResolvedValue([
            {
                id: 'deal-1',
                name: 'Deal 1',
                value: 100000,
                closeDate: new Date('2026-01-15'),
                owners: [{ employeeId: ALICE_ID, percentage: 1.0 }],
            },
            {
                id: 'deal-2',
                name: 'Deal 2',
                value: 60000,
                closeDate: new Date('2026-02-10'),
                owners: [{ employeeId: ALICE_ID, percentage: 0.5 }],
            },
        ] as any);

        const result = await getEmployeeEarningsHandler({
            params: { employeeId: ALICE_ID },
        });

        expect(result.status).toBe(200);
        if (!Array.isArray(result.body)) throw new Error('Expected array');
        expect(result.body).toHaveLength(1);
        // Deal 1: 100000 * 1.0 * 0.05 = 5000
        // Deal 2: 60000 * 0.5 * 0.05 = 1500
        // Total: 6500
        expect(result.body[0].totalEarning).toBe(6500);
        expect(result.body[0].dealCount).toBe(2);
    });
});
