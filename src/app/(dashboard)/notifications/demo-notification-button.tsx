'use client';

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { leadFollowUpNotification } from "@/ai/flows/lead-followup-notification";

export function DemoNotificationButton() {
  async function handleClick() {
    try {
      const result = await leadFollowUpNotification({
        leadName: 'John Doe',
        adminName: 'Jane Smith',
      });

      toast({
        title: "Generated Notification",
        description: result.notificationMessage,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate notification.",
        variant: "destructive",
      });
    }
  }

  return (
    <Button onClick={handleClick}>Demo</Button>
  )
}
