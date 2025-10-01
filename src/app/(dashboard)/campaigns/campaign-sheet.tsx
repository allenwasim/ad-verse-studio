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
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Campaign, Screen, Lead } from '@/lib/types';
import { saveCampaign, checkAdScreenCompatibility } from '@/lib/actions';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MultiSelect } from '@/components/multi-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

type CampaignSheetProps = {
  trigger: React.ReactNode;
  campaign?: Campaign;
  screens: Screen[];
  clients: Lead[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCampaignSaved?: () => void;
};

export function CampaignSheet({
  trigger,
  campaign,
  screens,
  clients,
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  onCampaignSaved
}: CampaignSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [mediaURL, setMediaURL] = useState<string | undefined>(campaign?.mediaURL);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChecking, startTransition] = useTransition();

  const [state, formAction] = useActionState(handleAction, { message: '' });
  
  useEffect(() => {
    if (open) {
      setStartDate(campaign?.startDate ? new Date(campaign.startDate) : undefined);
      setEndDate(campaign?.endDate ? new Date(campaign.endDate) : undefined);
      setSelectedScreens(campaign?.assignedScreens || []);
      setMediaURL(campaign?.mediaURL);
    }
  }, [open, campaign]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true }
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => setMediaURL(reader.result as string);
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Image Error', description: 'Could not process image.'});
      }
    }
  };


  async function handleAction(prevState: any, formData: FormData) {
    const newFormData = new FormData(formRef.current!);
    
    if (!newFormData.get('campaignName')) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Campaign Name is required.' });
        return { message: 'error' };
    }

    if (!newFormData.get('clientId')) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Client is required.' });
        return { message: 'error' };
    }

    if (!startDate) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Start Date is required.' });
        return { message: 'error' };
    }

    if (!endDate) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'End Date is required.' });
        return { message: 'error' };
    }

    if (startDate && endDate && endDate < startDate) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'End Date cannot be before Start Date.' });
        return { message: 'error' };
    }

    if (startDate) newFormData.set('startDate', startDate.toISOString());
    if (endDate) newFormData.set('endDate', endDate.toISOString());

    newFormData.delete('assignedScreens');
    selectedScreens.forEach(screen => newFormData.append('assignedScreens', screen));

    if (mediaURL) {
        newFormData.set('mediaURL', mediaURL);
    }
    
    newFormData.set('mediaType', 'image');

    await saveCampaign(newFormData);
    toast({
      title: 'Success',
      description: `Campaign ${campaign ? 'updated' : 'created'} successfully.`,
    });
    setOpen(false);
    onCampaignSaved?.();
    return { message: 'success' };
  }
  
  const handleCompatibilityCheck = () => {
    startTransition(async () => {
        const campaignId = campaign?.id;
        if (!campaignId || selectedScreens.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Selection Required',
                description: 'Please save the campaign and select at least one screen to check compatibility.',
            });
            return;
        }

        const result = await checkAdScreenCompatibility(campaignId, selectedScreens);

        if ('error' in result) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            if (result.isValid) {
                toast({ title: 'Compatibility Check Passed', description: 'All selected screens are valid for this campaign.' });
            } else {
                const invalidScreenNames = result.invalidScreenIds.map((id: string) => screens.find(s => s.id === id)?.venueName || id).join(', ');
                toast({
                    variant: 'destructive',
                    title: 'Compatibility Issues Found',
                    description: `The following screens are not compatible: ${invalidScreenNames}`,
                });
            }
        }
    });
  };

  const screenOptions = screens.map(screen => ({ value: screen.id, label: screen.venueName }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{campaign ? 'Edit' : 'Add'} Campaign</SheetTitle>
          <SheetDescription>
            {campaign ? 'Update the details of the existing campaign.' : 'Create a new ad campaign and contract.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow pr-6">
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="id" value={campaign?.id || ''} />

          <div className="space-y-1">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input id="campaignName" name="campaignName" defaultValue={campaign?.campaignName} required />
          </div>

          <div className="space-y-1">
            <Label>Client</Label>
            <Select name="clientId" defaultValue={campaign?.clientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.leadName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={campaign?.category} />
          </div>

          <div className="space-y-2">
            <Label>Ad Creative</Label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {mediaURL ? (
                        <Image src={mediaURL} alt="Ad preview" width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                        <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                            <Upload className="h-4 w-4"/>
                            <span>Upload</span>
                        </div>
                    )}
                </div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Image
                </Button>
                <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    name="mediaFile"
                />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="slots">Slots (20s each)</Label>
            <Input id="slots" name="slots" type="number" defaultValue={campaign?.slots || 1} />
          </div>
          
           <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <Label>Assigned Screens</Label>
                    {campaign && (
                        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={handleCompatibilityCheck} disabled={isChecking}>
                            <Sparkles className="h-3 w-3" />
                            {isChecking ? 'Checking...' : 'Check Compatibility'}
                        </Button>
                    )}
                </div>
                <MultiSelect 
                    name="assignedScreens" 
                    options={screenOptions} 
                    selectedValues={selectedScreens}
                    onSelectedChange={setSelectedScreens}
                    placeholder="Select screens..."
                />
            </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" defaultValue={campaign?.amount} required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Payment Status</Label>
              <Select name="paymentStatus" defaultValue={campaign?.paymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Payment Mode</Label>
              <Select name="paymentMode" defaultValue={campaign?.paymentMode}>
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
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                </Popover>
              </div>
            </div>

          <div className='flex items-center space-x-2 pt-2'>
              <Checkbox id="renewalReminder" name="renewalReminder" defaultChecked={campaign?.renewalReminder} />
              <label htmlFor="renewalReminder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Send renewal reminder 7 days before expiry
              </label>
            </div>

          <SheetFooter className="bg-background sticky bottom-0 py-4 mt-auto">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Campaign</Button>
          </SheetFooter>
        </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
