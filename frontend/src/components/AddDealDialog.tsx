import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import { dealsClient, organizationsClient, type Employee } from '../api';
import { toast } from 'sonner';

interface OwnerEntry {
    id: string;
    employeeId: string;
    percentage: string;
}

interface AddDealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentEmployeeId: string;
    organizationId: string;
    onSuccess: () => void;
}

export function AddDealDialog({
    open,
    onOpenChange,
    currentEmployeeId,
    organizationId,
    onSuccess,
}: AddDealDialogProps) {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [owners, setOwners] = useState<OwnerEntry[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && organizationId) {
            organizationsClient
                .getEmployees({ params: { orgId: organizationId } })
                .then((result) => {
                    if (result.status === 200) {
                        setEmployees(result.body);
                    }
                });
        }
    }, [open, organizationId]);

    useEffect(() => {
        if (open && currentEmployeeId) {
            setOwners([
                {
                    id: crypto.randomUUID(),
                    employeeId: currentEmployeeId,
                    percentage: '100',
                },
            ]);
            setName('');
            setValue('');
        }
    }, [open, currentEmployeeId]);

    const totalPercentage = useMemo(() => {
        return owners.reduce((sum, owner) => {
            const pct = parseFloat(owner.percentage) || 0;
            return sum + pct;
        }, 0);
    }, [owners]);

    const isValid = useMemo(() => {
        if (!name.trim()) return false;
        if (!value || parseFloat(value) <= 0) return false;
        if (owners.length === 0) return false;
        if (owners.some((o) => !o.employeeId)) return false;
        if (owners.some((o) => !o.percentage || o.percentage.trim() === '')) return false;
        return Math.abs(totalPercentage - 100) < 0.01;
    }, [name, value, owners, totalPercentage]);

    const addOwner = () => {
        setOwners([
            ...owners,
            { id: crypto.randomUUID(), employeeId: '', percentage: '' },
        ]);
    };

    const removeOwner = (id: string) => {
        setOwners(owners.filter((o) => o.id !== id));
    };

    const updateOwner = (id: string, field: 'employeeId' | 'percentage', val: string) => {
        setOwners(
            owners.map((o) => (o.id === id ? { ...o, [field]: val } : o))
        );
    };

    const isPercentageInvalid = (percentage: string): boolean => {
        if (!percentage || percentage.trim() === '') return true;
        const num = parseFloat(percentage);
        return isNaN(num) || num < 0 || num > 100;
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const result = await dealsClient.createDeal({
                body: {
                    name: name.trim(),
                    value: parseFloat(value),
                    owners: owners.map((o) => ({
                        employeeId: o.employeeId,
                        percentage: parseFloat(o.percentage) / 100,
                    })),
                },
            });

            if (result.status === 201) {
                onOpenChange(false);
                onSuccess();
                toast.success('Deal created successfully');
            } else {
                toast.error('Failed to create deal');
            }
        } catch {
            toast.error('Failed to create deal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const percentageStatus = useMemo(() => {
        const diff = totalPercentage - 100;
        if (Math.abs(diff) < 0.01) return { color: 'text-green-600', text: '✓ 100%' };
        if (diff > 0) return { color: 'text-red-600', text: `${totalPercentage.toFixed(0)}% (+${diff.toFixed(0)}%)` };
        return { color: 'text-amber-600', text: `${totalPercentage.toFixed(0)}% (${diff.toFixed(0)}%)` };
    }, [totalPercentage]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Deal Name</label>
                            <Input
                                placeholder="Enter deal name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Value ($)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Owners</label>
                            <span className={`text-sm font-medium ${percentageStatus.color}`}>
                                {percentageStatus.text}
                            </span>
                        </div>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead className="w-32">Percentage</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {owners.map((owner) => (
                                        <TableRow key={owner.id}>
                                            <TableCell>
                                                <Select
                                                    value={owner.employeeId}
                                                    onValueChange={(val) =>
                                                        updateOwner(owner.id, 'employeeId', val)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select employee" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employees
                                                            .filter(
                                                                (emp) =>
                                                                    emp.id === owner.employeeId ||
                                                                    !owners.some((o) => o.employeeId === emp.id)
                                                            )
                                                            .map((emp) => (
                                                                <SelectItem key={emp.id} value={emp.id}>
                                                                    {emp.firstName} {emp.lastName}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={owner.percentage}
                                                        onChange={(e) =>
                                                            updateOwner(owner.id, 'percentage', e.target.value)
                                                        }
                                                        className={`w-20 ${isPercentageInvalid(owner.percentage) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                    />
                                                    <span className="text-muted-foreground">%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOwner(owner.id)}
                                                    disabled={owners.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addOwner}
                            disabled={owners.length >= employees.length}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Owner
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Deal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
