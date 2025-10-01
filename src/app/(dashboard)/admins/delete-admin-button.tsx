'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteAdminAction } from '@/lib/actions';
import { DeleteDialog } from '@/components/delete-dialog';

export function DeleteAdminButton({ adminId }: { adminId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteAdminAction(adminId);
        toast({
          title: 'Success',
          description: 'Admin deleted successfully.',
        });
        setOpen(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete admin.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <DeleteDialog
      trigger={
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="text-destructive"
        >
          Delete
        </DropdownMenuItem>
      }
      onConfirm={handleDelete}
      open={open}
      onOpenChange={setOpen}
    />
  );
}