
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { renderToStaticMarkup } from 'react-dom/server';
import Link from 'next/link';

// Custom marker generator
const createCustomIcon = (property: Property, isSelected: boolean) => {
  const config = getPropertyConfig(property.type);
  const IconComponent = config.icon;
  
  // Get Tailwind color values (approximate for the SVG)
  const colorMap: Record<string, string> = {
    'text-blue-600': '#2563eb',
    'text-emerald-600': '#059669',
    'text-orange-600': '#ea580c',
    'text-amber-600': '#d97706',
    'text-purple-600': '#9333ea',
    'text-zinc-700': '#3f3f46',
    'text-rose-600': '#e11d48',
    'text-indigo-600': '#4f46e5',
    'text-slate-600': '#475569',
    'text-cyan-600': '#0891b2',
    'text-zinc-400': '#a1a1aa'
  };

  const color = colorMap[config.color] || '#000000';

  const html = renderToStaticMarkup(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: isSelected ? color : 'white',
      borderRadius: '50%',
      border: `2px solid ${color}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: isSelected ? 'white' : color,
      transition: 'all 0.3s ease'
    }}>
      <IconComponent size={20} strokeWidth={2.5} />
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface MapComponentProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
}

// Component to handle map center and zoom changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Helper to generate deterministic lat/lng if missing
const getCoords = (property: Property): [number, number] => {
  if (property.latitude && property.longitude) {
    return [property.latitude, property.longitude];
  }

  // Fallback: Panipat/Karnal area
  const baseLat = property.city?.toLowerCase() === 'karnal' ? 29.6857 : 29.3909;
  const baseLng = property.city?.toLowerCase() === 'karnal' ? 76.9907 : 76.9635;

  // Generate a predictable offset based on area name
  const areaName = property.area || 'unknown';
  const hash = areaName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = (hash % 100) / 1000;
  const lngOffset = ((hash * 13) % 100) / 1000;

  return [baseLat + latOffset, baseLng + lngOffset];
};

export default function MapComponent({ properties, selectedProperty, onSelectProperty }: MapComponentProps) {
  const center: [number, number] = selectedProperty 
    ? getCoords(selectedProperty)
    : [29.3909, 76.9635]; // Panipat center

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ChangeView center={center} zoom={selectedProperty ? 15 : 13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <Marker 
          key={property.property_id} 
          position={getCoords(property)}
          icon={createCustomIcon(property, selectedProperty?.property_id === property.property_id)}
          eventHandlers={{
            click: () => onSelectProperty(property),
          }}
        >
          <Popup>
            <div className="p-1">
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-md p-1.5 ${getPropertyConfig(property.type).bgColor}`}>
                  {(() => {
                    const ConfigIcon = getPropertyConfig(property.type).icon;
                    return <ConfigIcon className={`h-4 w-4 ${getPropertyConfig(property.type).color}`} />;
                  })()}
                </span>
                <h3 className="font-bold">{property.type}</h3>
              </div>
              <p className="text-sm font-black text-black">{formatPrice(property.price_min)}</p>
              <p className="text-[10px] text-zinc-500">{property.area}, {property.city}</p>
              <Link 
                href={`/property/${property.property_id}`}
                className="mt-3 block rounded-lg bg-zinc-900 px-3 py-2 text-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
