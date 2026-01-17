import { initClient } from '@ts-rest/core';
import { dealsContract, organizationsContract, incentivesContract, earningsContract } from '@shared/contract';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const dealsClient = initClient(dealsContract, {
    baseUrl: API_BASE_URL,
    baseHeaders: {},
});

export const organizationsClient = initClient(organizationsContract, {
    baseUrl: API_BASE_URL,
    baseHeaders: {},
});

export const incentivesClient = initClient(incentivesContract, {
    baseUrl: API_BASE_URL,
    baseHeaders: {},
});

export const earningsClient = initClient(earningsContract, {
    baseUrl: API_BASE_URL,
    baseHeaders: {},
});

export type { Deal, DealOwner, Organization, Employee, Incentive, Beneficiary, Earning } from '@shared/schemas';
