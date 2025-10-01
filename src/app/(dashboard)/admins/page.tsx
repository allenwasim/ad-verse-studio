import { getAdmins } from '@/lib/data';
import { AdminSheet } from '@/app/(dashboard)/admins/admin-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AdminsPageContent } from '@/app/(dashboard)/admins/admins-page-content';

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const allAdmins = await getAdmins();
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.['search'] as string | undefined;

  const admins = allAdmins.filter(admin => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    return admin.name.toLowerCase().includes(searchTerm) || (admin.email && admin.email.toLowerCase().includes(searchTerm));
  });

  return (
    <>
      <div className="space-y-4 p-8 pt-6">
        <AdminsPageContent admins={admins} />
      </div>
    </>
  );
}
