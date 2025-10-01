
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function ClientDate({ date }: { date?: Date }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (date) {
      setFormattedDate(format(new Date(date), 'MMM d, yyyy'));
    } else {
      setFormattedDate('N/A');
    }
  }, [date]);

  return <>{formattedDate || '...'}</>;
}

    