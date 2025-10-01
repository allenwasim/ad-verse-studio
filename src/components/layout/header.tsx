import { Button } from '@/components/ui/button';
import { MessageCircle, Bell } from 'lucide-react';
import { Suspense } from 'react';
import { AppHeaderClient } from './header-client';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 hidden h-16 items-center justify-between gap-4 border-b border-border/20 bg-background/95 backdrop-blur-sm sm:px-6 lg:flex">
        <Suspense fallback={<div className="flex flex-1 items-center justify-between"><div className="flex-1" /><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" className="rounded-full"><MessageCircle /></Button><Button variant="ghost" size="icon" className="rounded-full"><Bell /></Button><div className="h-10 w-10"></div></div></div>}>
          <AppHeaderClient />
        </Suspense>
    </header>
  );
}
