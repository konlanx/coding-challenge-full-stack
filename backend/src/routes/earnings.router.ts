import { initServer } from '@ts-rest/express';
import { earningsContract } from '@shared/contract';
import { getOrganizationEarningsHandler, getEmployeeEarningsHandler } from './earnings';

const s = initServer();

export const earningsRouter = s.router(earningsContract, {
    getOrganizationEarnings: getOrganizationEarningsHandler,
    getEmployeeEarnings: getEmployeeEarningsHandler,
});
