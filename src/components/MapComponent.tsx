
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Satellite, Map as MapIcon, Navigation, MapPin, ExternalLink, ChevronRight, Ruler, Heart, Check } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, getPropertyCoords, cn, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import * as ReactDOMServer from 'react-dom/server';
import Link from 'next/link';
import { useShortlist } from '@/context/ShortlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const createCustomIcon = (property: Property, isSelected: boolean, zoom: number, hideLabel?: boolean) => {
  const price = formatPrice(property.price_min);
  const config = getPropertyConfig(property.type);
  const IconComponent = config.icon;

  // Google Maps style scaling logic
  const scale = isSelected ? 1.15 : (zoom >= 16 ? 1.05 : (zoom >= 14 ? 1 : 0.85));
  const showFullLabel = isSelected || (zoom >= 15 && !hideLabel);
  const pinSize = 36 * scale;
  const fontSize = (isSelected ? 14 : 11) * scale;
  const tailSize = 14 * scale;
  const totalWidth = 160 * scale;
  const totalHeight = 80 * scale;

  const html = ReactDOMServer.renderToStaticMarkup(
    <div style={{ 
      position: 'relative', 
      width: '100%',
      height: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      filter: isSelected ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isSelected ? 'translateY(-6px)' : 'none',
    }}>
      {/* External Price Text (Dynamic visibility and size) */}
      {(showFullLabel || isSelected) && (
        <div style={{
          position: 'absolute',
          left: `${(totalWidth / 2) + (pinSize / 2) + (6 * scale)}px`,
          top: `${(pinSize / 2) - 8}px`,
          fontSize: `${fontSize}px`,
          fontWeight: '500',
          color: config.color.match(/\[(.*?)\]/)?.[1] || (isSelected ? '#000' : '#18181b'),
          textShadow: '0 1px 2px rgba(255,255,255,1), -1px -1px 0 rgba(255,255,255,1), 1px -1px 0 rgba(255,255,255,1), -1px 1px 0 rgba(255,255,255,1), 1px 1px 0 rgba(255,255,255,1)',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.025em',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'left',
          pointerEvents: 'none',
          opacity: 1,
          zIndex: isSelected ? 1001 : 1,
          transition: 'all 0.3s ease-in-out'
        }}>
          {price}
        </div>
      )}

      {/* Pin Body */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${pinSize}px`,
        height: `${pinSize}px`,
        backgroundColor: isSelected ? '#09090b' : 'white',
        borderRadius: '50%',
        border: `${2 * scale}px solid ${isSelected ? '#09090b' : 'white'}`,
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
          backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : (config.bgColor.match(/\[(.*?)\]/)?.[1] || '#f4f4f5'),
          borderRadius: '50%',
          width: `${24 * scale}px`,
          height: `${24 * scale}px`,
        }}>
          <IconComponent size={14 * scale} strokeWidth={3} className={isSelected ? 'text-white' : config.color} />
        </div>
      </div>

      {/* Integrated Tail */}
      <div style={{
        width: `${tailSize}px`,
        height: `${tailSize}px`,
        backgroundColor: isSelected ? '#09090b' : 'white',
        borderRight: `${2 * scale}px solid ${isSelected ? '#09090b' : 'white'}`,
        borderBottom: `${2 * scale}px solid ${isSelected ? '#09090b' : 'white'}`,
        transform: 'rotate(45deg)',
        marginTop: `${-10 * scale}px`,
        zIndex: 1,
        borderRadius: `0 0 ${3 * scale}px 0`
      }} />
    </div>
  );

  // Locked Anchor Point Logic
  // Using a deterministic box where the bottom center is the anchor
  
  return L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize: [totalWidth, totalHeight],
    // Anchor to the bottom-center of the icons layout box
    // Total height of Pin (36) + Tail (~10 visible) = ~46
    iconAnchor: [totalWidth / 2, (46 * scale)],
  });
};

const createClusterIcon = (count: number, zoom: number) => {
  const scale = zoom >= 16 ? 1.05 : (zoom >= 14 ? 1 : 0.85);
  const size = 52 * scale; // Increased for better visibility
  
  const html = ReactDOMServer.renderToStaticMarkup(
    <div style={{
      width: size,
      height: size,
      backgroundColor: '#09090b', // Sleek dark theme
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `${2 * scale}px solid white`,
      boxShadow: '0 12px 32px -4px rgba(0,0,0,0.3)',
      position: 'relative',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
       {/* Inner subtle decorative ring */}
       <div style={{
         position: 'absolute',
         inset: 4,
         border: '1px solid rgba(255,255,255,0.1)',
         borderRadius: '50%',
       }} />
       <span style={{
         color: 'white',
         fontSize: 18 * scale,
         fontWeight: '700',
         fontFamily: 'Inter, sans-serif',
         letterSpacing: '-0.02em',
         textShadow: '0 1px 2px rgba(0,0,0,0.3)'
       }}>
         {count}
       </span>
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};



interface MapComponentProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property | null) => void;
  userLocation?: { lat: number; lng: number; isFallback?: boolean } | null;
  showDistance?: boolean;
  disableCard?: boolean;
}

// Component to handle map center and zoom changes only when selected property changes
function MapController({ selectedProperty, zoomLevel, properties }: { selectedProperty: Property | null; zoomLevel: number; properties: Property[] }) {
  const map = useMap();
  const prevPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedProperty && selectedProperty.property_id !== prevPropertyIdRef.current) {
      const coords = getPropertyCoords(selectedProperty, properties);
      
      // Intelligent zoom logic:
      // If the property is already visible in the current view, don't zoom out.
      // Simply pan to it at the current zoom level.
      const currentBounds = map.getBounds();
      const isAlreadyVisible = currentBounds.contains(L.latLng(coords[0], coords[1]));
      
      const targetZoom = isAlreadyVisible ? Math.max(map.getZoom(), zoomLevel) : zoomLevel;

      map.flyTo(coords, targetZoom, { 
        animate: true, 
        duration: isAlreadyVisible ? 0.8 : 1.5, // Faster flight if already on screen
        easeLinearity: 0.25
      });
      prevPropertyIdRef.current = selectedProperty.property_id;
    } else if (!selectedProperty && prevPropertyIdRef.current !== null) {
      // Return to default view if property is deselected
      // map.flyTo([29.3909, 76.9635], 13);
      prevPropertyIdRef.current = null;
    }
  }, [selectedProperty, zoomLevel, map, properties]);

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
const getCoords = (property: Property, allProps?: Property[]): [number, number] => getPropertyCoords(property, allProps);

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

/**
 * Component to render markers with collision detection to prevent overlapping.
 * Selected property is always shown. Others are filtered based on screen-space proximity.
 */
function CollisionAwareMarkers({ 
  properties, 
  selectedProperty, 
  onSelectProperty, 
  zoom 
}: { 
  properties: Property[], 
  selectedProperty: Property | null, 
  onSelectProperty: (p: Property | null) => void, 
  zoom: number 
}) {
  const map = useMap();
  
  const clusteredData = useMemo(() => {
    // If map isn't ready, just show individual markers
    if (!map) return properties.map(p => ({ 
      type: 'marker' as const, 
      props: [p], 
      center: getPropertyCoords(p, properties), 
      hideLabel: false 
    }));
    
    // Clustering Radius Logic - more aggressive to prevent visual overlap
    const CLUSTER_RADIUS = zoom >= 18 ? 0 : (zoom >= 16 ? 45 : 65);


    const sortedProps = [...properties].sort((a, b) => {
      if (a.property_id === selectedProperty?.property_id) return -1;
      if (b.property_id === selectedProperty?.property_id) return 1;
      const aHasCoords = a.latitude && a.longitude;
      const bHasCoords = b.latitude && b.longitude;
      if (aHasCoords && !bHasCoords) return -1;
      if (!aHasCoords && bHasCoords) return 1;
      return 0;
    });

    const groups: { type: 'marker' | 'cluster', props: Property[], center: [number, number] }[] = [];

    sortedProps.forEach(prop => {
      const coords = getPropertyCoords(prop, properties);
      const point = map.project(L.latLng(coords[0], coords[1]), zoom);
      const isSelected = prop.property_id === selectedProperty?.property_id;

      // Never cluster the selected property
      if (isSelected) {
        groups.push({ type: 'marker', props: [prop], center: coords });
        return;
      }

      // Check if this property can merge into an existing cluster/marker
      const nearIdx = groups.findIndex(g => {
        // Don't merge with a group containing the selected property
        if (g.props.some(p => p.property_id === selectedProperty?.property_id)) return false;
        
        const gPoint = map.project(L.latLng(g.center[0], g.center[1]), zoom);
        const dx = point.x - gPoint.x;
        const dy = point.y - gPoint.y;
        return Math.sqrt(dx*dx + dy*dy) < CLUSTER_RADIUS;
      });

      if (nearIdx === -1) {
        groups.push({ type: 'marker', props: [prop], center: coords });
      } else {
        groups[nearIdx].type = 'cluster';
        groups[nearIdx].props.push(prop);
      }
    });

    // Now for markers that aren't in a cluster, determine label visibility
    const occupiedRects: { x1: number, y1: number, x2: number, y2: number }[] = [];
    
    // Pre-occupy space with all markers/clusters pins
    groups.forEach(g => {
      const point = map.project(L.latLng(g.center[0], g.center[1]), zoom);
      const isSelected = g.props.some(p => p.property_id === selectedProperty?.property_id);
      const scale = isSelected ? 1.15 : (zoom >= 16 ? 1.05 : (zoom >= 14 ? 1 : 0.85));
      const size = g.type === 'cluster' ? 26 * scale : 20 * scale; // Buffer around pins and clusters
      
      occupiedRects.push({
        x1: point.x - size - 4,
        y1: point.y - (g.type === 'cluster' ? size + 4 : 46 * scale) - 4,
        x2: point.x + size + 4,
        y2: point.y + size + 4
      });
    });

    return groups.map(g => {
      if (g.type === 'cluster') return { ...g, hideLabel: true };
      
      const prop = g.props[0];
      const isSelected = prop.property_id === selectedProperty?.property_id;
      const showLabelBase = isSelected || zoom >= 15;
      
      if (!showLabelBase) return { ...g, hideLabel: true };

      const point = map.project(L.latLng(g.center[0], g.center[1]), zoom);
      const scale = isSelected ? 1.15 : (zoom >= 16 ? 1.05 : (zoom >= 14 ? 1 : 0.85));
      const labelWidth = 90 * scale;
      const pinHalfWidth = 18 * scale;
      const pinHeight = 46 * scale;

      const labelRect = {
        x1: point.x + pinHalfWidth,
        y1: point.y - pinHeight,
        x2: point.x + pinHalfWidth + labelWidth + 4,
        y2: point.y
      };

      const overlaps = occupiedRects.some(r => (
        labelRect.x1 < r.x2 && labelRect.x2 > r.x1 && labelRect.y1 < r.y2 && labelRect.y2 > r.y1
      ));

      if (isSelected || !overlaps) {
        occupiedRects.push(labelRect);
        return { ...g, hideLabel: false };
      }
      return { ...g, hideLabel: true };
    });
  }, [properties, selectedProperty, zoom, map]);

  const onClusterClick = (clusterProps: Property[]) => {
    if (clusterProps.length <= 1) return;
    
    const lats = clusterProps.map(p => getPropertyCoords(p, properties)[0]);
    const lngs = clusterProps.map(p => getPropertyCoords(p, properties)[1]);
    
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    
    // If all properties are at the same point (fallbacks), just zoom in one level
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.zoomIn(2);
      map.panTo(bounds.getCenter());
    } else {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  };

  return (
    <>
      {clusteredData.map((data, idx) => {
        if (data.type === 'cluster') {
          return (
            <Marker 
              key={`cluster-${idx}-${data.props[0].property_id}`}
              position={data.center}
              icon={createClusterIcon(data.props.length, zoom)}
              zIndexOffset={100}
              eventHandlers={{
                click: () => onClusterClick(data.props),
              }}
            />
          );
        }
        
        const prop = data.props[0];
        return (
          <Marker 
            key={prop.property_id} 
            position={data.center}
            icon={createCustomIcon(prop, selectedProperty?.property_id === prop.property_id, zoom, data.hideLabel)}
            zIndexOffset={selectedProperty?.property_id === prop.property_id ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectProperty(prop),
            }}
          />
        );
      })}
    </>
  );
}


export default function MapComponent({ 
  properties, 
  selectedProperty, 
  onSelectProperty, 
  userLocation,
  showDistance = false,
  disableCard = false
}: MapComponentProps) {
  const router = useRouter();
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave } = useShortlist();
  const [isSatellite, setIsSatellite] = useState(false);
  const [zoom, setZoom] = useState(13);

  // Helper component to track map events (zoom, clicks outside)
  function MapEvents() {
    const map = useMapEvents({
      zoomend: () => {
        setZoom(map.getZoom());
      },
      click: (e) => {
        // If click is on the map (not a marker), unselect
        // Leaflet handles marker clicks first, and propagation can be stopped there
        onSelectProperty(null);
      }
    });
    return null;
  }
  const center: [number, number] = selectedProperty 
    ? getCoords(selectedProperty, properties)
    : [29.3909, 76.9635]; // Panipat center

  const propertyCoords = selectedProperty ? getCoords(selectedProperty, properties) : null;
  const userCoords: [number, number] | null = userLocation ? [userLocation.lat, userLocation.lng] : null;
  const curvedPath = (userCoords && propertyCoords) ? getCurvedPath(userCoords, propertyCoords) : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={selectedProperty ? getCoords(selectedProperty, properties) : [29.3909, 76.9635]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapEvents />
        <InvalidateSize trigger={properties} />
        <MapController selectedProperty={selectedProperty} zoomLevel={15} properties={properties} />
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
                  html: ReactDOMServer.renderToStaticMarkup(
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
        <CollisionAwareMarkers 
          properties={properties} 
          selectedProperty={selectedProperty} 
          onSelectProperty={onSelectProperty} 
          zoom={zoom} 
        />
      </MapContainer>

      {/* Floating Card UI */}
      <AnimatePresence>
        {selectedProperty && !disableCard && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-6 left-1/2 z-[1001] w-[calc(100%-32px)] max-w-md -translate-x-1/2 md:bottom-10"
          >
            <div className="group relative rounded-[24px] bg-white p-0.5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] backdrop-blur-xl border border-white/50">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty(null);
                }}
                className="absolute -top-2 -right-2 z-[1002] flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition-all hover:scale-110 active:scale-90 border-2 border-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              <PropertyCard 
                property={selectedProperty} 
                isExpanded={false}
                onToggle={() => window.open(`/property/${selectedProperty.property_id}`, '_blank')} 
                showDistance={showDistance}
                isNearMeFallback={userLocation?.isFallback}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
