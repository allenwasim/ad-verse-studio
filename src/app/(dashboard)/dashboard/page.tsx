import { getAccountEntries, getCampaigns, getLeads } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

export default async function DashboardPage() {
  const [accounts, leads, campaigns] = await Promise.all([
    getAccountEntries(),
    getLeads(),
    getCampaigns(),
  ]);

  const totalRevenue = accounts.filter(entry => entry.entryType === 'Income').reduce((acc, entry) => acc + entry.amount, 0);
  const newLeads = leads.filter(
    (lead) =>
      lead.createdAt.getTime() > new Date().getTime() - 30 * 24 * 60 * 60 * 1000
  ).length;
  const activeCampaigns = campaigns.filter(
    (campaign) => {
      const now = new Date();
      return campaign.startDate <= now && campaign.endDate >= now;
    }
  ).length;

  return (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="text-sm font-medium">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time financial overview
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <span className="text-sm font-medium">#</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{newLeads}</div>
              <p className="text-xs text-muted-foreground">
                New leads in the last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
               <span className="text-sm font-medium">#</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Currently active campaigns
              </p>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
