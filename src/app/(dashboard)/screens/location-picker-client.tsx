'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';

// Fix for default icon issue with webpack
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

type LocationPickerProps = {
    initialPosition: { lat: number; lng: number } | null;
    onPositionChange: (position: { lat: number; lng: number }) => void;
}

function LocationPickerClient({ initialPosition, onPositionChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Effect to initialize map and handle cleanup
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView(
            initialPosition || [11.8745, 75.3704], 
            initialPosition ? 16 : 13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        // Set initial marker
        markerRef.current = L.marker(mapRef.current.getCenter()).addTo(mapRef.current);

        // Handle map clicks
        mapRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            onPositionChange({ lat, lng });
        });

        if (!initialPosition) {
            handleDetectLocation(false);
        }
    }

    // Cleanup function to run when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Effect to update map when initialPosition changes (e.g., when editing a screen)
  useEffect(() => {
      const map = mapRef.current;
      if (map && initialPosition) {
          const newPos = L.latLng(initialPosition.lat, initialPosition.lng);
          map.flyTo(newPos, 16);
          if(markerRef.current) {
            markerRef.current.setLatLng(newPos);
          }
      }
  }, [initialPosition]);


  const handleDetectLocation = (showAlerts = true) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onPositionChange({ lat: latitude, lng: longitude });
        },
        (error) => {
          if (showAlerts) {
            alert(`Could not get your location. Error: ${error.message}`);
          }
        }
      );
    } else if (showAlerts) {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 z-[1000]">
        <Button type="button" onClick={() => handleDetectLocation(true)} size="sm">Detect My Location</Button>
      </div>
    </div>
  );
}

export default LocationPickerClient;
