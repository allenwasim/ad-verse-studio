
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
import { AccountEntry, Campaign } from '@/lib/types';
import { saveAccountEntry } from '@/lib/actions';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobile } from '@/hooks/use-mobile';

type AccountSheetProps = {
  trigger: React.ReactNode;
  entry?: AccountEntry;
  campaigns: Campaign[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormState = {
    message: string;
}

export function AccountSheet({ trigger, entry, campaigns, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AccountSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useMobile();

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  
  const [date, setDate] = useState<Date | undefined>();
  const [entryType, setEntryType] = useState<'Income' | 'Expense'>(entry?.entryType || 'Income');

  useEffect(() => {
    if (open) {
      setDate(entry?.date ? new Date(entry.date) : new Date());
      setEntryType(entry?.entryType || 'Income');
    }
  }, [open, entry]);

  async function handleAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const newFormData = new FormData(formRef.current!);
    if (date) newFormData.set('date', date.toISOString());

    await saveAccountEntry(newFormData);
    toast({
      title: 'Success',
      description: `Entry ${entry ? 'updated' : 'created'} successfully.`,
    });
    setOpen(false);
    return { message: 'success' };
  }

  const [state, formAction] = useActionState(handleAction, { message: '' });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{entry ? 'Edit' : 'Add'} Entry</SheetTitle>
          <SheetDescription>
            {entry ? 'Update the details of the existing entry.' : 'Create a new income or expense entry.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className='flex-grow pr-6'>
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="id" value={entry?.id} />
          
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <RadioGroup name="entryType" value={entryType} onValueChange={(value: 'Income' | 'Expense') => setEntryType(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" defaultValue={entry?.amount} required />
          </div>

          <div className="space-y-1">
            <Label>Date</Label>
            {isMobile ? (
              <Input
                type="date"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full"
              />
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {entryType === 'Income' && (
            <>
              <div className="space-y-1">
                <Label>Source</Label>
                <Select name="source" defaultValue={entry?.source}>
                  <SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ad Booking">Ad Booking</SelectItem>
                    <SelectItem value="Client Payment">Client Payment</SelectItem>
                    <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-1">
                <Label>Related Campaign</Label>
                <Select name="relatedCampaignId" defaultValue={entry?.relatedCampaignId}>
                  <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.campaignName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="receivedFrom">Received From</Label>
                <Input id="receivedFrom" name="receivedFrom" defaultValue={entry?.receivedFrom} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select name="incomeStatus" defaultValue={entry?.incomeStatus}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </>
          )}

          {entryType === 'Expense' && (
            <>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select name="category" defaultValue={entry?.category}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="paidTo">Paid To</Label>
                <Input id="paidTo" name="paidTo" defaultValue={entry?.paidTo} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select name="expenseStatus" defaultValue={entry?.expenseStatus}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </>
          )}

            <div className="space-y-1">
              <Label>Payment Mode</Label>
              <Select name="paymentMode" defaultValue={entry?.paymentMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="space-y-1">
             <Label htmlFor="notes">Notes</Label>
             <Textarea id="notes" name="notes" defaultValue={entry?.notes} placeholder="Add any additional info..."/>
          </div>
          

          <SheetFooter className="bg-background sticky bottom-0 py-4 mt-auto">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Entry</Button>
          </SheetFooter>
        </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
