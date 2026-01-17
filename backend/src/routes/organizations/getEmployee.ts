import { prisma } from '../../prisma';

export const getEmployeeHandler = async ({
    params: { employeeId },
}: {
    params: { employeeId: string };
}) => {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
    });

    if (!employee) {
        return {
            status: 404 as const,
            body: { error: 'Employee not found' },
        };
    }

    return {
        status: 200 as const,
        body: employee,
    };
};
