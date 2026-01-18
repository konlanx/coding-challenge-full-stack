import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from './ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Deal } from '../api';

interface DealsEarningsChartProps {
    deals: Deal[];
    currentEmployeeId: string;
}

export function DealsEarningsChart({
    deals,
    currentEmployeeId,
}: DealsEarningsChartProps) {
    const chartData = useMemo(() => {
        const sortedDeals = deals
            .map((deal) => {
                const owner = deal.owners.find(
                    (o) => o.employeeId === currentEmployeeId
                );
                if (!owner) return null;

                const earning = deal.value * owner.percentage;
                return {
                    date: deal.closeDate,
                    dateFormatted: formatDate(deal.closeDate),
                    earning,
                    dealName: deal.name,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedDeals.reduce<Array<typeof sortedDeals[0] & { accumulatedEarning: number }>>(
            (acc, item) => {
                const previousTotal = acc.length > 0 ? acc[acc.length - 1].accumulatedEarning : 0;
                acc.push({
                    ...item,
                    accumulatedEarning: previousTotal + item.earning,
                });
                return acc;
            },
            []
        );
    }, [deals, currentEmployeeId]);

    const chartConfig: ChartConfig = {
        accumulatedEarning: {
            label: 'Total Earnings',
            color: 'var(--color-chart-1)',
        },
    };

    if (chartData.length === 0) {
        return null;
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Accumulated Earnings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="dateFormatted"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={80}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelKey="dealName"
                                    formatter={(value) => formatCurrency(value as number)}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="accumulatedEarning"
                            stroke="var(--color-chart-1)"
                            fill="var(--color-chart-1)"
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
