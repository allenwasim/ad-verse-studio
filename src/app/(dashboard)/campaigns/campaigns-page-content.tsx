'use client';

import { useSearchParams } from 'next/navigation';
import { Lead, Campaign, Screen } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
 Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown, ChevronUp, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';
import { VideoPlayer } from '@/components/video-player';
import { deleteCampaignAction } from '@/lib/actions';
import { MediaUtils } from '@/lib/media-utils';
import { EditCampaignWrapper } from '@/app/(dashboard)/campaigns/edit-campaign-wrapper';
import { DeleteDialogWrapper } from '@/components/delete-dialog-wrapper';
import React, { useState, useCallback } from 'react';
import { ClientDate } from '@/app/(dashboard)/campaigns/client-date';


export function CampaignsPageContent({ allCampaigns, leads, screens }: { allCampaigns: Campaign[], leads: Lead[], screens: Screen[] }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getClientName = (clientId: string) => {
    return leads.find((l) => l.id === clientId)?.leadName || 'Unknown';
  };

  const isDataUrl = (url: string): boolean => {
    return url.startsWith('data:image/');
  };

  const downloadMedia = useCallback((url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not download media.');
    }
  }, []);

  const copyMediaToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Media link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Could not copy media link.');
    }
  }, []);

  const handleMediaInteraction = useCallback((url: string | undefined, campaignName: string) => {
    if (!url) {
      console.warn('No URL provided for media');
      return;
    }

    if (isDataUrl(url)) {
      // For Data URLs, download the media
      const filename = `${campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      downloadMedia(url, filename);
    } else {
      // For regular URLs, try to open in new tab
      try {
        // Ensure the URL is properly formatted
        let fullUrl = url;

        // If it's a relative URL, make it absolute
        if (url.startsWith('/')) {
          fullUrl = `${window.location.origin}${url}`;
        }
        // If it doesn't have a protocol, add https://
        else if (!url.startsWith('http://') && !url.startsWith('https://')) {
          fullUrl = `https://${url}`;
        }

        // Validate URL format
        const urlObj = new URL(fullUrl);

        // Open in new tab
        const newWindow = window.open(fullUrl, '_blank');

        // Fallback if popup is blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          console.warn('Popup blocked, copying to clipboard');
          copyMediaToClipboard(fullUrl);
        }
      } catch (error) {
        console.error('Invalid URL:', url, error);
        copyMediaToClipboard(url);
      }
    }
  }, [downloadMedia, copyMediaToClipboard]);

  const renderMediaThumbnail = useCallback((campaign: Campaign) => {
    const mediaInfo = MediaUtils.getMediaDisplayInfo(campaign);

    if (!mediaInfo.displayUrl) {
      return (
        <div className="w-[150px] h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No media uploaded</div>
          </div>
        </div>
      );
    }

    if (campaign.mediaType === 'video') {
      return (
        <div className="relative w-[150px] h-[150px]">
          <VideoPlayer
            src={mediaInfo.displayUrl}
            poster={mediaInfo.thumbnailUrl}
            compact={true}
            width={150}
            height={150}
            className="rounded-lg border border-border"
          />
        </div>
      );
    }

    return (
      <div
        className="inline-block cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleMediaInteraction(mediaInfo.displayUrl, campaign.campaignName)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMediaInteraction(mediaInfo.displayUrl, campaign.campaignName);
          }
        }}
      >
        <Image
          src={mediaInfo.displayUrl}
          alt={`${campaign.campaignName} media`}
          width={150}
          height={150}
          className="rounded-lg border border-border object-cover pointer-events-none"
          onError={(e) => {
            console.error('Media failed to load:', mediaInfo.displayUrl);
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="text-xs text-muted-foreground mt-1 text-center">
          {mediaInfo.isDataUrl ? 'Click to download' : 'Click to view full size'}
        </div>
        <div className="hidden w-[150px] h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Failed to load</div>
          </div>
        </div>
      </div>
    );
  }, [handleMediaInteraction]);

  const campaigns = allCampaigns.filter(campaign => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    const clientName = getClientName(campaign.clientId).toLowerCase();
    return campaign.campaignName.toLowerCase().includes(searchTerm) || clientName.includes(searchTerm);
  });

  const getPaymentStatusVariant = (
    status: Campaign['paymentStatus']
  ): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
    }
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <React.Fragment key={campaign.id}>
                    <TableRow className={expandedRows[campaign.id] ? 'border-b-0' : ''}>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => toggleRow(campaign.id)}>
                                {expandedRows[campaign.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{campaign.campaignName}</span>
                            {campaign.category && <Badge variant="secondary" className="w-fit mt-1">{campaign.category}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{getClientName(campaign.clientId)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={getPaymentStatusVariant(campaign.paymentStatus)}>
                            {campaign.paymentStatus}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">₹{campaign.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <EditCampaignWrapper campaign={campaign} screens={screens} leads={leads} />
                                <DeleteDialogWrapper
                                onConfirm={async () => {
                                    await deleteCampaignAction(campaign.id);
                                }}
                                />
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    {expandedRows[campaign.id] && (
                        <TableRow className='bg-muted/50 hover:bg-muted/50'>
                            <TableCell colSpan={6}>
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div className="md:hidden">
                                        <div className="font-bold">Client</div>
                                        <div>{getClientName(campaign.clientId)}</div>
                                    </div>
                                    <div className="sm:hidden">
                                        <div className="font-bold">Status</div>
                                        <Badge variant={getPaymentStatusVariant(campaign.paymentStatus)}>
                                            {campaign.paymentStatus}
                                        </Badge>
                                    </div>
                                    <div className="sm:hidden">
                                        <div className="font-bold">Amount</div>
                                        <div>₹{campaign.amount.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Start Date</div>
                                        <div><ClientDate date={campaign.startDate} /></div>
                                    </div>
                                    <div>
                                        <div className="font-bold">End Date</div>
                                        <div><ClientDate date={campaign.endDate} /></div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="font-bold">Campaign Media</div>
                                        <div className="mt-2">
                                            {renderMediaThumbnail(campaign)}
                                        </div>
                                        {campaign.mediaMetadata && (
                                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                {campaign.mediaMetadata.dimensions && (
                                                    <div>Dimensions: {campaign.mediaMetadata.dimensions}</div>
                                                )}
                                                {campaign.mediaMetadata.duration && (
                                                    <div>Duration: {MediaUtils.formatDuration(campaign.mediaMetadata.duration)}</div>
                                                )}
                                                {campaign.mediaMetadata.size && (
                                                    <div>Size: {MediaUtils.formatFileSize(campaign.mediaMetadata.size)}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
