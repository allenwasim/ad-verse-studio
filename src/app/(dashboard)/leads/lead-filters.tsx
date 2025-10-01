'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Admin } from '@/lib/types';

export function LeadFilters({ admins }: { admins: Admin[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <Input
            type="search"
            placeholder="Search by name or company..."
            className="w-full sm:max-w-xs"
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <Select
            onValueChange={(value) => handleFilterChange('filter', value)}
            defaultValue={searchParams.get('filter') || 'all'}
        >
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="today-followup">Today's Follow-up</SelectItem>
                <SelectItem value="hot">Hot Leads</SelectItem>
                <SelectItem value="closed">Closed Leads</SelectItem>
            </SelectContent>
        </Select>
        <Select
            onValueChange={(value) => handleFilterChange('admin', value)}
            defaultValue={searchParams.get('admin') || 'all'}
        >
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by admin..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Admins</SelectItem>
                {admins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );
}
