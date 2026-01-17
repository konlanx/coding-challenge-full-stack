import { initServer } from '@ts-rest/express';
import { dealsContract } from '@shared/contract';
import {
    getDealsHandler,
    createDealHandler,
    updateDealHandler,
    deleteDealHandler,
} from './deals';

const s = initServer();

export const dealsRouter = s.router(dealsContract, {
    getDeals: getDealsHandler,
    createDeal: createDealHandler,
    updateDeal: updateDealHandler,
    deleteDeal: deleteDealHandler,
});
