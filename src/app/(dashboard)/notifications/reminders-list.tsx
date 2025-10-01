'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { Reminder } from '@/lib/types';
import { format } from 'date-fns';

export function RemindersList({ reminders }: { reminders: Reminder[] }) {

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <span>Reminders</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length > 0 ? (
          <ul className="space-y-4">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className='font-semibold'>{reminder.title}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(reminder.remindAt), 'PPP')}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No reminders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">New reminders will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
