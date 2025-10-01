'use client';

import { useEffect, useState } from 'react';

interface BodyWrapperProps {
  children: React.ReactNode;
}

export function BodyWrapper({ children }: BodyWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <body className="font-body antialiased" suppressHydrationWarning={true}>
      {children}
    </body>
  );
}