'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Lead, Campaign, Screen } from '@/lib/types';
import { useState } from 'react';
import { CampaignSheet } from '@/app/(dashboard)/campaigns/campaign-sheet';

export function EditCampaignWrapper({ campaign, screens, leads }: { campaign: Campaign, screens: Screen[], leads: Lead[] }) {
    const [open, setOpen] = useState(false);
    return (
        <CampaignSheet
            campaign={campaign}
            screens={screens}
            clients={leads}
            open={open}
            onOpenChange={setOpen}
            trigger={<DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>Edit</DropdownMenuItem>}
        />
    )
}
