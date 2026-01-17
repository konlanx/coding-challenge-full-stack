import { initClient } from '@ts-rest/core';
import { dealsContract } from '@shared/contract';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = initClient(dealsContract, {
    baseUrl: API_BASE_URL,
    baseHeaders: {},
});

export type { Deal, DealOwner } from '@shared/schemas';
