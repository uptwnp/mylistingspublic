
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Satellite, Map as MapIcon, Navigation } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { renderToStaticMarkup } from 'react-dom/server';
import Link from 'next/link';
import { Polyline } from 'react-leaflet';

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
  userLocation?: { lat: number; lng: number } | null;
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

function MapControls({ isSatellite, setIsSatellite }: { isSatellite: boolean; setIsSatellite: (v: boolean) => void }) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  
  const handleGPS = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 16, {
        animate: true,
        duration: 1.5
      });
    });
  };

  return (
    <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-3">
      {/* Zoom Controls */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl">
        <button 
          onClick={handleZoomIn}
          title="Zoom In"
          className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-zinc-100 active:bg-zinc-200"
        >
          <Plus className="h-5 w-5 text-zinc-800" />
        </button>
        <div className="mx-3 h-px bg-zinc-200/50" />
        <button 
          onClick={handleZoomOut}
          title="Zoom Out"
          className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-zinc-100 active:bg-zinc-200"
        >
          <Minus className="h-5 w-5 text-zinc-800" />
        </button>
      </div>

      {/* Satellite Toggle */}
      <button 
        onClick={() => setIsSatellite(!isSatellite)}
        title={isSatellite ? "Switch to Map" : "Switch to Satellite"}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
      >
        {isSatellite ? (
          <MapIcon className="h-5 w-5 text-zinc-800" />
        ) : (
          <Satellite className="h-5 w-5 text-zinc-800" />
        )}
      </button>

      {/* GPS Button */}
      <button 
        onClick={handleGPS}
        title="Find My Location"
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <Navigation className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}

// Helper to calculate a curved path between two points
const getCurvedPath = (start: [number, number], end: [number, number], segments: number = 50) => {
  const points: [number, number][] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Simple quadratic bezier for a gentle curve
    // Midpoint with a slight offset for the "arc" effect
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    
    // Offset the midpoint to create the curve
    const offset = 0.05 * Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
    const controlLat = midLat + offset;
    const controlLng = midLng + offset;

    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * controlLat + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * controlLng + t * t * end[1];
    
    points.push([lat, lng]);
  }
  return points;
};

export default function MapComponent({ properties, selectedProperty, onSelectProperty, userLocation }: MapComponentProps) {
  const [isSatellite, setIsSatellite] = useState(false);
  const center: [number, number] = selectedProperty 
    ? getCoords(selectedProperty)
    : [29.3909, 76.9635]; // Panipat center

  const propertyCoords = selectedProperty ? getCoords(selectedProperty) : null;
  const userCoords: [number, number] | null = userLocation ? [userLocation.lat, userLocation.lng] : null;
  const curvedPath = (userCoords && propertyCoords) ? getCurvedPath(userCoords, propertyCoords) : null;

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ChangeView center={center} zoom={selectedProperty ? 15 : 13} />
      <TileLayer
        attribution={isSatellite 
          ? '&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
        url={isSatellite 
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      <MapControls isSatellite={isSatellite} setIsSatellite={setIsSatellite} />
      
      {curvedPath && (
        <>
          <Polyline 
            positions={curvedPath}
            pathOptions={{
              color: '#e11d48', // rose-600
              weight: 2,
              dashArray: '8, 12',
              lineCap: 'round',
              opacity: 0.6
            }}
          />
          {userCoords && (
            <Marker 
              position={userCoords}
              icon={L.divIcon({
                html: renderToStaticMarkup(
                  <div className="flex items-center justify-center h-8 w-8 bg-black rounded-full border-2 border-white shadow-lg">
                    <Navigation className="h-4 w-4 text-white rotate-45" />
                  </div>
                ),
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            />
          )}
        </>
      )}
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
              <a 
                href={`/property/${property.property_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-lg bg-zinc-900 px-3 py-2 text-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
              >
                View Details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
