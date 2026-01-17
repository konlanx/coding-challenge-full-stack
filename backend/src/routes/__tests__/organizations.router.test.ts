import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizationsRouter } from '../organizations.router';

vi.mock('../../prisma', () => ({
    prisma: {
        organization: {
            findMany: vi.fn(),
        },
        employee: {
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from '../../prisma';

const getOrganizationsHandler = organizationsRouter.getOrganizations;
const getEmployeesHandler = organizationsRouter.getEmployees;

describe('getOrganizations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return all organizations', async () => {
        const mockOrganizations = [
            { id: 'org-1', name: 'Acme Corp' },
            { id: 'org-2', name: 'Tech Inc' },
        ];
        vi.mocked(prisma.organization.findMany).mockResolvedValue(mockOrganizations);

        const result = await getOrganizationsHandler({
            params: {},
            query: {},
            headers: {},
            body: undefined,
        } as any);

        expect(prisma.organization.findMany).toHaveBeenCalled();
        expect(result.status).toBe(200);
        expect(result.body).toEqual(mockOrganizations);
    });

    it('should return empty array when no organizations exist', async () => {
        vi.mocked(prisma.organization.findMany).mockResolvedValue([]);

        const result = await getOrganizationsHandler({
            params: {},
            query: {},
            headers: {},
            body: undefined,
        } as any);

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});

describe('getEmployees', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return employees for an organization', async () => {
        const mockEmployees = [
            {
                id: 'emp-1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                organizationId: 'org-1',
            },
            {
                id: 'emp-2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                organizationId: 'org-1',
            },
        ];
        vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees);

        const result = await getEmployeesHandler({
            params: { orgId: 'org-1' },
            query: {},
            headers: {},
            body: undefined,
        } as any);

        expect(prisma.employee.findMany).toHaveBeenCalledWith({
            where: { organizationId: 'org-1' },
        });
        expect(result.status).toBe(200);
        expect(result.body).toEqual(mockEmployees);
    });

    it('should return empty array when no employees exist for organization', async () => {
        vi.mocked(prisma.employee.findMany).mockResolvedValue([]);

        const result = await getEmployeesHandler({
            params: { orgId: 'org-nonexistent' },
            query: {},
            headers: {},
            body: undefined,
        } as any);

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});
