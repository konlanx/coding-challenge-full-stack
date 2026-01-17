import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { DealSchema, CreateDealSchema, UpdateDealSchema } from './schemas';

const c = initContract();

export const dealsContract = c.router({
    getDeals: {
        method: 'GET',
        path: '/api/:ownerId/deals',
        pathParams: z.object({
            ownerId: z.string(),
        }),
        responses: {
            200: z.array(DealSchema),
        },
        summary: 'Get all deals for an owner',
    },
    createDeal: {
        method: 'POST',
        path: '/api/',
        body: CreateDealSchema,
        responses: {
            201: DealSchema,
            400: z.object({ errors: z.unknown() }),
        },
        summary: 'Create a new deal',
    },
    updateDeal: {
        method: 'PUT',
        path: '/api/:id',
        pathParams: z.object({
            id: z.uuid(),
        }),
        body: UpdateDealSchema,
        responses: {
            200: DealSchema,
            400: z.object({ errors: z.unknown() }),
            404: z.object({ error: z.string() }),
        },
        summary: 'Update an existing deal',
    },
    deleteDeal: {
        method: 'DELETE',
        path: '/api/:id',
        pathParams: z.object({
            id: z.uuid(),
        }),
        responses: {
            204: z.undefined(),
            400: z.object({ errors: z.unknown() }),
            404: z.object({ error: z.string() }),
        },
        body: z.undefined(),
        summary: 'Delete a deal',
    },
});

export type DealsContract = typeof dealsContract;
