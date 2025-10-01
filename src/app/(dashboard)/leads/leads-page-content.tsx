'use client';

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { LeadSheet } from '@/app/(dashboard)/leads/lead-sheet';
import { deleteLeadAction } from '@/lib/actions';
import { EditLeadWrapper } from '@/app/(dashboard)/leads/edit-lead-wrapper';
import { DeleteDialogWrapper } from '@/components/delete-dialog-wrapper';
import { Badge } from '@/components/ui/badge';
import type { Lead, Admin, Task } from '@/lib/types';
import { isToday, isSameDay, parseISO } from 'date-fns';
import { LeadFilters } from '@/app/(dashboard)/leads/lead-filters';
import React, { useState } from 'react';
import { ClientDate } from '@/app/(dashboard)/leads/client-date';
import { TaskSheet } from './task-sheet';

export function LeadsPageContent({ allLeads, admins, allTasks }: { allLeads: Lead[], admins: Admin[], allTasks: Task[] }) {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const search = searchParams.get('search') || undefined;
  const adminFilter = searchParams.get('admin');
  const followUpDate = searchParams.get('date') || undefined;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const leads = allLeads.filter(lead => {
    let matches = true;

    if (filter && filter !== 'all') {
      if (filter === 'today-followup') matches = matches && !!(lead.followUpDate && isToday(new Date(lead.followUpDate)));
      if (filter === 'hot') matches = matches && lead.interestLevel === 'Hot';
      if (filter === 'closed') matches = matches && (lead.status === 'Converted' || lead.status === 'Lost');
    }

    if (adminFilter && adminFilter !== 'all') {
        matches = matches && lead.assignedTo === adminFilter;
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      const nameMatch = lead.leadName.toLowerCase().includes(searchTerm);
      const companyMatch = !!(lead.companyName && lead.companyName.toLowerCase().includes(searchTerm));
      matches = matches && (nameMatch || companyMatch);
    }
    
    if (followUpDate) {
      matches = matches && !!(lead.followUpDate && isSameDay(new Date(lead.followUpDate), parseISO(followUpDate)));
    }

    return matches;
  });

  const getLeadTasks = (leadId: string) => allTasks.filter(task => task.leadId === leadId);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusVariant = (status: Lead['status']): 'default' | 'secondary' | 'destructive' => {
      switch(status) {
        case 'New': return 'default';
        case 'Converted': return 'default';
        case 'Contacted': return 'secondary';
        case 'In Negotiation': return 'secondary';
        case 'Lost': return 'destructive';
        default: return 'secondary';
      }
  }
  
  const getInterestVariant = (level: Lead['interestLevel']): 'destructive' | 'default' | 'secondary' => {
      switch(level) {
          case 'Hot': return 'destructive';
          case 'Warm': return 'default';
          case 'Cold': return 'secondary';
          default: return 'secondary';
      }
  }

  const getAdminName = (adminId: string) => {
    return admins.find(a => a.id === adminId)?.name || 'Unassigned';
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <LeadFilters admins={admins} />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1 w-full sm:w-auto">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add...</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <LeadSheet admins={admins}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Create Lead</DropdownMenuItem>
              </LeadSheet>
              <TaskSheet leads={allLeads} admins={admins} tasks={[]}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Create Task</DropdownMenuItem>
              </TaskSheet>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Manage your potential clients and sales pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Lead Name</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Tasks</TableHead>
                <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const leadTasks = getLeadTasks(lead.id);
                const pendingTasks = leadTasks.filter(t => !t.completed).length;
                return (
                  <React.Fragment key={lead.id}>
                    <TableRow className={expandedRows[lead.id] ? 'border-b-0' : ''}>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => toggleRow(lead.id)}>
                          {expandedRows[lead.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                          <div className="truncate">{lead.leadName}</div>
                          <div className="text-sm text-muted-foreground truncate">{lead.companyName}</div>
                          {lead.category && <Badge variant="outline" className="mt-1">{lead.category}</Badge>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">
                        <TaskSheet leads={allLeads} admins={admins} leadId={lead.id} tasks={leadTasks}>
                           <Badge variant={pendingTasks > 0 ? 'destructive' : 'secondary'} role='button'>{pendingTasks} Pending</Badge>
                        </TaskSheet>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <ClientDate date={lead.followUpDate} />
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
                            <EditLeadWrapper lead={lead} admins={admins} />
                             <TaskSheet leads={allLeads} admins={admins} leadId={lead.id} tasks={leadTasks}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Manage Tasks</DropdownMenuItem>
                             </TaskSheet>
                            <DeleteDialogWrapper onConfirm={() => deleteLeadAction(lead.id)} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows[lead.id] && (
                        <TableRow className='bg-muted/50 hover:bg-muted/50'>
                            <TableCell colSpan={6}>
                                <div className="p-4 space-y-4">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
                                        <div className="sm:hidden">
                                            <div className='font-bold'>Status</div>
                                            <div><Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge></div>
                                        </div>
                                        <div className="md:hidden">
                                            <div className='font-bold'>Tasks</div>
                                            <TaskSheet leads={allLeads} admins={admins} leadId={lead.id} tasks={leadTasks}>
                                                <Badge variant={pendingTasks > 0 ? 'destructive' : 'secondary'} role='button'>{pendingTasks} Pending</Badge>
                                            </TaskSheet>
                                        </div>
                                        <div className="lg:hidden">
                                            <div className='font-bold'>Follow-up</div>
                                            <div><ClientDate date={lead.followUpDate} /></div>
                                        </div>
                                        <div>
                                            <div className='font-bold'>Interest</div>
                                            <Badge variant={getInterestVariant(lead.interestLevel)}>{lead.interestLevel}</Badge>
                                        </div>
                                        <div>
                                            <div className='font-bold'>Assigned To</div>
                                            <div>{getAdminName(lead.assignedTo)}</div>
                                        </div>
                                        <div>
                                            <div className='font-bold'>Category</div>
                                            <div>{lead.category}</div>
                                        </div>
                                        <div>
                                            <div className='font-bold'>Phone</div>
                                            <div>{lead.phoneNumber}</div>
                                        </div>
                                    </div>
                                     <div>
                                        <div className='font-bold'>Notes</div>
                                        <div className='text-sm text-muted-foreground'>{lead.notes.slice(-1)[0]?.noteText || 'No notes yet.'}</div>
                                    </div>
                                     <div>
                                        <div className='font-bold'>Tasks</div>
                                        <div className='text-sm text-muted-foreground'>{leadTasks.length > 0 ? `${leadTasks.filter(t => t.completed).length} / ${leadTasks.length} completed` : 'No tasks yet.'}</div>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
