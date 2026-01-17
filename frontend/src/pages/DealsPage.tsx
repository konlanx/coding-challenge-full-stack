import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dealsClient, organizationsClient, type Deal, type Employee } from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { OwnersList } from '../components/OwnersList';
import { AddDealDialog } from '../components/AddDealDialog';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function DealsPage() {
    const { ownerId } = useParams<{ ownerId: string }>();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadDeals = useCallback(async () => {
        if (!ownerId) return;
        try {
            const result = await dealsClient.getDeals({ params: { ownerId } });
            if (result.status === 200) {
                setDeals(result.body);
            }
        } catch (err) {
            console.log(err);
        }
    }, [ownerId]);

    const handleDeleteDeal = async () => {
        if (!dealToDelete) return;

        setIsDeleting(true);
        try {
            const result = await dealsClient.deleteDeal({
                params: { id: dealToDelete.id },
            });

            if (result.status === 204) {
                toast.success('Deal deleted successfully');
                setDealToDelete(null);
                loadDeals();
            } else {
                toast.error('Failed to delete deal');
            }
        } catch {
            toast.error('Failed to delete deal');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (!ownerId) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [dealsResult, employeeResult] = await Promise.all([
                    dealsClient.getDeals({ params: { ownerId } }),
                    organizationsClient.getEmployee({ params: { employeeId: ownerId } }),
                ]);

                if (dealsResult.status === 200) {
                    setDeals(dealsResult.body);
                } else {
                    setError('Failed to load deals');
                }

                if (employeeResult.status === 200) {
                    setEmployee(employeeResult.body);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load deals');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
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

    const employeeName = employee
        ? `${employee.firstName} ${employee.lastName}`
        : 'Unknown';

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Deals for {employeeName}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage and view all deals for this employee
                        </p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Deal
                    </Button>
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
                                    <TableHead>Owners</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deals.map((deal) => (
                                    <TableRow key={deal.id}>
                                        <TableCell className="font-medium align-top">{deal.name}</TableCell>
                                        <TableCell className="align-top">{formatCurrency(deal.value)}</TableCell>
                                        <TableCell className="align-top">
                                            <OwnersList owners={deal.owners} currentEmployeeId={ownerId} />
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setDealToDelete(deal)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <AddDealDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                currentEmployeeId={ownerId}
                organizationId={employee?.organizationId ?? ''}
                onSuccess={loadDeals}
            />

            <AlertDialog open={!!dealToDelete} onOpenChange={(open) => !open && setDealToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{dealToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDeal}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
