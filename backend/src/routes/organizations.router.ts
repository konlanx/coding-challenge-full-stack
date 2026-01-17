import { initServer } from '@ts-rest/express';
import { organizationsContract } from '@shared/contract';
import { getOrganizationsHandler, getEmployeesHandler, getEmployeeHandler } from './organizations';

const s = initServer();

export const organizationsRouter = s.router(organizationsContract, {
    getOrganizations: getOrganizationsHandler,
    getEmployees: getEmployeesHandler,
    getEmployee: getEmployeeHandler,
});
