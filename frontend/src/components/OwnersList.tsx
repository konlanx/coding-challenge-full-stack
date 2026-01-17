import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { DealOwner } from '../api';

interface OwnersListProps {
    owners: DealOwner[];
    currentEmployeeId: string;
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function OwnerRow({ owner }: { owner: DealOwner }) {
    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                    {getInitials(owner.employee.firstName, owner.employee.lastName)}
                </AvatarFallback>
            </Avatar>
            <span className="text-sm">
                {owner.employee.firstName} {owner.employee.lastName}
            </span>
            <span className="text-muted-foreground text-sm">
                ({(owner.percentage).toFixed(0)}%)
            </span>
        </div>
    );
}

export function OwnersList({ owners, currentEmployeeId }: OwnersListProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const sortedOwners = [...owners].sort((a, b) => {
        if (a.employeeId === currentEmployeeId) return -1;
        if (b.employeeId === currentEmployeeId) return 1;
        return 0;
    });

    const currentOwner = sortedOwners[0];
    const otherOwners = sortedOwners.slice(1);
    const hasOthers = otherOwners.length > 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <OwnerRow owner={currentOwner} />
                {hasOthers && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="text-xs font-medium">+{otherOwners.length}</span>
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
            {isExpanded && otherOwners.map((owner) => (
                <OwnerRow key={owner.id} owner={owner} />
            ))}
        </div>
    );
}
