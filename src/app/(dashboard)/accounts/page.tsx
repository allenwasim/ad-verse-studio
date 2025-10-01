  import React from 'react';
import { AccountsPageContent } from '@/app/(dashboard)/accounts/accounts-page-content';
import { AccountSheet } from '@/app/(dashboard)/accounts/account-sheet';
import { getCampaigns } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function AccountsPage() {
  const campaigns = await getCampaigns();

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your accounts and view your financial overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AccountSheet
            campaigns={campaigns}
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Button>
            }
          />
        </div>
      </div>
      <AccountsPageContent />
    </>
  );
}
