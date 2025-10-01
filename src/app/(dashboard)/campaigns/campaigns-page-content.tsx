'use client';

import { useSearchParams } from 'next/navigation';
import { Lead, Campaign, Screen } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
 Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteCampaignAction } from '@/lib/actions';
import { EditCampaignWrapper } from '@/app/(dashboard)/campaigns/edit-campaign-wrapper';
import { DeleteDialogWrapper } from '@/components/delete-dialog-wrapper';
import React, { useState } from 'react';
import { ClientDate } from '@/app/(dashboard)/campaigns/client-date';


export function CampaignsPageContent({ allCampaigns, leads, screens }: { allCampaigns: Campaign[], leads: Lead[], screens: Screen[] }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getClientName = (clientId: string) => {
    return leads.find((l) => l.id === clientId)?.leadName || 'Unknown';
  };

  const campaigns = allCampaigns.filter(campaign => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    const clientName = getClientName(campaign.clientId).toLowerCase();
    return campaign.campaignName.toLowerCase().includes(searchTerm) || clientName.includes(searchTerm);
  });

  const getPaymentStatusVariant = (
    status: Campaign['paymentStatus']
  ): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
    }
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <React.Fragment key={campaign.id}>
                    <TableRow className={expandedRows[campaign.id] ? 'border-b-0' : ''}>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => toggleRow(campaign.id)}>
                                {expandedRows[campaign.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{campaign.campaignName}</span>
                            {campaign.category && <Badge variant="secondary" className="w-fit mt-1">{campaign.category}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{getClientName(campaign.clientId)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={getPaymentStatusVariant(campaign.paymentStatus)}>
                            {campaign.paymentStatus}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">₹{campaign.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <EditCampaignWrapper campaign={campaign} screens={screens} />
                                <DeleteDialogWrapper
                                onConfirm={async () => {
                                    await deleteCampaignAction(campaign.id);
                                }}
                                />
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    {expandedRows[campaign.id] && (
                        <TableRow className='bg-muted/50 hover:bg-muted/50'>
                            <TableCell colSpan={6}>
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div className="md:hidden">
                                        <div className="font-bold">Client</div>
                                        <div>{getClientName(campaign.clientId)}</div>
                                    </div>
                                    <div className="sm:hidden">
                                        <div className="font-bold">Status</div>
                                        <Badge variant={getPaymentStatusVariant(campaign.paymentStatus)}>
                                            {campaign.paymentStatus}
                                        </Badge>
                                    </div>
                                    <div className="sm:hidden">
                                        <div className="font-bold">Amount</div>
                                        <div>₹{campaign.amount.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Start Date</div>
                                        <div><ClientDate date={campaign.startDate} /></div>
                                    </div>
                                    <div>
                                        <div className="font-bold">End Date</div>
                                        <div><ClientDate date={campaign.endDate} /></div>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
