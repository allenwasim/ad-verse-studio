'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Screen } from '@/lib/types';
import { saveScreen } from '@/lib/actions';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('./location-picker'), { ssr: false });

type ScreenSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen?: Screen;
  onScreenSaved?: () => void;
};

export function ScreenSheet({ open, onOpenChange, screen, onScreenSaved }: ScreenSheetProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | undefined>(screen?.imageUrl);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(
    (screen?.latitude != null && screen?.longitude != null)
      ? { lat: screen.latitude, lng: screen.longitude }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setImageUrl(screen?.imageUrl);
      if (screen?.latitude != null && screen?.longitude != null) {
        setLocation({ lat: screen.latitude, lng: screen.longitude });
      } else {
        setLocation(null);
      }
    }
  }, [open, screen]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        }
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing the image:', error);
        toast({
          variant: 'destructive',
          title: 'Image Compression Error',
          description: 'Could not process the image file.',
        });
      }
    }
  };

  async function handleSaveAction(prevState: any, formData: FormData) {
    if (imageUrl) {
      formData.set('imageUrl', imageUrl);
    } else if (screen?.imageUrl) {
      formData.set('imageUrl', screen.imageUrl);
    }
    formData.delete('imageFile');

    if (location) {
      formData.set('latitude', location.lat.toString());
      formData.set('longitude', location.lng.toString());
    } else {
        formData.delete('latitude');
        formData.delete('longitude');
    }
    
    await saveScreen(formData);
    toast({
      title: 'Success',
      description: `Screen ${screen ? 'updated' : 'created'} successfully.`,
    });
    onOpenChange(false);
    onScreenSaved?.();
    return { message: 'success' };
  }

  const [state, formAction] = useActionState(handleSaveAction, { message: '' });
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{screen ? 'Edit' : 'Add'} Screen</SheetTitle>
          <SheetDescription>
            {screen ? 'Update the details of the existing screen.' : 'Create a new ad screen venue.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
        <form action={formAction} className="space-y-4 py-4 pr-6">
          <input type="hidden" name="id" value={screen?.id || ''} />
          
          <div className="space-y-2">
            <Label>Screen Image</Label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <Image src={imageUrl} alt="Screen preview" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                    <span className="text-xs text-muted-foreground">Preview</span>
                )}
                </div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Image
                </Button>
                <Input 
                    ref={fileInputRef}
                    id="image-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    name="imageFile"
                />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input id="venueName" name="venueName" defaultValue={screen?.venueName} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="location">Address</Label>
            <Input id="location" name="location" defaultValue={screen?.location} required />
          </div>

          <div className="space-y-1">
            <Label>Location on Map (Click to set)</Label>
            <div className="h-64 w-full rounded-md overflow-hidden border">
                {open && <LocationPicker 
                    initialPosition={location} 
                    onPositionChange={(pos: {lat: number, lng: number}) => {
                        setLocation(pos);
                    }}
                />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Latitude</Label>
              <Input value={location?.lat.toFixed(6) || ''} disabled />
            </div>
             <div className="space-y-1">
              <Label>Longitude</Label>
              <Input value={location?.lng.toFixed(6) || ''} disabled />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="venueType">VenueType</Label>
            <Select name="venueType" defaultValue={screen?.venueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="averageFootfall">Average Footfall</Label>
            <Input id="averageFootfall" name="averageFootfall" type="number" defaultValue={screen?.averageFootfall} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="uniqueID">Unique ID</Label>
            <Input id="uniqueID" name="uniqueID" defaultValue={screen?.uniqueID} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" name="contactPerson" defaultValue={screen?.contactPerson} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={screen?.phoneNumber} />
          </div>

          <SheetFooter className="bg-background sticky bottom-0 py-4 mt-auto">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Screen</Button>
          </SheetFooter>
        </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
