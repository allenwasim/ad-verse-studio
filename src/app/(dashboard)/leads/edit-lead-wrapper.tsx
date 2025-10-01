'use client';

import { LeadSheet } from '@/app/(dashboard)/leads/lead-sheet';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Lead, Admin } from '@/lib/types';

export function EditLeadWrapper({ lead, admins }: { lead: Lead, admins: Admin[] }) {
    return (
        <LeadSheet lead={lead} admins={admins}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit
            </DropdownMenuItem>
        </LeadSheet>
    );
}
