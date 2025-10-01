
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function ClientDate({ date }: { date?: Date }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      setFormattedDate('N/A');
      return;
    }

    setFormattedDate(format(date, 'MMM d, yyyy'));
  }, [date]);

  return <>{formattedDate || '...'}</>;
}

    