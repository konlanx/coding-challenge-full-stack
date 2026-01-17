import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDealHandler, updateDealHandler, deleteDealHandler, getDealsHandler } from '../deals';

vi.mock('../../prisma', () => ({
    prisma: {
        deal: {
            findMany: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        dealOwner: {
            deleteMany: vi.fn(),
        },
        $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn({
            deal: { update: vi.fn(), delete: vi.fn() },
            dealOwner: { deleteMany: vi.fn() },
        })),
    },
}));

import { prisma } from '../../prisma';

const TEST_CLOSE_DATE = '2026-02-15T00:00:00.000Z';

describe('createDeal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when owners array is empty', async () => {
        const result = await createDealHandler({
            body: { name: 'Test Deal', value: 1000, closeDate: TEST_CLOSE_DATE, owners: [] },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty('errors');
    });

    it('should return 400 when percentages do not sum to 1', async () => {
        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.5 }],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when percentage is greater than 1', async () => {
        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.5 }],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when percentage is negative', async () => {
        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: -0.1 },
                    { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 1.1 },
                ],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when employeeId is not a valid UUID', async () => {
        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: 'not-a-uuid', percentage: 1.0 }],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when closeDate is missing', async () => {
        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 }],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should create deal with valid single owner at 100%', async () => {
        const mockCreatedDeal = {
            id: 'deal-1',
            name: 'Test Deal',
            value: 1000,
            closeDate: new Date(TEST_CLOSE_DATE),
            owners: [
                {
                    id: 'owner-1',
                    dealId: 'deal-1',
                    employeeId: '550e8400-e29b-41d4-a716-446655440000',
                    percentage: 1.0,
                },
            ],
        };
        vi.mocked(prisma.deal.create).mockResolvedValue(mockCreatedDeal as any);

        const result = await createDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 }],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(prisma.deal.create).toHaveBeenCalled();
        expect(result.status).toBe(201);
        expect(result.body).toMatchObject({
            id: 'deal-1',
            name: 'Test Deal',
            value: 1000,
            closeDate: TEST_CLOSE_DATE,
        });
    });

    it('should create deal with multiple owners summing to 100%', async () => {
        const mockCreatedDeal = {
            id: 'deal-1',
            name: 'Multi-Owner Deal',
            value: 5000,
            closeDate: new Date(TEST_CLOSE_DATE),
            owners: [
                {
                    id: 'owner-1',
                    dealId: 'deal-1',
                    employeeId: '550e8400-e29b-41d4-a716-446655440000',
                    percentage: 0.6,
                },
                {
                    id: 'owner-2',
                    dealId: 'deal-1',
                    employeeId: '550e8400-e29b-41d4-a716-446655440001',
                    percentage: 0.4,
                },
            ],
        };
        vi.mocked(prisma.deal.create).mockResolvedValue(mockCreatedDeal as any);

        const result = await createDealHandler({
            body: {
                name: 'Multi-Owner Deal',
                value: 5000,
                closeDate: TEST_CLOSE_DATE,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.6 },
                    { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 0.4 },
                ],
            },
            params: {},
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(201);
        expect(result.body).toMatchObject({
            name: 'Multi-Owner Deal',
            value: 5000,
            closeDate: TEST_CLOSE_DATE,
        });
    });
});

