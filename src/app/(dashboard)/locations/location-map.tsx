'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Screen } from '@/lib/types';

// Dynamically import the map component with SSR turned off
const LocationMapClient = dynamic(() => import('@/app/(dashboard)/locations/location-map-client'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
});

type LocationMapProps = {
  screens: Screen[];
  onMarkerClick: (screen: Screen) => void;
  selectedScreenIds: string[];
};

export default function LocationMap({ screens, onMarkerClick, selectedScreenIds }: LocationMapProps) {
  return <LocationMapClient screens={screens} onMarkerClick={onMarkerClick} selectedScreenIds={selectedScreenIds} />;
}
