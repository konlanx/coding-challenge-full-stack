import { prisma } from '../../prisma';

export const getOrganizationsHandler = async () => {
    const organizations = await prisma.organization.findMany();
    return {
        status: 200 as const,
        body: organizations,
    };
};
