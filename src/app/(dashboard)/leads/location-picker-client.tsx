'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Basic fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ location, onLocationChange }: { location: { lat: number, lng: number } | null, onLocationChange: (location: { lat: number, lng: number }) => void }) {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return location ? <Marker position={location}></Marker> : null;
}

export default function LocationPickerClient({ location, onLocationChange }: { location: { lat: number, lng: number } | null, onLocationChange: (location: { lat: number, lng: number }) => void }) {
  const position = location || { lat: 51.505, lng: -0.09 }; // Default to London

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker location={location} onLocationChange={onLocationChange} />
    </MapContainer>
  );
}
