
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function ClientDate({ date }: { date: Date }) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // This code now only runs on the client, after the initial render.
    setFormattedDate(format(new Date(date), 'MMM d, yyyy'));
  }, [date]);

  // Return a placeholder on the server and during the initial client render.
  // The actual date will be rendered in the useEffect hook.
  return <>{formattedDate || '...'}</>;
}

    