'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Admin } from '@/lib/types';
import { useState } from 'react';
import { AdminSheet } from '@/app/(dashboard)/admins/admin-sheet';

export function EditAdminWrapper({ admin }: { admin: Admin }) {
    const [open, setOpen] = useState(false);
    return (
        <AdminSheet 
            admin={admin}
            open={open}
            onOpenChange={setOpen}
            trigger={<DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>Edit</DropdownMenuItem>}
        />
    )
}
