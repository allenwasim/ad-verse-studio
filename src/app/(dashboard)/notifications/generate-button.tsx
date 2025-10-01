'use client';

import { Button } from '@/components/ui/button';
import { generateExpiryNotifications } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';

export function GenerateNotificationsButton() {
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      await generateExpiryNotifications();
      toast({ title: 'Notifications generated successfully' });
    } catch (error) {
      toast({ title: 'Failed to generate notifications', variant: 'destructive' });
    }
  };

  return <Button onClick={handleClick}>Generate Notifications</Button>;
}
