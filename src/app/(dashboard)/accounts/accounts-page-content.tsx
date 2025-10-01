'use client';

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { deleteAccountEntryAction } from '@/lib/actions';
import { DeleteDialogWrapper } from '@/components/delete-dialog-wrapper';
import { EditAccountEntryWrapper } from '@/app/(dashboard)/accounts/edit-account-entry-wrapper';
import { AccountEntry } from '@/lib/types';
import React from 'react';
import { ClientDate } from '@/app/(dashboard)/accounts/client-date';
import { useAccounts, useCampaigns } from '@/lib/firestore';

export function AccountsPageContent() {
  const { data: allEntries, isLoading: isLoadingEntries, error: errorEntries } = useAccounts();
  const { data: campaigns, isLoading: isLoadingCampaigns, error: errorCampaigns } = useCampaigns();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;

  if (isLoadingEntries || isLoadingCampaigns) {
    return <div>Loading...</div>;
  }

  if (errorEntries || errorCampaigns) {
    return <div>Error loading data.</div>;
  }

  if (!allEntries || !campaigns) {
      return <div>Loading...</div>;
  }


  const getCampaignName = (campaignId?: string) => {
    if (!campaignId) return 'N/A';
    return campaigns.find(c => c.id === campaignId)?.campaignName || 'Unknown Campaign';
  };
  
  const getStatus = (entry: AccountEntry) => {
    return entry.entryType === 'Income' ? entry.incomeStatus : entry.expenseStatus;
  };

  const entries = allEntries.filter(entry => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    const details = entry.entryType === 'Income' ? entry.source : entry.category;
    const person = entry.entryType === 'Income' ? entry.receivedFrom : entry.paidTo;
    const campaignName = entry.relatedCampaignId ? getCampaignName(entry.relatedCampaignId) : '';

    return (
      (details && details.toLowerCase().includes(searchTerm)) ||
      (person && person.toLowerCase().includes(searchTerm)) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm)) ||
      (campaignName && campaignName.toLowerCase().includes(searchTerm))
    );
  });

  const totalIncome = entries.filter(e => e.entryType === 'Income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter(e => e.entryType === 'Expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;


  const getStatusVariant = (status?: 'Paid' | 'Pending' | 'Overdue'): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Pending': return 'secondary';
        case 'Overdue': return 'destructive';
        default: return 'secondary';
    }
  }


  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <span className="text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                </span>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <span className="text-red-500">
                    <ArrowDownLeft className="h-4 w-4" />
                </span>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{netProfit.toFixed(2)}
                </div>
                </CardContent>
            </Card>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell  className="hidden md:table-cell">
                    <Badge variant={entry.entryType === 'Income' ? 'default' : 'destructive'}>{entry.entryType}</Badge>
                  </TableCell>
                  <TableCell><ClientDate date={entry.date} /></TableCell>
                   <TableCell className="font-medium">
                      <div>
                        {entry.entryType === 'Income' ? entry.source : entry.category}
                        {entry.entryType === 'Income' && entry.relatedCampaignId && (
                            <span className="text-xs text-muted-foreground ml-2">({getCampaignName(entry.relatedCampaignId)})</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{entry.entryType === 'Income' ? entry.receivedFrom : entry.paidTo}</div>
                  </TableCell>
                  <TableCell  className="hidden md:table-cell"><Badge variant={getStatusVariant(getStatus(entry))}>{getStatus(entry)}</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${entry.entryType === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.entryType === 'Income' ? '+' : '-'}₹{entry.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <EditAccountEntryWrapper entry={entry} campaigns={campaigns} />
                        <DeleteDialogWrapper
                          onConfirm={async () => {
                            await deleteAccountEntryAction(entry.id);
                          }}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
