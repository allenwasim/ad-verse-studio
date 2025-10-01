
'use client';

import 'leaflet/dist/leaflet.css';
import * as React from 'react';
import L from 'leaflet';

import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';
import { Screen } from '@/lib/types';
import { useEffect, useRef } from 'react';

// Fix for default icon path in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- ICONS ---
const userLocationIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building scale-125 animate-pulse"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const defaultVenueIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--muted-foreground))" stroke="hsl(var(--background))" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const selectedVenueIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin scale-125 animate-pulse"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

type LocationMapClientProps = {
  screens: Screen[];
  onMarkerClick: (screen: Screen) => void;
  selectedScreenIds: string[];
};

export default function LocationMapClient({ screens, onMarkerClick, selectedScreenIds }: LocationMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const getCenter = (): L.LatLngTuple => {
    if (screens.length > 0) {
      const validCoords = screens.filter(s => s.latitude && s.longitude);
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(s => [s.latitude!, s.longitude!]));
        const center = bounds.getCenter();
        return [center.lat, center.lng];
      }
    }
    return [11.8745, 75.3704]; // Fallback center
  };

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: getCenter(),
        zoom: 12,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);
    }
    
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  // Add/update screen markers
  useEffect(() => {
      const map = mapInstanceRef.current;
      if (map) {
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && (layer as any).isVenueMarker) {
                map.removeLayer(layer);
            }
        });

        screens.forEach(screen => {
            if (screen.latitude && screen.longitude) {
              const isSelected = selectedScreenIds.includes(screen.id);

              const popupContent = `
                <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.3; color: #1f2937; max-width: 180px;">
                  ${screen.imageUrl ? `<img src="${screen.imageUrl}" alt="${screen.venueName}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 4px;"/>` : ''}
                  <h3 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 600; color: #111827;">${screen.venueName}</h3>
                  <p style="margin: 0; color: #4b5563;">${screen.location}</p>
                </div>
              `;

              const marker = L.marker([screen.latitude, screen.longitude], { 
                icon: isSelected ? selectedVenueIcon : defaultVenueIcon 
              })
                .addTo(map)
                .bindPopup(popupContent, { autoPan: false });
              
              (marker as any).isVenueMarker = true;

              marker.on('mouseover', () => {
                marker.openPopup();
              });
              marker.on('mouseout', () => {
                marker.closePopup();
              });
              marker.on('click', () => {
                onMarkerClick(screen);
              });
            }
        });

        if (selectedScreenIds.length === 0) {
            const validCoords = screens.filter(s => s.latitude && s.longitude);
            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords.map(s => [s.latitude!, s.longitude!]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }
      }
  }, [screens, selectedScreenIds, onMarkerClick]);


  const handleDetectLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          map.flyTo(newLatLng, 16);
          const marker = L.marker(newLatLng, {icon: userLocationIcon}).addTo(map);
          const tooltip = L.tooltip({permanent: true, direction: 'right', offset: [15, 0]}).setContent("Your estimated location").setLatLng(newLatLng).addTo(map);

          setTimeout(() => {
            if(map.hasLayer(tooltip)) {
              map.removeLayer(tooltip);
            }
             if(map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          }, 8000);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not get your location. Please ensure you've granted permission and try again.");
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };


  return (
    <div className="relative h-full w-full">
      <Button
        type="button"
        size="icon"
        className="absolute top-2 right-2 z-[1000] bg-background/80 hover:bg-background"
        onClick={handleDetectLocation}
        title="Find My Location"
      >
        <Crosshair className="h-4 w-4" />
      </Button>
      <div id="map" ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
    </div>
  );
}
