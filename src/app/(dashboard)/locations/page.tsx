import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getScreens } from '@/lib/data';
import LeafletPreloaderClient from './leaflet-preloader-client';
import { LocationsPageContent } from './locations-page-content';

export const metadata = {
  title: 'Screen Locations & Pricing - ad-Verse',
  description: 'Map view of all advertising screens and instant pricing calculator.',
};

export default async function LocationsPage() { 
  const screens = await getScreens();
  return (
    <>
      <LeafletPreloaderClient />
      <Card>
        <CardHeader>
          <CardTitle>Screen Locations & Instant Quote</CardTitle>
          <CardDescription>
            Select screens on the map to calculate your campaign price instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <LocationsPageContent screens={screens} />
        </CardContent>
      </Card>
    </>
  );
}
