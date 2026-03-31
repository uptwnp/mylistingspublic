'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';

// Setup Leaflet icon defaults to fix missing marker images
// Proper Professional Map Pin
const DefaultIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
       {/* High-end Pulse Effect */}
       <div className="absolute h-10 w-10 animate-ping rounded-full bg-brand-primary/30" />
       
       {/* The Pin Body */}
       <div className="relative group flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary border-4 border-white shadow-2xl transition-transform group-hover:scale-110">
             <MapPin className="h-6 w-6 text-white" strokeWidth={3} />
          </div>
          {/* Tip of the pin */}
          <div className="h-3 w-3 bg-brand-primary border-white border-r-4 border-b-4 rotate-45 -mt-2 shadow-lg" />
       </div>
    </div>
  ),
  className: '',
  iconSize: [48, 60],
  iconAnchor: [24, 60], // Tips points exactly at the lat/lng
});

interface MapPickerProps {
  center: { lat: number; lng: number } | null;
  onPick: (loc: { lat: number; lng: number }) => void;
  city?: string;
}

function MapEventsHandler({ onPick }: { onPick: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function CityFetcher({ city }: { city?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (!city) return;
    
    // Simple coordinate mapping for common cities
    const cityCoords: Record<string, [number, number]> = {
      'Panipat': [29.3909, 76.9635],
      'Karnal': [29.6857, 76.9907],
      'Sonipat': [28.9931, 77.0151],
      'Rohtak': [28.8955, 76.6066],
    };

    const coords = cityCoords[city];
    if (coords) {
      map.flyTo(coords, 14);
    }
  }, [city, map]);

  return null;
}

export default function MapPicker({ center, onPick, city }: MapPickerProps) {
  const initialCenter: [number, number] = center ? [center.lat, center.lng] : [29.3909, 76.9635];
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useRef(`map-picker-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return <div className="h-[400px] w-full bg-zinc-50" />;

  return (
    <div className="h-[400px] w-full">
      <MapContainer 
        key={mapId.current}
        center={initialCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onPick={onPick} />
        <CityFetcher city={city} />
        {center && (
          <Marker position={[center.lat, center.lng]} icon={DefaultIcon} />
        )}
      </MapContainer>
    </div>
  );
}
