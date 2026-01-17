import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Trash2, ArrowLeft, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { incentivesClient, type Incentive } from '../api';
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
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { getInitials, formatPercentage } from '../lib/utils';
import { IncentiveDialog } from '../components/IncentiveDialog';

function formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function IncentivesPage() {
    const { orgId } = useParams<{ orgId: string }>();
    const navigate = useNavigate();
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [incentiveToEdit, setIncentiveToEdit] = useState<Incentive | null>(null);
    const [incentiveToDelete, setIncentiveToDelete] = useState<Incentive | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadIncentives = useCallback(async () => {
        if (!orgId) return;
        try {
            const result = await incentivesClient.getIncentives({ params: { orgId } });
            if (result.status === 200) {
                setIncentives(result.body);
            }
        } catch (err) {
            console.log(err);
        }
    }, [orgId]);

    const handleDeleteIncentive = async () => {
        if (!incentiveToDelete) return;

        setIsDeleting(true);
        try {
            const result = await incentivesClient.deleteIncentive({
                params: { id: incentiveToDelete.id },
            });

            if (result.status === 204) {
                toast.success('Incentive deleted successfully');
                setIncentiveToDelete(null);
                loadIncentives();
            } else {
                toast.error('Failed to delete incentive');
            }
        } catch {
            toast.error('Failed to delete incentive');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (!orgId) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const result = await incentivesClient.getIncentives({ params: { orgId } });

                if (result.status === 200) {
                    setIncentives(result.body);
                } else {
                    setError('Failed to load incentives');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load incentives');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [orgId]);

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
                <p className="text-muted-foreground">Loading incentives...</p>
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
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Incentives</h1>
                            <p className="text-muted-foreground mt-2">
                                Manage incentive plans and commission structures
                            </p>
                        </div>
                        <Button onClick={() => {
                            setIncentiveToEdit(null);
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Incentive
                        </Button>
                    </div>
                </header>

                {incentives.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">No incentives found</p>
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Commission</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Beneficiaries</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incentives.map((incentive) => (
                                    <TableRow key={incentive.id}>
                                        <TableCell className="font-medium align-top">
                                            <div>
                                                <p>{incentive.name}</p>
                                                {incentive.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {incentive.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {formatPercentage(incentive.commissionPercentage)}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {formatDate(incentive.startDate)}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {formatDate(incentive.endDate)}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {incentive.beneficiaries.length === 0 ? (
                                                <span className="text-muted-foreground text-sm">
                                                    No beneficiaries
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {incentive.beneficiaries.map((beneficiary) => (
                                                        <div
                                                            key={beneficiary.id}
                                                            className="flex items-center gap-1.5"
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(
                                                                        beneficiary.firstName,
                                                                        beneficiary.lastName
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">
                                                                {beneficiary.firstName}{' '}
                                                                {beneficiary.lastName}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${incentive.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : incentive.status === 'DRAFT'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {incentive.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setIncentiveToEdit(incentive);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setIncentiveToDelete(incentive)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <IncentiveDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setIncentiveToEdit(null);
                }}
                organizationId={orgId}
                onSuccess={loadIncentives}
                incentive={incentiveToEdit}
            />

            <AlertDialog
                open={!!incentiveToDelete}
                onOpenChange={(open) => !open && setIncentiveToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Incentive</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{incentiveToDelete?.name}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteIncentive}
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
