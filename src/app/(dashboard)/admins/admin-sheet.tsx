'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Admin } from '@/lib/types';
import { saveAdmin } from '@/lib/actions';
import { useActionState, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type AdminSheetProps = {
  trigger: React.ReactNode;
  admin?: Admin;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormState = {
    message: string;
}

export function AdminSheet({ trigger, admin, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AdminSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  async function handleAction(prevState: FormState, formData: FormData): Promise<FormState> {
    await saveAdmin(formData);
    toast({
      title: 'Success',
      description: `Admin ${admin ? 'updated' : 'created'} successfully.`,
    });
    setOpen(false);
    return { message: 'success' };
  }

  const [state, formAction] = useActionState(handleAction, { message: '' });
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{admin ? 'Edit' : 'Add'} Admin</SheetTitle>
          <SheetDescription>
            {admin ? 'Update the details of the existing admin.' : 'Create a new admin user.'}
          </SheetDescription>
        </SheetHeader>
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="id" value={admin?.id} />

          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={admin?.name} required/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={admin?.email} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={admin?.phoneNumber} />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Admin</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
