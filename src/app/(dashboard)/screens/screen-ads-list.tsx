
'use client';
import { Campaign, Lead } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ScreenAdsListProps = {
  campaigns: Campaign[];
  leads: Lead[];
};

const TOTAL_SLOTS = 12;

export function ScreenAdsList({ campaigns, leads }: ScreenAdsListProps) {
    const getClientName = (clientId: string) => {
        return leads.find(l => l.id === clientId)?.leadName || 'Unknown';
    }

    const getStatus = (startDate: Date, endDate: Date) => {
        const now = new Date();
        if (now >= startDate && now <= endDate) {
            return <Badge variant="default">Active</Badge>;
        }
        if (now < startDate) {
            return <Badge variant="secondary">Upcoming</Badge>;
        }
        return <Badge variant="outline">Finished</Badge>;
    }

    const filledSlots = campaigns.map(campaign => ({
        type: 'filled',
        data: campaign
    }));

    const emptySlotsCount = Math.max(0, TOTAL_SLOTS - campaigns.length);
    const emptySlots = Array(emptySlotsCount).fill({ type: 'empty' });

    const allSlots = [...filledSlots, ...emptySlots];


  return (
    <div>
        <h4 className="font-semibold text-lg mb-2">Scheduled Campaigns ({campaigns.length} / {TOTAL_SLOTS})</h4>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allSlots.map((slot, index) => (
                    <TableRow key={index}>
                        {slot.type === 'filled' ? (
                            <>
                                <TableCell>{slot.data.campaignName}</TableCell>
                                <TableCell>{getClientName(slot.data.clientId)}</TableCell>
                                <TableCell>{getStatus(new Date(slot.data.startDate), new Date(slot.data.endDate))}</TableCell>
                                <TableCell>{format(new Date(slot.data.startDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{format(new Date(slot.data.endDate), 'MMM d, yyyy')}</TableCell>
                            </>
                        ) : (
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Empty Slot
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
