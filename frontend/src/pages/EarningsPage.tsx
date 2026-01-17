import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { earningsClient, type Earning } from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

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

export function EarningsPage() {
    const { orgId } = useParams<{ orgId: string }>();
    const navigate = useNavigate();
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId) return;

        const loadEarnings = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await earningsClient.getOrganizationEarnings({
                    params: { orgId },
                });
                if (result.status === 200) {
                    setEarnings(result.body);
                } else {
                    setError('Failed to load earnings');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load earnings');
            } finally {
                setIsLoading(false);
            }
        };
        loadEarnings();
    }, [orgId]);

    // Group earnings by employee
    const earningsByEmployee = useMemo(() => {
        const grouped: Record<string, EmployeeEarning> = {};
        for (const earning of earnings) {
            if (!grouped[earning.employeeId]) {
                grouped[earning.employeeId] = {
                    employeeId: earning.employeeId,
                    employeeName: earning.employeeName,
                    totalEarning: 0,
                    dealCount: 0,
                };
            }
            grouped[earning.employeeId].totalEarning += earning.totalEarning;
            grouped[earning.employeeId].dealCount += earning.dealCount;
        }
        return Object.values(grouped).sort((a, b) => b.totalEarning - a.totalEarning);
    }, [earnings]);

    // Group earnings by incentive
    const earningsByIncentive = useMemo(() => {
        const grouped: Record<string, IncentiveEarning> = {};
        for (const earning of earnings) {
            if (!grouped[earning.incentiveId]) {
                grouped[earning.incentiveId] = {
                    incentiveId: earning.incentiveId,
                    incentiveName: earning.incentiveName,
                    totalEarning: 0,
                    dealCount: 0,
                };
            }
            grouped[earning.incentiveId].totalEarning += earning.totalEarning;
            grouped[earning.incentiveId].dealCount += earning.dealCount;
        }
        return Object.values(grouped).sort((a, b) => b.totalEarning - a.totalEarning);
    }, [earnings]);

    if (!orgId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">No organization ID provided</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading earnings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error</p>
                    <p className="text-muted-foreground mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
                    <p className="text-muted-foreground mt-2">
                        View commission earnings by employee or incentive
                    </p>
                </header>

                {earnings.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">No earnings found</p>
                    </div>
                ) : (
                    <Tabs defaultValue="by-employee" className="w-full">
                        <TabsList>
                            <TabsTrigger value="by-employee">By Employee</TabsTrigger>
                            <TabsTrigger value="by-incentive">By Incentive</TabsTrigger>
                        </TabsList>

                        <TabsContent value="by-employee">
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead className="text-right">Payouts</TableHead>
                                            <TableHead className="text-right">Total Earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {earningsByEmployee.map((item) => (
                                            <TableRow key={item.employeeId}>
                                                <TableCell className="font-medium">
                                                    {item.employeeName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.dealCount}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600 tabular-nums">
                                                    {formatCurrency(item.totalEarning)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="by-incentive">
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Incentive</TableHead>
                                            <TableHead className="text-right">Payouts</TableHead>
                                            <TableHead className="text-right">Total Earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {earningsByIncentive.map((item) => (
                                            <TableRow key={item.incentiveId}>
                                                <TableCell className="font-medium">
                                                    {item.incentiveName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.dealCount}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600 tabular-nums">
                                                    {formatCurrency(item.totalEarning)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
