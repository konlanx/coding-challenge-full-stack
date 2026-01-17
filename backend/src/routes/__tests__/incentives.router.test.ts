import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createIncentiveHandler,
    updateIncentiveHandler,
    deleteIncentiveHandler,
    getIncentivesHandler,
    getIncentiveHandler,
} from '../incentives';

vi.mock('../../prisma', () => ({
    prisma: {
        incentive: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

import { prisma } from '../../prisma';

const validOrgId = '550e8400-e29b-41d4-a716-446655440001';
const validIncentiveId = '550e8400-e29b-41d4-a716-446655440200';
const validEmployeeId = '550e8400-e29b-41d4-a716-446655440010';

const mockIncentive = {
    id: validIncentiveId,
    organizationId: validOrgId,
    name: 'Q1 Sales Bonus',
    description: 'Quarterly bonus',
    type: 'DEAL_PARTICIPATION',
    commissionPercentage: 0.05,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-03-31'),
    status: 'ACTIVE',
    beneficiaries: [{ id: validEmployeeId, firstName: 'Alice', lastName: 'Johnson' }],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

describe('createIncentive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when name is empty', async () => {
        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: '',
                commissionPercentage: 0.05,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty('errors');
    });

    it('should return 400 when commission percentage is negative', async () => {
        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: 'Test Incentive',
                commissionPercentage: -5,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when commission percentage exceeds 1', async () => {
        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: 'Test Incentive',
                commissionPercentage: 1.5,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when organizationId is not a valid UUID', async () => {
        const result = await createIncentiveHandler({
            body: {
                organizationId: 'not-a-uuid',
                name: 'Test Incentive',
                commissionPercentage: 0.05,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when endDate is before startDate', async () => {
        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: 'Test Incentive',
                commissionPercentage: 0.05,
                startDate: '2026-03-01T00:00:00.000Z',
                endDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty('errors');
    });

    it('should create incentive with valid data', async () => {
        vi.mocked(prisma.incentive.create).mockResolvedValue(mockIncentive as any);

        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: 'Q1 Sales Bonus',
                description: 'Quarterly bonus',
                commissionPercentage: 0.05,
                startDate: '2026-01-01T00:00:00.000Z',
                endDate: '2026-03-31T00:00:00.000Z',
                status: 'ACTIVE',
                beneficiaryIds: [validEmployeeId],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(prisma.incentive.create).toHaveBeenCalled();
        expect(result.status).toBe(201);
    });

    it('should create incentive without beneficiaries', async () => {
        const incentiveWithoutBeneficiaries = { ...mockIncentive, beneficiaries: [] };
        vi.mocked(prisma.incentive.create).mockResolvedValue(incentiveWithoutBeneficiaries as any);

        const result = await createIncentiveHandler({
            body: {
                organizationId: validOrgId,
                name: 'Solo Incentive',
                commissionPercentage: 0.10,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(201);
    });
});

describe('updateIncentive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when name is empty', async () => {
        const result = await updateIncentiveHandler({
            body: {
                name: '',
                commissionPercentage: 0.05,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 404 when incentive does not exist', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(null);

        const result = await updateIncentiveHandler({
            body: {
                name: 'Updated Incentive',
                commissionPercentage: 0.05,
                startDate: '2026-01-01T00:00:00.000Z',
            },
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Incentive not found' });
    });

    it('should update incentive with new data', async () => {
        const existingIncentive = { id: validIncentiveId, name: 'Old Name' };
        const updatedIncentive = { ...mockIncentive, name: 'Updated Bonus' };

        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(existingIncentive as any);
        vi.mocked(prisma.incentive.update).mockResolvedValue(updatedIncentive as any);

        const result = await updateIncentiveHandler({
            body: {
                name: 'Updated Bonus',
                commissionPercentage: 0.10,
                startDate: '2026-01-01T00:00:00.000Z',
                endDate: '2026-06-30T00:00:00.000Z',
                status: 'ACTIVE',
                beneficiaryIds: [validEmployeeId],
            },
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.incentive.findUnique).toHaveBeenCalledWith({ where: { id: validIncentiveId } });
        expect(prisma.incentive.update).toHaveBeenCalled();
        expect(result.status).toBe(200);
    });

    it('should return 400 when endDate is before startDate', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(mockIncentive as any);

        const result = await updateIncentiveHandler({
            body: {
                name: 'Test Incentive',
                commissionPercentage: 0.05,
                startDate: '2026-06-01T00:00:00.000Z',
                endDate: '2026-01-01T00:00:00.000Z',
            },
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });
});

describe('deleteIncentive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 when incentive does not exist', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(null);

        const result = await deleteIncentiveHandler({
            body: undefined,
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Incentive not found' });
    });

    it('should delete incentive and return 204', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(mockIncentive as any);
        vi.mocked(prisma.incentive.update).mockResolvedValue(mockIncentive as any);
        vi.mocked(prisma.incentive.delete).mockResolvedValue(mockIncentive as any);

        const result = await deleteIncentiveHandler({
            body: undefined,
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.incentive.findUnique).toHaveBeenCalledWith({ where: { id: validIncentiveId } });
        expect(prisma.incentive.update).toHaveBeenCalledWith({
            where: { id: validIncentiveId },
            data: { beneficiaries: { set: [] } },
        });
        expect(prisma.incentive.delete).toHaveBeenCalledWith({ where: { id: validIncentiveId } });
        expect(result.status).toBe(204);
        expect(result.body).toBeUndefined();
    });
});

describe('getIncentives', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return incentives for an organization', async () => {
        const mockIncentives = [mockIncentive];
        vi.mocked(prisma.incentive.findMany).mockResolvedValue(mockIncentives as any);

        const result = await getIncentivesHandler({
            body: undefined,
            params: { orgId: validOrgId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.incentive.findMany).toHaveBeenCalledWith({
            where: { organizationId: validOrgId },
            include: {
                beneficiaries: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
    });

    it('should return empty array when no incentives found', async () => {
        vi.mocked(prisma.incentive.findMany).mockResolvedValue([]);

        const result = await getIncentivesHandler({
            body: undefined,
            params: { orgId: validOrgId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});

describe('getIncentive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return incentive by ID', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(mockIncentive as any);

        const result = await getIncentiveHandler({
            body: undefined,
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.incentive.findUnique).toHaveBeenCalledWith({
            where: { id: validIncentiveId },
            include: {
                beneficiaries: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        expect(result.status).toBe(200);
    });

    it('should return 404 when incentive not found', async () => {
        vi.mocked(prisma.incentive.findUnique).mockResolvedValue(null);

        const result = await getIncentiveHandler({
            body: undefined,
            params: { id: validIncentiveId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Incentive not found' });
    });
});
