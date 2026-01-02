
import React, { useEffect, useRef } from 'react';
import { Store } from '../types';

declare const L: any;

interface MapViewProps {
  stores: Store[];
  selectedStore: Store | null;
  onMarkerClick: (store: Store) => void;
  center: { lat: number; lng: number };
}

const MapView: React.FC<MapViewProps> = ({ stores, selectedStore, onMarkerClick, center }) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerId = "leaflet-map-container";

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerId).setView([center.lat, center.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], 13, { animate: true });
    }
  }, [center]);

  // Update markers when stores change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    stores.forEach(store => {
      const marker = L.marker([store.lat, store.lng])
        .addTo(mapRef.current)
        .on('click', () => onMarkerClick(store));
      
      marker.bindPopup(`
        <div class="p-1">
          <strong class="text-blue-600">${store.name}</strong><br/>
          <small>${store.address}</small><br/>
          <span class="text-xs text-gray-500">${store.category}</span>
        </div>
      `);
      
      markersRef.current.push(marker);
      
      if (selectedStore && selectedStore.id === store.id) {
        marker.openPopup();
      }
    });
  }, [stores, selectedStore]);

  return <div id={mapContainerId} className="h-full w-full shadow-inner" />;
};

export default MapView;
