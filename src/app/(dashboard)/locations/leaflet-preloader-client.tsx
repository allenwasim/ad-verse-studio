'use client';

import dynamic from 'next/dynamic';

const DynamicLeafletPreloader = dynamic(() => import('@/app/(dashboard)/locations/leaflet-preloader').then(mod => mod.LeafletPreloader), {
  ssr: false,
});

export default function LeafletPreloaderClient() {
  return <DynamicLeafletPreloader />;
}