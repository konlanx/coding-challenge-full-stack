import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { apiClient, type Deal } from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function DealsPage() {
    const { ownerId } = useParams<{ ownerId: string }>();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ownerId) return;

        const loadDeals = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await apiClient.getDeals({ params: { ownerId } });
                if (result.status === 200) {
                    setDeals(result.body);
                } else {
                    setError('Failed to load deals');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load deals');
            } finally {
                setIsLoading(false);
            }
        };

        loadDeals();
    }, [ownerId]);

    if (!ownerId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">No owner ID provided</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading deals...</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and view all deals for this owner
                    </p>
                </header>

                {deals.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">No deals found</p>
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="hidden sm:table-cell">Owners</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Split Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deals.map((deal) => (
                                    <TableRow key={deal.id}>
                                        <TableCell className="font-medium">{deal.name}</TableCell>
                                        <TableCell>{formatCurrency(deal.value)}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {deal.owners.length}{' '}
                                            {deal.owners.length === 1 ? 'owner' : 'owners'}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {deal.owners
                                                .map((owner) => `${owner.percentage}%`)
                                                .join(', ')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
