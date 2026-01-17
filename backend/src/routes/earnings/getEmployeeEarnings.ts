import { prisma } from '../../prisma';
import { Earning } from '@shared/schemas';

interface EarningsAccumulator {
    [key: string]: {
        employeeId: string;
        employeeName: string;
        incentiveId: string;
        incentiveName: string;
        totalEarning: number;
        dealCount: number;
    };
}

export const getEmployeeEarningsHandler = async ({
    params: { employeeId },
}: {
    params: { employeeId: string };
}) => {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, firstName: true, lastName: true, organizationId: true },
    });

    if (!employee) {
        return {
            status: 404 as const,
            body: { error: 'Employee not found' },
        };
    }

    const incentives = await prisma.incentive.findMany({
        where: {
            organizationId: employee.organizationId,
            status: 'ACTIVE',
            beneficiaries: {
                some: { id: employeeId },
            },
        },
    });

    const deals = await prisma.deal.findMany({
        where: {
            closeDate: { not: undefined },
            owners: {
                some: { employeeId },
            },
        },
        include: {
            owners: {
                where: { employeeId },
            },
        },
    });

    // Calculate earnings for each deal-incentive combination
    const earningsMap: EarningsAccumulator = {};
    const employeeName = `${employee.firstName} ${employee.lastName}`;

    for (const deal of deals) {
        if (!deal.closeDate) continue;

        const ownerRecord = deal.owners.find((o) => o.employeeId === employeeId);
        if (!ownerRecord) continue;

        for (const incentive of incentives) {
            // Check if deal closeDate is within incentive date range
            const dealCloseDate = deal.closeDate;
            const incentiveStart = incentive.startDate;
            const incentiveEnd = incentive.endDate;

            if (dealCloseDate < incentiveStart) continue;
            if (incentiveEnd && dealCloseDate > incentiveEnd) continue;

            // Calculate earning
            const earning =
                deal.value * ownerRecord.percentage * incentive.commissionPercentage;

            // Aggregate by incentive
            const key = incentive.id;
            if (!earningsMap[key]) {
                earningsMap[key] = {
                    employeeId,
                    employeeName,
                    incentiveId: incentive.id,
                    incentiveName: incentive.name,
                    totalEarning: 0,
                    dealCount: 0,
                };
            }
            earningsMap[key].totalEarning += earning;
            earningsMap[key].dealCount += 1;
        }
    }

    const earnings: Earning[] = Object.values(earningsMap);

    return {
        status: 200 as const,
        body: earnings,
    };
};
