import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
    DealSchema,
    CreateDealSchema,
    UpdateDealSchema,
    OrganizationSchema,
    EmployeeSchema,
} from './schemas';

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
            orgId: z.string(),
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
            employeeId: z.string(),
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

