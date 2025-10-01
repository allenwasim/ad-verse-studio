'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LeadForm } from '@/app/(dashboard)/leads/lead-form';
import type { Lead, Admin } from '@/lib/types';
import { useState } from 'react';

interface LeadSheetProps {
  lead?: Lead;
  admins: Admin[];
  children: React.ReactNode;
}

export function LeadSheet({ lead, admins, children }: LeadSheetProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead ? 'Edit Lead' : 'Create Lead'}</SheetTitle>
        </SheetHeader>
        <LeadForm lead={lead} admins={admins} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
