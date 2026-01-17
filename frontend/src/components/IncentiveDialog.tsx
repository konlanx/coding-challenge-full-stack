import { useState, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { incentivesClient, organizationsClient, type Employee, type Incentive } from '../api';
import { toast } from 'sonner';
import { getInitials, formatPercentageForInput, formatDateForInput, formatDateForApi } from '../lib/utils';

interface IncentiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    onSuccess: () => void;
    incentive?: Incentive | null;
}

type IncentiveStatus = 'ACTIVE' | 'DRAFT' | 'INACTIVE';

export function IncentiveDialog({
    open,
    onOpenChange,
    organizationId,
    onSuccess,
    incentive,
}: IncentiveDialogProps) {
    const isEditMode = !!incentive;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [commissionPercentage, setCommissionPercentage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<IncentiveStatus>('DRAFT');
    const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<string[]>([]);
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
        if (open) {
            if (incentive) {
                setName(incentive.name);
                setDescription(incentive.description || '');
                setCommissionPercentage(formatPercentageForInput(incentive.commissionPercentage * 100));
                setStartDate(formatDateForInput(incentive.startDate));
                setEndDate(incentive.endDate ? formatDateForInput(incentive.endDate) : '');
                setStatus(incentive.status);
                setSelectedBeneficiaryIds(incentive.beneficiaries.map((b) => b.id));
            } else {
                setName('');
                setDescription('');
                setCommissionPercentage('');
                setStartDate('');
                setEndDate('');
                setStatus('DRAFT');
                setSelectedBeneficiaryIds([]);
            }
        }
    }, [open, incentive]);

    const isPercentageInvalid = (percentage: string): boolean => {
        if (!percentage || percentage.trim() === '') return true;
        const num = parseFloat(percentage);
        return isNaN(num) || num <= 0 || num > 100;
    };

    const isDateRangeInvalid = useCallback((): boolean => {
        if (!startDate || !endDate) return false;
        return new Date(startDate) >= new Date(endDate);
    }, [endDate, startDate]);

    const isValid = useMemo(() => {
        if (!name.trim()) return false;
        if (isPercentageInvalid(commissionPercentage)) return false;
        if (!startDate) return false;
        if (isDateRangeInvalid()) return false;
        return true;
    }, [name, commissionPercentage, startDate, isDateRangeInvalid]);

    const addBeneficiary = (employeeId: string) => {
        if (!selectedBeneficiaryIds.includes(employeeId)) {
            setSelectedBeneficiaryIds([...selectedBeneficiaryIds, employeeId]);
        }
    };

    const removeBeneficiary = (employeeId: string) => {
        setSelectedBeneficiaryIds(selectedBeneficiaryIds.filter((id) => id !== employeeId));
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || undefined,
                commissionPercentage: parseFloat(commissionPercentage) / 100,
                startDate: formatDateForApi(startDate),
                endDate: endDate ? formatDateForApi(endDate) : null,
                status,
                beneficiaryIds: selectedBeneficiaryIds,
            };

            if (isEditMode && incentive) {
                const result = await incentivesClient.updateIncentive({
                    params: { id: incentive.id },
                    body: payload,
                });

                if (result.status === 200) {
                    onOpenChange(false);
                    onSuccess();
                    toast.success('Incentive updated successfully');
                } else {
                    toast.error('Failed to update incentive');
                }
            } else {
                const result = await incentivesClient.createIncentive({
                    body: {
                        ...payload,
                        organizationId,
                    },
                });

                if (result.status === 201) {
                    onOpenChange(false);
                    onSuccess();
                    toast.success('Incentive created successfully');
                } else {
                    toast.error('Failed to create incentive');
                }
            }
        } catch {
            toast.error(isEditMode ? 'Failed to update incentive' : 'Failed to create incentive');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableEmployees = employees.filter(
        (emp) => !selectedBeneficiaryIds.includes(emp.id)
    );

    const selectedEmployees = employees.filter((emp) =>
        selectedBeneficiaryIds.includes(emp.id)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Incentive' : 'Create New Incentive'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="Enter incentive name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Commission (%)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={commissionPercentage}
                                onChange={(e) => setCommissionPercentage(e.target.value)}
                                className={isPercentageInvalid(commissionPercentage) ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Enter description (optional)"
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={isDateRangeInvalid() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={isDateRangeInvalid() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={status} onValueChange={(val) => setStatus(val as IncentiveStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Beneficiaries</label>

                        {selectedEmployees.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedEmployees.map((emp) => (
                                    <div
                                        key={emp.id}
                                        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1"
                                    >
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(emp.firstName, emp.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">
                                            {emp.firstName} {emp.lastName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeBeneficiary(emp.id)}
                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Select
                            value=""
                            onValueChange={addBeneficiary}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Add beneficiary..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableEmployees.length === 0 ? (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                        No more employees available
                                    </div>
                                ) : (
                                    availableEmployees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                        {isSubmitting
                            ? (isEditMode ? 'Saving...' : 'Creating...')
                            : (isEditMode ? 'Save Changes' : 'Create Incentive')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
