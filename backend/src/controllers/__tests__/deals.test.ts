import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { createDeal, updateDeal, deleteDeal } from '../deals';

vi.mock('../../prisma', () => ({
    prisma: {
        deal: {
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

const mockRequest = (body: unknown, params: Record<string, string> = {}): Partial<Request> => ({
    body,
    params,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
};

describe('createDeal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when owners array is empty', async () => {
        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ errors: expect.anything() })
        );
    });

    it('should return 400 when percentages do not sum to 1', async () => {
        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [
                { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.5 },
            ],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
    });

    it('should return 400 when percentage is greater than 1', async () => {
        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [
                { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.5 },
            ],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when percentage is negative', async () => {
        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [
                { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: -0.1 },
                { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 1.1 },
            ],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when employeeId is not a valid UUID', async () => {
        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [{ employeeId: 'not-a-uuid', percentage: 1.0 }],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create deal with valid single owner at 100%', async () => {
        const mockCreatedDeal = {
            id: 'deal-1',
            name: 'Test Deal',
            value: 1000,
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

        const req = mockRequest({
            name: 'Test Deal',
            value: 1000,
            owners: [
                { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 },
            ],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(prisma.deal.create).toHaveBeenCalledWith({
            data: {
                name: 'Test Deal',
                value: 1000,
                owners: {
                    create: [
                        {
                            employeeId: '550e8400-e29b-41d4-a716-446655440000',
                            percentage: 1.0,
                        },
                    ],
                },
            },
            include: { owners: true },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreatedDeal);
    });

    it('should create deal with multiple owners summing to 100%', async () => {
        const mockCreatedDeal = {
            id: 'deal-1',
            name: 'Multi-Owner Deal',
            value: 5000,
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

        const req = mockRequest({
            name: 'Multi-Owner Deal',
            value: 5000,
            owners: [
                { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.6 },
                { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 0.4 },
            ],
        });
        const res = mockResponse();

        await createDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreatedDeal);
    });
});

describe('updateDeal', () => {
    const validDealId = '550e8400-e29b-41d4-a716-446655440099';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when id param is not a valid UUID', async () => {
        const req = mockRequest(
            { name: 'Test', value: 1000, owners: [] },
            { id: 'not-a-uuid' }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when owners array is empty', async () => {
        const req = mockRequest(
            { name: 'Test Deal', value: 1000, owners: [] },
            { id: validDealId }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when percentages do not sum to 1', async () => {
        const req = mockRequest(
            {
                name: 'Test Deal',
                value: 1000,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.5 },
                ],
            },
            { id: validDealId }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when deal does not exist', async () => {
        vi.mocked(prisma.deal.findUnique).mockResolvedValue(null);

        const req = mockRequest(
            {
                name: 'Test Deal',
                value: 1000,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 },
                ],
            },
            { id: validDealId }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Deal not found' });
    });

    it('should update deal with new owners', async () => {
        const existingDeal = { id: validDealId, name: 'Old Name', value: 500 };
        const updatedDeal = {
            id: validDealId,
            name: 'Updated Deal',
            value: 2000,
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

        const req = mockRequest(
            {
                name: 'Updated Deal',
                value: 2000,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 1.0 },
                ],
            },
            { id: validDealId }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(prisma.deal.findUnique).toHaveBeenCalledWith({ where: { id: validDealId } });
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(updatedDeal);
    });

    it('should update deal with multiple new owners', async () => {
        const existingDeal = { id: validDealId, name: 'Old Name', value: 500 };
        const updatedDeal = {
            id: validDealId,
            name: 'Multi-Owner Update',
            value: 10000,
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

        const req = mockRequest(
            {
                name: 'Multi-Owner Update',
                value: 10000,
                owners: [
                    { employeeId: '550e8400-e29b-41d4-a716-446655440000', percentage: 0.7 },
                    { employeeId: '550e8400-e29b-41d4-a716-446655440001', percentage: 0.3 },
                ],
            },
            { id: validDealId }
        );
        const res = mockResponse();

        await updateDeal(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith(updatedDeal);
    });
});

describe('deleteDeal', () => {
    const validDealId = '550e8400-e29b-41d4-a716-446655440099';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when id param is not a valid UUID', async () => {
        const req = mockRequest({}, { id: 'not-a-uuid' });
        const res = mockResponse();

        await deleteDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when deal does not exist', async () => {
        vi.mocked(prisma.deal.findUnique).mockResolvedValue(null);

        const req = mockRequest({}, { id: validDealId });
        const res = mockResponse();

        await deleteDeal(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Deal not found' });
    });

    it('should delete deal and return 204', async () => {
        const existingDeal = { id: validDealId, name: 'Deal to Delete', value: 1000 };

        vi.mocked(prisma.deal.findUnique).mockResolvedValue(existingDeal as any);
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
            const mockTx = {
                dealOwner: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
                deal: { delete: vi.fn().mockResolvedValue(existingDeal) },
            };
            return fn(mockTx);
        });

        const req = mockRequest({}, { id: validDealId });
        const res = mockResponse();

        await deleteDeal(req as Request, res as Response);

        expect(prisma.deal.findUnique).toHaveBeenCalledWith({ where: { id: validDealId } });
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});
