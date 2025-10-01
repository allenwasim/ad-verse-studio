'use client';
import React, { useState, useEffect } from 'react';
import { getScreens, getCampaigns, getLeads } from '@/lib/data';
import { ScreensPageContent } from '@/app/(dashboard)/screens/screens-page-content';
import { Screen, Campaign, Lead } from '@/lib/types';

export default function ScreensPage() {
    const [allScreens, setAllScreens] = useState<Screen[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [screensData, campaignsData, leadsData] = await Promise.all([getScreens(), getCampaigns(), getLeads()]);
            setAllScreens(screensData);
            setCampaigns(campaignsData);
            setLeads(leadsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ScreensPageContent allScreens={allScreens} campaigns={campaigns} leads={leads} onScreenSaved={fetchAllData}/>
        </>
    );
}
