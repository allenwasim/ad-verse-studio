'use client';

import { useEffect } from 'react';

export function LeafletPreloader() {
  useEffect(() => {
    // Preload Leaflet resources
    const link1 = document.createElement('link');
    link1.rel = 'preload';
    link1.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link1.as = 'style';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preload';
    link2.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    link2.as = 'script';
    document.head.appendChild(link2);
  }, []);

  return null;
}