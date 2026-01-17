import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { createDeal } from '../deals';

vi.mock('../../prisma', () => ({
    prisma: {
        deal: {
            create: vi.fn(),
        },
    },
}));

import { prisma } from '../../prisma';

const mockRequest = (body: unknown): Partial<Request> => ({
    body,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
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
