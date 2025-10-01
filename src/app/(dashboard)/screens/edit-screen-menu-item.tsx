'use client';

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type EditScreenMenuItemProps = {
    onSelect: () => void;
}

export function EditScreenMenuItem({ onSelect }: EditScreenMenuItemProps) {
    return (
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onSelect(); }}>
            Edit
        </DropdownMenuItem>
    )
}
