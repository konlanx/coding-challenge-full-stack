import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
    DealSchema,
    CreateDealSchema,
    UpdateDealSchema,
    OrganizationSchema,
    EmployeeSchema,
    IncentiveSchema,
    CreateIncentiveSchema,
    UpdateIncentiveSchema,
    EarningSchema,
} from './schemas';

const c = initContract();

export const dealsContract = c.router({
    getDeals: {
        method: 'GET',
        path: '/api/:ownerId/deals',
        pathParams: z.object({
            ownerId: z.uuid(),
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
            200: z.object({ success: z.boolean() }),
            400: z.object({ errors: z.unknown() }),
            404: z.object({ error: z.string() }),
        },
        summary: 'Delete a deal',
    },
});

export const organizationsContract = c.router({
    getOrganizations: {
        method: 'GET',
        path: '/api/organizations',
        responses: {
            200: z.array(OrganizationSchema),
        },
        summary: 'Get all organizations',
    },
    getEmployees: {
        method: 'GET',
        path: '/api/organizations/:orgId/employees',
        pathParams: z.object({
            orgId: z.uuid(),
        }),
        responses: {
            200: z.array(EmployeeSchema),
        },
        summary: 'Get all employees for an organization',
    },
    getEmployee: {
        method: 'GET',
        path: '/api/employees/:employeeId',
        pathParams: z.object({
            employeeId: z.uuid(),
        }),
        responses: {
            200: EmployeeSchema,
            404: z.object({ error: z.string() }),
        },
        summary: 'Get a single employee by ID',
    },
});

export type DealsContract = typeof dealsContract;
export type OrganizationsContract = typeof organizationsContract;

export const incentivesContract = c.router({
    getIncentives: {
        method: 'GET',
        path: '/api/organizations/:orgId/incentives',
        pathParams: z.object({
            orgId: z.uuid(),
        }),
        responses: {
            200: z.array(IncentiveSchema),
        },
        summary: 'Get all incentives for an organization',
    },
    getIncentive: {
        method: 'GET',
        path: '/api/incentives/:id',
        pathParams: z.object({
            id: z.uuid(),
        }),
        responses: {
            200: IncentiveSchema,
            404: z.object({ error: z.string() }),
        },
        summary: 'Get a single incentive by ID',
    },
    createIncentive: {
        method: 'POST',
        path: '/api/incentives',
        body: CreateIncentiveSchema,
        responses: {
            201: IncentiveSchema,
            400: z.object({ errors: z.unknown() }),
        },
        summary: 'Create a new incentive',
    },
    updateIncentive: {
        method: 'PUT',
        path: '/api/incentives/:id',
        pathParams: z.object({
            id: z.uuid(),
        }),
        body: UpdateIncentiveSchema,
        responses: {
            200: IncentiveSchema,
            400: z.object({ errors: z.unknown() }),
            404: z.object({ error: z.string() }),
        },
        summary: 'Update an existing incentive',
    },
    deleteIncentive: {
        method: 'DELETE',
        path: '/api/incentives/:id',
        pathParams: z.object({
            id: z.uuid(),
        }),
        responses: {
            204: z.undefined(),
            404: z.object({ error: z.string() }),
        },
        summary: 'Delete an incentive',
    },
});

export type IncentivesContract = typeof incentivesContract;

export const earningsContract = c.router({
    getOrganizationEarnings: {
        method: 'GET',
        path: '/api/organizations/:orgId/earnings',
        pathParams: z.object({
            orgId: z.uuid(),
        }),
        responses: {
            200: z.array(EarningSchema),
        },
        summary: 'Get all earnings for employees of an organization',
    },
});

export type EarningsContract = typeof earningsContract;
