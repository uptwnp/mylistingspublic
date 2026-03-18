
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Satellite, Map as MapIcon, Navigation, MapPin, ExternalLink, ChevronRight, Ruler, Heart, Check } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, getPropertyCoords, cn, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { renderToStaticMarkup } from 'react-dom/server';
import Link from 'next/link';
import { Polyline } from 'react-leaflet';
import { useDiscussion } from '@/context/DiscussionContext';

const createCustomIcon = (property: Property, isSelected: boolean) => {
  const config = getPropertyConfig(property.type);
  const IconComponent = config.icon;

  const html = renderToStaticMarkup(
    <div style={{ 
      position: 'relative', 
      display: 'inline-flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      filter: isSelected ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
    }}>
      {/* Pin Body */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        backgroundColor: isSelected ? '#09090b' : 'white',
        borderRadius: '50%',
        border: '2px solid white',
        color: isSelected ? 'white' : '#09090b',
        cursor: 'pointer',
        zIndex: 2,
        position: 'relative',
        boxShadow: isSelected ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : config.bgColor.replace('bg-', '').replace('text-', ''),
          borderRadius: '50%',
          width: '24px',
          height: '24px',
        }}>
          <IconComponent size={14} strokeWidth={3} className={isSelected ? 'text-white' : config.color} />
        </div>
      </div>

      {/* Integrated Tail (Perfectly Connected) */}
      <div style={{
        width: '14px',
        height: '14px',
        backgroundColor: isSelected ? '#09090b' : 'white',
        borderRight: '2px solid white',
        borderBottom: '2px solid white',
        transform: 'rotate(45deg)',
        marginTop: '-10px',
        zIndex: 1,
        borderRadius: '0 0 3px 0'
      }} />
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize: [40, 56],
    iconAnchor: [20, 52],
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
    // Force a resize check whenever view changes
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [center, zoom, map]);
  return null;
}

// Handler for container resizing
function InvalidateSize({ trigger }: { trigger?: any }) {
  const map = useMap();
  useEffect(() => {
    // Initial invalidate
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    // Watch for window resize
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    
    // Also run it periodically for a bit to catch layout shifts
    const interval = setInterval(() => {
      map.invalidateSize();
    }, 1000);

    const timer3 = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [map, trigger]);
  return null;
}

// getCoords helper is now getPropertyCoords in utils.ts
const getCoords = (property: Property): [number, number] => getPropertyCoords(property);

function MapControls({ 
  isSatellite, 
  setIsSatellite,
  hasSelectedProperty 
}: { 
  isSatellite: boolean; 
  setIsSatellite: (v: boolean) => void;
  hasSelectedProperty: boolean;
}) {
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
    <div className={cn(
      "absolute right-4 sm:right-8 z-[1000] flex flex-col gap-4 transition-all duration-500",
      hasSelectedProperty ? "bottom-48 sm:bottom-12" : "bottom-24 sm:bottom-12"
    )}>
      {/* Zoom Controls */}
      <div className="flex flex-col overflow-hidden rounded-[20px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <button 
          onClick={handleZoomIn}
          title="Zoom In"
          className="flex h-12 w-12 items-center justify-center transition-all hover:bg-zinc-100 active:scale-90"
        >
          <Plus className="h-5 w-5 text-zinc-900" />
        </button>
        <div className="mx-3 h-px bg-zinc-200/50" />
        <button 
          onClick={handleZoomOut}
          title="Zoom Out"
          className="flex h-12 w-12 items-center justify-center transition-all hover:bg-zinc-100 active:scale-90"
        >
          <Minus className="h-5 w-5 text-zinc-900" />
        </button>
      </div>

      {/* Satellite & GPS */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setIsSatellite(!isSatellite)}
          className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:scale-95"
        >
          {isSatellite ? <MapIcon className="h-5 w-5 text-zinc-900" /> : <Satellite className="h-5 w-5 text-zinc-900" />}
        </button>
        <button 
          onClick={handleGPS}
          className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-zinc-900 shadow-xl transition-all hover:scale-110 active:scale-90 active:rotate-12"
        >
          <Navigation className="h-5 w-5 text-white" />
        </button>
      </div>
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
  const { isInCart, addToCart, removeFromCart, isSaved, toggleSave } = useDiscussion();
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
      <InvalidateSize trigger={properties} />
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
      <MapControls 
        isSatellite={isSatellite} 
        setIsSatellite={setIsSatellite} 
        hasSelectedProperty={!!selectedProperty}
      />
      
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
          <Popup minWidth={340} maxWidth={340}>
            <div className="flex bg-white overflow-hidden p-0">
              {/* Left Image Section */}
              <div className="relative w-32 shrink-0 overflow-hidden bg-zinc-100">
                {Array.isArray(property.image_urls) && property.image_urls.length > 0 ? (
                  <img 
                    src={property.image_urls[0]} 
                    alt={property.type} 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center", getPropertyConfig(property.type).bgColor)}>
                    {(() => {
                      const ConfigIcon = getPropertyConfig(property.type).icon;
                      return <ConfigIcon className={cn("h-10 w-10", getPropertyConfig(property.type).color)} />;
                    })()}
                  </div>
                )}
                {/* Micro Price Badge on Image */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-900/80 backdrop-blur-md rounded-md border border-white/20">
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">
                    {formatPrice(property.price_min)}
                  </span>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="flex flex-col gap-1">
                  <h3 className="ty-subtitle font-bold text-zinc-900 leading-tight truncate">
                    {formatSizeRange(property.size_min, property.size_max, property.size_unit)} {property.type}
                  </h3>
                  <div className="flex items-center gap-1.5 ty-caption font-medium text-zinc-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{property.area}</span>
                  </div>
                  {property.tags && property.tags.length > 0 && (
                    <div className="mt-1 flex gap-1 items-center">
                       <span className="ty-micro font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {property.tags[0]}
                       </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        isInCart(property.property_id) 
                          ? removeFromCart(property.property_id) 
                          : addToCart(property);
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 ty-micro font-black transition-all active:scale-[0.98]",
                        isInCart(property.property_id)
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-zinc-900 text-white hover:bg-black shadow-lg shadow-black/10"
                      )}
                    >
                      {isInCart(property.property_id) ? (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                          Discuss
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(property.property_id);
                      }}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90",
                        isSaved(property.property_id) 
                          ? "text-rose-500 bg-rose-50 border-rose-100" 
                          : "border-zinc-100 text-zinc-400 hover:bg-zinc-50"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isSaved(property.property_id) && "fill-current")} />
                    </button>
                  </div>

                  <a 
                    href={`/property/${property.property_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-100 py-2 ty-micro font-bold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
