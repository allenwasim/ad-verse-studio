'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, User, CheckCircle, Clock } from 'lucide-react';
import { Notification, Admin } from '@/lib/types';
import { format } from 'date-fns';

export function NotificationsList({ notifications, admins }: { notifications: Notification[], admins: Admin[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                    {notification.type === 'FollowUp' ? (
                        <User className="h-5 w-5 text-blue-500" />
                    ) : notification.type === 'Task' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                    )}
                </div>
                <div className="flex-1">
                  <p className='font-semibold'>{notification.message}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(notification.sentAt), 'PPP')}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No notifications yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">New notifications will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
