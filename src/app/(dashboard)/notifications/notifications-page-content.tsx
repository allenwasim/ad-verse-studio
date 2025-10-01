'use client';

import { Admin, Notification, Reminder } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationsList } from '@/app/(dashboard)/notifications/notifications-list';
import { RemindersList } from '@/app/(dashboard)/notifications/reminders-list';


export function NotificationsPageContent({
  notifications,
  admins,
  reminders,
}: {
  notifications: Notification[];
  admins: Admin[];
  reminders: Reminder[];
}) {

  return (
    <Tabs defaultValue="notifications" className="w-full">
      <div className="flex items-center">
        <TabsList className="w-full">
          <TabsTrigger value="notifications" className="w-full">Notifications</TabsTrigger>
          <TabsTrigger value="reminders" className="w-full">Reminders</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="notifications">
        <NotificationsList notifications={notifications} admins={admins} />
      </TabsContent>
      <TabsContent value="reminders">
        <RemindersList reminders={reminders} />
      </TabsContent>
    </Tabs>
  );
}
