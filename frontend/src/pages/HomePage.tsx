import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Award, TrendingUp, Briefcase, Search } from 'lucide-react';
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
import { Input } from '../components/ui/input';
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
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees;
        const query = searchQuery.toLowerCase();
        return employees.filter(
            (employee) =>
                employee.firstName.toLowerCase().includes(query) ||
                employee.lastName.toLowerCase().includes(query)
        );
    }, [employees, searchQuery]);

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
                            <Award className="mr-2 h-4 w-4" />
                            Manage Incentives
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!selectedOrgId}
                            onClick={() => navigate(`/earnings/${selectedOrgId}`)}
                        >
                            <TrendingUp className="mr-2 h-4 w-4" />
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
                            <>
                                <div className="relative mb-4 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
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
                                            {filteredEmployees.map((employee) => (
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
                                                            <Briefcase className="mr-2 h-4 w-4" />
                                                            View Deals
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
