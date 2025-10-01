'use client';

import { useState } from 'react';
import { Screen } from '@/lib/types';
import LocationMap from '@/app/(dashboard)/locations/location-map';
import { PricingCalculator } from '@/app/(dashboard)/locations/pricing-calculator';

interface LocationsPageContentProps {
  screens: Screen[];
}

export function LocationsPageContent({ screens }: LocationsPageContentProps) {
  const [selectedScreens, setSelectedScreens] = useState<Screen[]>([]);

  const handleSelectionChange = (screen: Screen) => {
    setSelectedScreens(prevSelected => {
      const isSelected = prevSelected.find(s => s.id === screen.id);
      if (isSelected) {
        return prevSelected.filter(s => s.id !== screen.id);
      } else {
        return [...prevSelected, screen];
      }
    });
  };

  return (
    <>
      <div className="h-[60vh] w-full rounded-md overflow-hidden border">
        <LocationMap 
          screens={screens} 
          onMarkerClick={handleSelectionChange}
          selectedScreenIds={selectedScreens.map(s => s.id)}
        />
      </div>
      <div className="mt-8">
        <PricingCalculator selectedScreens={selectedScreens} />
      </div>
    </>
  );
}
