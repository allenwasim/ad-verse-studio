'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AccountEntry, Campaign } from '@/lib/types';
import { useState } from 'react';
import { AccountSheet } from '@/app/(dashboard)/accounts/account-sheet';

export function EditAccountEntryWrapper({ entry, campaigns }: { entry: AccountEntry, campaigns: Campaign[] }) {
    const [open, setOpen] = useState(false);
    return (
        <AccountSheet 
            entry={entry}
            campaigns={campaigns}
            open={open}
            onOpenChange={setOpen}
            trigger={<DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>Edit</DropdownMenuItem>}
        />
    )
}
