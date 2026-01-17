import { prisma } from '../../prisma';

export const getEmployeesHandler = async ({
    params: { orgId },
}: {
    params: { orgId: string };
}) => {
    const employees = await prisma.employee.findMany({
        where: { organizationId: orgId },
    });
    return {
        status: 200 as const,
        body: employees,
    };
};
