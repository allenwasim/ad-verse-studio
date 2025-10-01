'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { DeleteDialog } from './delete-dialog';

export function DeleteDialogWrapper({ onConfirm }: { onConfirm: () => Promise<void> }) {
    const [open, setOpen] = useState(false);
    return (
        <DeleteDialog
            onConfirm={onConfirm}
            open={open}
            onOpenChange={setOpen}
            trigger={<DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }} className="text-destructive">Delete</DropdownMenuItem>}
        />
    )
}
