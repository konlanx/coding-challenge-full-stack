import { initServer } from '@ts-rest/express';
import { incentivesContract } from '@shared/contract';
import {
    getIncentivesHandler,
    getIncentiveHandler,
    createIncentiveHandler,
    updateIncentiveHandler,
    deleteIncentiveHandler,
} from './incentives';

const s = initServer();

export const incentivesRouter = s.router(incentivesContract, {
    getIncentives: getIncentivesHandler,
    getIncentive: getIncentiveHandler,
    createIncentive: createIncentiveHandler,
    updateIncentive: updateIncentiveHandler,
    deleteIncentive: deleteIncentiveHandler,
});
