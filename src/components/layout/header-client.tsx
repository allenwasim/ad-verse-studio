'use client';
import { Users2, Search, Bell, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const searchablePaths = ['/campaigns', '/screens', '/leads', '/accounts'];

const placeholderMap: { [key: string]: string } = {
  '/campaigns': 'Search campaigns by name or client...',
  '/screens': 'Search screens by venue or location...',
  '/leads': 'Search leads by name or company...',
  '/accounts': 'Search transactions by details, notes...',
};

export function AppHeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSearchable = searchablePaths.some(p => pathname.startsWith(p));
  const searchPlaceholder = placeholderMap[pathname] || 'Search...';

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isSearchable || !isMounted) return;

    const handleUrlUpdate = (value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.replace(`${pathname}?${params.toString()}`);
    };

    const handler = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
        handleUrlUpdate(searchValue || null);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, pathname, router, searchParams, isSearchable, isMounted]);

  if (!isMounted) {
    return (
        <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" className="rounded-full"><MessageCircle /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><Bell /></Button>
                <div className="h-10 w-10"></div>
            </div>
        </div>
    );
  }

  return (
    <>
        <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1">
            {isSearchable && (
                <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    className="w-full md:w-auto lg:w-80 pl-10 bg-card border-none"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                </>
            )}
            </div>
        </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Users2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
