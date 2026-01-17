import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { organizationsClient, type Organization, type Employee } from '../api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { getInitials } from '../lib/utils';

const SELECTED_ORG_STORAGE_KEY = 'selectedOrganizationId';

export function HomePage() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
        return localStorage.getItem(SELECTED_ORG_STORAGE_KEY) || '';
    });
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            try {
                setIsLoadingOrgs(true);
                const result = await organizationsClient.getOrganizations();
                if (result.status === 200) {
                    setOrganizations(result.body);
                }
            } finally {
                setIsLoadingOrgs(false);
            }
        };
        loadOrganizations();
    }, []);

    useEffect(() => {
        if (!selectedOrgId && organizations.length > 0) {
            setSelectedOrgId(organizations[0].id);
        }
    }, [organizations, selectedOrgId]);

    useEffect(() => {
        if (selectedOrgId) {
            localStorage.setItem(SELECTED_ORG_STORAGE_KEY, selectedOrgId);
        }
    }, [selectedOrgId]);

    useEffect(() => {
        if (!selectedOrgId) {
            setEmployees([]);
            return;
        }

        const loadEmployees = async () => {
            try {
                setIsLoadingEmployees(true);
                const result = await organizationsClient.getEmployees({
                    params: { orgId: selectedOrgId },
                });
                if (result.status === 200) {
                    setEmployees(result.body);
                }
            } finally {
                setIsLoadingEmployees(false);
            }
        };
        loadEmployees();
    }, [selectedOrgId]);

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Select an organization to view employees and their deals
                    </p>
                </header>

                <div className="mb-8 flex items-center gap-4">
                    <div className="max-w-sm flex-1">
                        <Select
                            value={selectedOrgId}
                            onValueChange={setSelectedOrgId}
                            disabled={isLoadingOrgs}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button
                            variant="outline"
                            disabled={!selectedOrgId}
                            onClick={() => navigate(`/incentives/${selectedOrgId}`)}
                        >
                            Manage Incentives
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!selectedOrgId}
                            onClick={() => navigate(`/earnings/${selectedOrgId}`)}
                        >
                            View Earnings
                        </Button>
                    </div>
                </div>

                {selectedOrgId && (
                    <>
                        {isLoadingEmployees ? (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-muted-foreground">Loading employees...</p>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <p className="text-muted-foreground">No employees found</p>
                            </div>
                        ) : (
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16"></TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="hidden sm:table-cell">
                                                Email
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell>
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                employee.firstName,
                                                                employee.lastName
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {employee.firstName} {employee.lastName}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    {employee.email}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(`/deals/${employee.id}`)
                                                        }
                                                    >
                                                        View Deals
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
