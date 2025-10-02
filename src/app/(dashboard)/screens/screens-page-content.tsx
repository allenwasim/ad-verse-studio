"use client";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { deleteScreenAction } from "@/lib/actions";
import { EditScreenMenuItem } from "@/app/(dashboard)/screens/edit-screen-menu-item";
import { AddScreenWrapper } from "@/app/(dashboard)/screens/add-screen-wrapper";
import { DeleteDialogWrapper } from "@/components/delete-dialog-wrapper";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScreenAdsList } from "@/app/(dashboard)/screens/screen-ads-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Screen, Campaign, Lead } from "@/lib/types";
import { useState } from "react";
import { ScreenSheet } from "@/app/(dashboard)/screens/screen-sheet";

export function ScreensPageContent({
  allScreens,
  campaigns,
  leads,
  onScreenSaved,
}: {
  allScreens: Screen[];
  campaigns: Campaign[];
  leads: Lead[];
  onScreenSaved: () => void;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | undefined>(
    undefined
  );

  const screens = allScreens.filter((screen) => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    return (
      screen.venueName.toLowerCase().includes(searchTerm) ||
      screen.location.toLowerCase().includes(searchTerm)
    );
  });

  const handleAddClick = () => {
    setSelectedScreen(undefined);
    setSheetOpen(true);
  };

  const handleEditClick = (screen: Screen) => {
    setSelectedScreen(screen);
    setSheetOpen(true);
  };

  const handleScreenSaved = () => {
    setSelectedScreen(undefined); // Reset the state to prevent hydration error
    onScreenSaved();
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      <ScreenSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        screen={selectedScreen}
        onScreenSaved={handleScreenSaved} // Use the new handler
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Screens</CardTitle>
              <CardDescription>
                Manage your advertising screens and venues. Click a row to see
                scheduled ads.
              </CardDescription>
            </div>
            <AddScreenWrapper onClick={handleAddClick} />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {screens.map((screen) => {
              const activeCampaigns = campaigns.filter(
                (campaign) =>
                  campaign.assignedScreens.includes(screen.id) &&
                  new Date(campaign.endDate) >= new Date() &&
                  new Date(campaign.startDate) <= new Date()
              );
              const allAssignedCampaigns = campaigns.filter(
                (c) =>
                  c.assignedScreens.includes(screen.id) &&
                  new Date(c.endDate) >= new Date()
              );
              // Collect unique ad categories for this screen
              const adCategories = Array.from(
                new Set(
                  campaigns
                    .filter((c) => c.assignedScreens.includes(screen.id))
                    .map((c) => c.category)
                    .filter(Boolean)
                )
              );

              return (
                <AccordionItem value={screen.id} key={screen.id}>
                  <div className="flex items-center gap-4 px-4 py-2 hover:bg-muted/50 data-[state=open]:bg-muted border-b">
                    <AccordionTrigger className="w-12 p-0 hover:no-underline [&[data-state=open]>svg]:rotate-90 -ml-4">
                      <div className="p-2"></div>
                    </AccordionTrigger>
                    <div className="shrink-0">
                      <Image
                        alt={screen.venueName}
                        className="aspect-square rounded-md object-cover"
                        height={48}
                        src={screen.imageUrl || "https://placehold.co/48x48"}
                        width={48}
                      />
                    </div>
                    <div className="flex-1 font-medium truncate">
                      <div className="truncate">{screen.venueName}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {adCategories.length > 0 ? (
                          adCategories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="default"
                              className="capitalize"
                            >
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No categories
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-end gap-2">
                      {screen.venueType && (
                        <Badge variant="outline" className="capitalize">
                          {screen.venueType}
                        </Badge>
                      )}
                      {activeCampaigns.length > 0 ? (
                        <Badge variant="secondary" className="font-normal">
                          {activeCampaigns.length} Active
                        </Badge>
                      ) : null}
                    </div>

                    <div className="w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditScreenMenuItem
                            onSelect={() => handleEditClick(screen)}
                          />
                          <DeleteDialogWrapper
                            onConfirm={async () => {
                              await deleteScreenAction(screen.id);
                              onScreenSaved();
                            }}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="p-4 bg-muted/50 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-bold">Average Footfall</div>
                          <div>
                            {screen.averageFootfall?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">Contact Person</div>
                          <div>{screen.contactPerson || "N/A"}</div>
                        </div>
                        <div>
                          <div className="font-bold">Contact Phone</div>
                          <div>{screen.phoneNumber || "N/A"}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-2">
                          Scheduled Ads
                        </h4>
                        <ScreenAdsList
                          campaigns={allAssignedCampaigns}
                          leads={leads}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
