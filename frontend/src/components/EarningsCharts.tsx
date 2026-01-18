import { useMemo } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from './ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface EmployeeEarning {
    employeeId: string;
    employeeName: string;
    totalEarning: number;
    dealCount: number;
}

interface IncentiveEarning {
    incentiveId: string;
    incentiveName: string;
    totalEarning: number;
    dealCount: number;
}

interface EarningsChartsProps {
    earningsByEmployee: EmployeeEarning[];
    earningsByIncentive: IncentiveEarning[];
}

const CHART_COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function EarningsCharts({
    earningsByEmployee,
    earningsByIncentive,
}: EarningsChartsProps) {
    const employeeChartData = useMemo(() => {
        return earningsByEmployee.map((item, index) => ({
            name: item.employeeName,
            value: item.totalEarning,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }, [earningsByEmployee]);

    const incentiveChartData = useMemo(() => {
        return earningsByIncentive.map((item, index) => ({
            name: item.incentiveName,
            value: item.totalEarning,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }, [earningsByIncentive]);

    const employeeChartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        earningsByEmployee.forEach((item, index) => {
            config[item.employeeName] = {
                label: item.employeeName,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return config;
    }, [earningsByEmployee]);

    const incentiveChartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        earningsByIncentive.forEach((item, index) => {
            config[item.incentiveName] = {
                label: item.incentiveName,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return config;
    }, [earningsByIncentive]);

    if (earningsByEmployee.length === 0 && earningsByIncentive.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {earningsByEmployee.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings by Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={employeeChartConfig}
                            className="mx-auto aspect-square max-h-[300px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="name"
                                            formatter={(value) =>
                                                formatCurrency(value as number)
                                            }
                                        />
                                    }
                                />
                                <Pie
                                    data={employeeChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={40}
                                >
                                    {employeeChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="name" />}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            {earningsByIncentive.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings by Incentive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={incentiveChartConfig}
                            className="mx-auto aspect-square max-h-[300px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="name"
                                            formatter={(value) =>
                                                formatCurrency(value as number)
                                            }
                                        />
                                    }
                                />
                                <Pie
                                    data={incentiveChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={40}
                                >
                                    {incentiveChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="name" />}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
