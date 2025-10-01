
import { getNotifications, getAdmins, getReminders } from '@/lib/data';
import { NotificationsPageContent } from '@/app/(dashboard)/notifications/notifications-page-content';
import React from 'react';
import { ReminderSheet } from '@/app/(dashboard)/notifications/reminder-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { GenerateNotificationsButton } from '@/app/(dashboard)/notifications/generate-button';

export default async function NotificationsPage() {
  const [notifications, admins, reminders] = await Promise.all([
    getNotifications(),
    getAdmins(),
    getReminders(),
  ]);

  return (
    <>
      <div className="flex justify-end gap-2">
        <GenerateNotificationsButton />
        <ReminderSheet
          trigger={
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Reminder
              </span>
            </Button>
          }
        />
      </div>
      <div className="space-y-4">
        <React.Suspense fallback={<div>Loading...</div>}>
          <NotificationsPageContent
            notifications={notifications}
            admins={admins}
            reminders={reminders}
          />
        </React.Suspense>
      </div>
    </>
  );
}
