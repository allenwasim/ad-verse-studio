'use client';

import React, { useState, useEffect } from 'react';
import { getCampaigns, getScreens, getLeads } from '@/lib/data';
import { CampaignsPageContent } from '@/app/(dashboard)/campaigns/campaigns-page-content';
import { CampaignSheet } from '@/app/(dashboard)/campaigns/campaign-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Campaign, Screen, Lead } from '@/lib/types';

export default function CampaignsPage() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const campaignsData = await getCampaigns();
      setAllCampaigns(campaignsData);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const fetchScreens = async () => {
    try {
      const screensData = await getScreens();
      setScreens(screensData);
    } catch (error) {
      console.error("Failed to fetch screens:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const leadsData = await getLeads();
      setLeads(leadsData);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCampaigns(), fetchScreens(), fetchLeads()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCampaignSaved = () => {
    fetchCampaigns();
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
                <p className="text-muted-foreground">
                    Manage your campaigns and view their performance.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <CampaignSheet
                    screens={screens}
                    clients={leads}
                    trigger={
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Campaign
                        </span>
                    </Button>
                    }
                    onCampaignSaved={handleCampaignSaved}
                />
            </div>
        </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <CampaignsPageContent
          allCampaigns={allCampaigns}
          leads={leads}
          screens={screens}
        />
      )}
    </div>
  );
}
