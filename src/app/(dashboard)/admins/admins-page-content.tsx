'use client';

import React, { useState } from 'react';
import { Admin } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { EditAdminWrapper } from '@/app/(dashboard)/admins/edit-admin-wrapper';
import { DeleteAdminButton } from '@/app/(dashboard)/admins/delete-admin-button';
import { AdminSheet } from './admin-sheet';

export function AdminsPageContent({ admins }: { admins: Admin[] }) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admins</h2>
                <p className="text-muted-foreground">Manage admin users and their permissions.</p>
            </div>
            <AdminSheet
                trigger={
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Admin
                    </span>
                </Button>
                }
            />
        </div>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            <TableHead className="hidden sm:table-cell">Phone Number</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map((admin) => (
                            <React.Fragment key={admin.id}>
                                <TableRow className={expandedRows[admin.id] ? 'border-b-0' : ''}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => toggleRow(admin.id)}>
                                            {expandedRows[admin.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[150px] truncate" title={admin.name}>{admin.name}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={admin.email}>{admin.email || 'N/A'}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{admin.phoneNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <EditAdminWrapper admin={admin} />
                                                <DeleteAdminButton adminId={admin.id} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {expandedRows[admin.id] && (
                                    <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                        <TableCell colSpan={5}>
                                            <div className="p-4 grid grid-cols-1 gap-4 text-sm">
                                                <div className="md:hidden">
                                                    <p className='font-bold'>Email</p>
                                                    <p className="text-muted-foreground truncate">{admin.email || 'N/A'}</p>
                                                </div>
                                                <div className="sm:hidden">
                                                    <p className='font-bold'>Phone Number</p>
                                                    <p className="text-muted-foreground">{admin.phoneNumber || 'N/A'}</p>
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