describe('updateDeal', () => {
    const validDealId = '550e8400-e29b-41d4-a716-446655440099';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when owners array is empty', async () => {
        const result = await updateDealHandler({
            body: { name: 'Test Deal', value: 1000, closeDate: TEST_CLOSE_DATE, owners: [] },
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 400 when percentages do not sum to 1', async () => {
        const result = await updateDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.5 }],
            },
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(400);
    });

    it('should return 404 when deal does not exist', async () => {
        vi.mocked(prisma.deal.findUnique).mockResolvedValue(null);

        const result = await updateDealHandler({
            body: {
                name: 'Test Deal',
                value: 1000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 }],
            },
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Deal not found' });
    });

    it('should update deal with new owners', async () => {
        const existingDeal = { id: validDealId, name: 'Old Name', value: 500, closeDate: new Date(TEST_CLOSE_DATE) };
        const updatedDeal = {
            id: validDealId,
            name: 'Updated Deal',
            value: 2000,
            closeDate: new Date(TEST_CLOSE_DATE),
            owners: [
                {
                    id: 'owner-new',
                    dealId: validDealId,
                    employeeId: '550e8400-e29b-41d4-a716-446655440000',
                    percentage: 1.0,
                },
            ],
        };

        vi.mocked(prisma.deal.findUnique).mockResolvedValue(existingDeal as any);
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
            const mockTx = {
                dealOwner: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
                deal: { update: vi.fn().mockResolvedValue(updatedDeal) },
            };
            return fn(mockTx);
        });

        const result = await updateDealHandler({
            body: {
                name: 'Updated Deal',
                value: 2000,
                closeDate: TEST_CLOSE_DATE,
                owners: [{ employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 }],
            },
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.deal.findUnique).toHaveBeenCalledWith({ where: { id: validDealId } });
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(result.body).toMatchObject({
            id: validDealId,
            name: 'Updated Deal',
            value: 2000,
            closeDate: TEST_CLOSE_DATE,
        });
    });

    it('should update deal with multiple new owners', async () => {
        const existingDeal = { id: validDealId, name: 'Old Name', value: 500, closeDate: new Date(TEST_CLOSE_DATE) };
        const updatedDeal = {
            id: validDealId,
            name: 'Multi-Owner Update',
            value: 10000,
            closeDate: new Date(TEST_CLOSE_DATE),
            owners: [
                {
                    id: 'owner-1',
                    dealId: validDealId,
                    employeeId: '550e8400-e29b-41d4-a716-446655440000',
                    percentage: 0.7,
                },
                {
                    id: 'owner-2',
                    dealId: validDealId,
                    employeeId: '550e8400-e29b-41d4-a716-446655440001',
                    percentage: 0.3,
                },
            ],
        };

        vi.mocked(prisma.deal.findUnique).mockResolvedValue(existingDeal as any);
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
            const mockTx = {
                dealOwner: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
                deal: { update: vi.fn().mockResolvedValue(updatedDeal) },
            };
            return fn(mockTx);
        });

        const result = await updateDealHandler({
            body: {
                name: 'Multi-Owner Update',
                value: 10000,
                closeDate: TEST_CLOSE_DATE,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.7 },
                    { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 0.3 },
                ],
            },
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(result.body).toMatchObject({
            id: validDealId,
            name: 'Multi-Owner Update',
            value: 10000,
            closeDate: TEST_CLOSE_DATE,
        });
    });
});

describe('deleteDeal', () => {
    const validDealId = '550e8400-e29b-41d4-a716-446655440099';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 when deal does not exist', async () => {
        vi.mocked(prisma.deal.findUnique).mockResolvedValue(null);

        const result = await deleteDealHandler({
            body: undefined,
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Deal not found' });
    });

    it('should delete deal and return 204', async () => {
        const existingDeal = { id: validDealId, name: 'Deal to Delete', value: 1000, closeDate: new Date(TEST_CLOSE_DATE) };

        vi.mocked(prisma.deal.findUnique).mockResolvedValue(existingDeal as any);
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
            const mockTx = {
                dealOwner: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
                deal: { delete: vi.fn().mockResolvedValue(existingDeal) },
            };
            return fn(mockTx);
        });

        const result = await deleteDealHandler({
            body: undefined,
            params: { id: validDealId },
            query: {},
            headers: {},
        } as any);

        expect(prisma.deal.findUnique).toHaveBeenCalledWith({ where: { id: validDealId } });
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(result.status).toBe(204);
    });
});

describe('getDeals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return deals for a given owner', async () => {
        const mockDeals = [
            {
                id: 'deal-1',
                name: 'Test Deal',
                value: 1000,
                closeDate: new Date(TEST_CLOSE_DATE),
                owners: [
                    {
                        id: 'owner-1',
                        dealId: 'deal-1',
                        employeeId: 'emp-123',
                        percentage: 1.0,
                    },
                ],
            },
        ];
        vi.mocked(prisma.deal.findMany).mockResolvedValue(mockDeals as any);

        const result = await getDealsHandler({
            body: undefined,
            params: { ownerId: 'emp-123' },
            query: {},
            headers: {},
        } as any);

        expect(prisma.deal.findMany).toHaveBeenCalledWith({
            where: { owners: { some: { employeeId: 'emp-123' } } },
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
        expect(result.status).toBe(200);
        expect(result.body[0]).toMatchObject({
            id: 'deal-1',
            name: 'Test Deal',
            value: 1000,
            closeDate: TEST_CLOSE_DATE,
        });
    });

    it('should return empty array when no deals found', async () => {
        vi.mocked(prisma.deal.findMany).mockResolvedValue([]);

        const result = await getDealsHandler({
            body: undefined,
            params: { ownerId: 'emp-nonexistent' },
            query: {},
            headers: {},
        } as any);

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});
