'use client';

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarNav } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { AppBar } from '@/components/ui/app-bar';
import { usePathname } from 'next/navigation';

function getTitleFromPathname(pathname: string): string {
  if (pathname.startsWith('/dashboard')) {
    pathname = pathname.substring('/dashboard'.length);
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return 'Dashboard';
  }
  const title = parts[parts.length - 1];
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <Button
            variant="ghost"
            className="h-12 w-full !p-2 text-lg font-bold tracking-widest"
            asChild
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2.5">
                <div className="font-black text-2xl tracking-tighter">ad<span className="font-light">Verse</span></div>
            </Link>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <AppSidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppBar title={title} />
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 pt-20 md:p-8 bg-background">
          <React.Suspense fallback={<div>Loading...</div>}>{children}</React.Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
