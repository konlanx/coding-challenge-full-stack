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

export const getOrganizationEarningsHandler = async ({
    params: { orgId },
}: {
    params: { orgId: string };
}) => {
    // Get all active incentives for the organization with beneficiaries
    const incentives = await prisma.incentive.findMany({
        where: {
            organizationId: orgId,
            status: 'ACTIVE',
        },
        include: {
            beneficiaries: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

    // Get all deals with owners for this organization's employees
    const employees = await prisma.employee.findMany({
        where: { organizationId: orgId },
        select: { id: true },
    });
    const employeeIds = employees.map((e) => e.id);

    const deals = await prisma.deal.findMany({
        where: {
            closeDate: { not: undefined },
            owners: {
                some: {
                    employeeId: { in: employeeIds },
                },
            },
        },
        include: {
            owners: {
                include: {
                    employee: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            },
        },
    });

    // Calculate earnings: for each deal, for each owner, for each incentive where owner is beneficiary
    const earningsMap: EarningsAccumulator = {};

    for (const deal of deals) {
        if (!deal.closeDate) continue;

        for (const owner of deal.owners) {
            for (const incentive of incentives) {
                // Check if deal closeDate is within incentive date range
                const dealCloseDate = deal.closeDate;
                const incentiveStart = incentive.startDate;
                const incentiveEnd = incentive.endDate;

                if (dealCloseDate < incentiveStart) continue;
                if (incentiveEnd && dealCloseDate > incentiveEnd) continue;

                // Check if owner is a beneficiary of this incentive
                const isBeneficiary = incentive.beneficiaries.some(
                    (b) => b.id === owner.employeeId
                );
                if (!isBeneficiary) continue;

                // Calculate earning
                const earning =
                    deal.value * owner.percentage * incentive.commissionPercentage;

                // Aggregate by employee + incentive
                const key = `${owner.employeeId}-${incentive.id}`;
                if (!earningsMap[key]) {
                    earningsMap[key] = {
                        employeeId: owner.employeeId,
                        employeeName: `${owner.employee.firstName} ${owner.employee.lastName}`,
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
    }

    const earnings: Earning[] = Object.values(earningsMap);

    return {
        status: 200 as const,
        body: earnings,
    };
};
