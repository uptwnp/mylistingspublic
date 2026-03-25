

'use client';


import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';
import { Plus, Minus, Satellite, Map as MapIcon, Locate, MapPin, ExternalLink, ChevronRight, Ruler, Heart, Check, Search } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, getPropertyCoords, cn, formatSizeRange, isValidLatLng } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import * as ReactDOMServer from 'react-dom/server';
import Link from 'next/link';
import { useShortlist } from '@/context/ShortlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─── Icon caches ─────────────────────────────────────────────────────────────
// Avoids calling ReactDOMServer.renderToStaticMarkup on every zoom/pan event.
const customIconCache = new Map<string, L.DivIcon>();
const clusterIconCache = new Map<string, L.DivIcon>();


const createCustomIcon = (property: Property, isSelected: boolean, zoom: number, hideLabel?: boolean) => {
  // KEY: Do NOT vary icon dimensions by zoom level.
  // Changing iconSize causes Leaflet to destroy and re-insert the marker DOM element,
  // producing a visible 'pop in' flash.
  // Scale is ONLY two states: selected (slightly larger) or normal.
  const scale = isSelected ? 1.15 : 1;
  const showFullLabel = isSelected || (zoom >= 15 && !hideLabel);

  const cacheKey = `${property.property_id}-${isSelected}-${showFullLabel}`;
  if (customIconCache.has(cacheKey)) return customIconCache.get(cacheKey)!;

  const price = formatPrice(property.price_min);
  const config = getPropertyConfig(property.type);
  const IconComponent = config.icon;

  // Fixed pixel sizes — must NOT use CSS filter anywhere in icon HTML.
  // CSS `filter` creates a new GPU compositing layer which breaks Leaflet's
  // zoom animation (markers float on screen instead of tracking the map).
  const PIN   = Math.round(36 * scale);
  const TAIL  = Math.round(14 * scale);
  const OVER  = Math.round(10 * scale); // tail overlaps pin by this many px
  const INNER = Math.round(24 * scale);
  const ICON_W = Math.round(160 * scale);
  const ICON_H = Math.round(80 * scale);
  const FS    = Math.round((isSelected ? 13 : 11) * scale);

  // Tail tip Y from top of icon box:
  // tailCenter = (PIN - OVER) + TAIL/2
  // tipY = tailCenter + TAIL*sqrt(2)/2 (halfDiagonal of rotated square)
  const tailCenterY = (PIN - OVER) + TAIL / 2;
  const TIP_Y = Math.round(tailCenterY + (TAIL / 2) * Math.SQRT2);

  const pinBg = isSelected ? '#09090b' : 'white';
  const pinShadow = isSelected
    ? 'box-shadow:0 8px 24px rgba(0,0,0,0.25)'
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.15),inset 0 0 0 1px rgba(0,0,0,0.08)';

  const innerBg = isSelected
    ? 'rgba(255,255,255,0.15)'
    : (config.bgColor.match(/\[(.*?)\]/)?.[1] || '#f4f4f5');

  const iconColor = config.color.match(/\[(.*?)\]/)?.[1] || (isSelected ? '#fff' : '#18181b');
  const labelColor = config.color.match(/\[(.*?)\]/)?.[1] || (isSelected ? '#000' : '#18181b');
  const tailBorder = `${Math.round(2 * scale)}px solid ${pinBg}`;

  const iconMarkup = ReactDOMServer.renderToStaticMarkup(
    <IconComponent size={Math.round(14 * scale)} strokeWidth={2.5} color={isSelected ? 'white' : iconColor} />
  );

  // IMPORTANT: No `filter` CSS anywhere — it breaks Leaflet zoom animation.
  // Use `box-shadow` only (on the pin div), which does NOT create a new compositing layer.
  const html = [
    `<div style="position:relative;width:${ICON_W}px;height:${ICON_H}px;display:flex;flex-direction:column;align-items:center">`,
      showFullLabel ? [
        `<div style="`,
        `position:absolute;`,
        `left:${Math.round(ICON_W / 2 + PIN / 2 + 5)}px;`,
        `top:${Math.round(PIN / 2 - 8)}px;`,
        `font-size:${FS}px;`,
        `font-weight:600;`,
        `color:${labelColor};`,
        `text-shadow:0 1px 0 #fff,-1px 0 0 #fff,0 -1px 0 #fff,1px 0 0 #fff;`,
        `white-space:nowrap;`,
        `letter-spacing:-0.02em;`,
        `font-family:Inter,sans-serif;`,
        `pointer-events:none`,
        `">${price}</div>`,
      ].join('') : '',
      `<div style="`,
      `display:flex;align-items:center;justify-content:center;`,
      `width:${PIN}px;height:${PIN}px;`,
      `background-color:${pinBg};`,
      `border-radius:50%;`,
      `border:${Math.round(2 * scale)}px solid ${pinBg};`,
      `cursor:pointer;z-index:2;position:relative;flex-shrink:0;`,
      `${pinShadow}`,
      `">`,
        `<div style="display:flex;align-items:center;justify-content:center;background-color:${innerBg};border-radius:50%;width:${INNER}px;height:${INNER}px">`,
          iconMarkup,
        `</div>`,
      `</div>`,
      `<div style="`,
      `width:${TAIL}px;height:${TAIL}px;`,
      `background-color:${pinBg};`,
      `border-right:${tailBorder};border-bottom:${tailBorder};`,
      `transform:rotate(45deg);`,
      `margin-top:-${OVER}px;`,
      `z-index:1;flex-shrink:0;`,
      `border-radius:0 0 ${Math.round(3 * scale)}px 0`,
      `"></div>`,
    `</div>`,
  ].join('');

  const icon = L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize:   [ICON_W, ICON_H],
    iconAnchor: [Math.round(ICON_W / 2), TIP_Y],
    popupAnchor: [0, -TIP_Y],
  });
  customIconCache.set(cacheKey, icon);
  return icon;
};


const createClusterIcon = (count: number) => {
  const cacheKey = `cluster-${count}`;
  if (clusterIconCache.has(cacheKey)) return clusterIconCache.get(cacheKey)!;

  // Fixed size — no zoom-based scaling to prevent DOM re-creation during zoom
  // No CSS `filter` — it breaks Leaflet's zoom animation compositing
  const SIZE = 44;
  const html = [
    `<div style="`,
    `width:${SIZE}px;height:${SIZE}px;`,
    `background-color:#09090b;`,
    `border-radius:50%;`,
    `display:flex;align-items:center;justify-content:center;`,
    `border:2px solid white;`,
    `box-shadow:0 4px 16px rgba(0,0,0,0.25);`,
    `position:relative`,
    `">`,
      `<span style="color:white;font-size:15px;font-weight:700;font-family:Inter,sans-serif;letter-spacing:-0.02em">${count}</span>`,
    `</div>`,
  ].join('');

  const icon = L.divIcon({
    html,
    className: 'custom-cluster-marker',
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
  });
  clusterIconCache.set(cacheKey, icon);
  return icon;
};




interface MapComponentProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property | null) => void;
  userLocation?: { lat: number; lng: number; isFallback?: boolean } | null;
  showDistance?: boolean;
  disableCard?: boolean;
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
}

// isValidLatLng helper moved to utils.ts

// Component to handle map center and zoom changes only when selected property changes
function MapController({ selectedProperty, zoomLevel, properties, areaCenters }: { selectedProperty: Property | null; zoomLevel: number; properties: Property[]; areaCenters: any[] }) {
  const map = useMap();
  const prevPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    if (selectedProperty && selectedProperty.property_id !== prevPropertyIdRef.current) {
      const coords = getPropertyCoords(selectedProperty, properties, areaCenters);
      
      // Defensive check: Ensure we have valid numeric coordinates before calling Leaflet
      if (!isValidLatLng(coords)) {
        console.warn('MapController: Skipping flyTo due to invalid coordinates', selectedProperty.property_id, coords);
        return;
      }

      try {
        // Ensure map is ready and has bounds
        const currentBounds = map.getBounds();
        if (!currentBounds || typeof currentBounds.contains !== 'function') return;

        const latLng = L.latLng(coords[0], coords[1]);
        const isAlreadyVisible = currentBounds.contains(latLng);
        
        const currentZoom = map.getZoom();
        const safeZoom = (typeof currentZoom === 'number' && !isNaN(currentZoom)) ? currentZoom : zoomLevel;
        const targetZoom = isAlreadyVisible ? Math.max(safeZoom, zoomLevel) : zoomLevel;

        if (isNaN(targetZoom)) return;

        map.flyTo(coords, targetZoom, { 
          animate: true, 
          duration: isAlreadyVisible ? 0.8 : 1.5,
          easeLinearity: 0.25
        });
        prevPropertyIdRef.current = selectedProperty.property_id;
      } catch (err) {
        console.error('Map flyTo failed:', err);
      }
    } else if (!selectedProperty && prevPropertyIdRef.current !== null) {
      prevPropertyIdRef.current = null;
    }
  }, [selectedProperty, zoomLevel, map, properties, areaCenters]);

  return null;
}

// Handler for container resizing — uses ResizeObserver instead of polling interval
function InvalidateSize({ trigger }: { trigger?: any }) {
  const map = useMap();
  useEffect(() => {
    // Two quick invalidations to catch initial layout
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    // ResizeObserver for any subsequent container size changes
    let ro: ResizeObserver | null = null;
    const container = map.getContainer();
    if (container && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(container);
    } else {
      // Fallback for very old browsers
      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    return () => {
      ro?.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map, trigger]);
  return null;
}

// getCoords helper is now getPropertyCoords in utils.ts
const getCoords = (property: Property, allProps?: Property[], areaCenters?: any[]): [number, number] => getPropertyCoords(property, allProps, areaCenters);

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
  const { setUserLocation } = useShortlist();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  
  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            isFallback: false 
          };
          
          setUserLocation(newLoc);
          
          map.flyTo([newLoc.lat, newLoc.lng], 16, {
            animate: true,
            duration: 1.5
          });
        },
        (error) => {
          console.error("GPS error:", error);
          // Fallback if needed, but usually just log it
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  return (
    <>
      {/* Zoom & GPS Group (Right Side) */}
      <div className={cn(
        "absolute right-3 sm:right-8 z-[1000] flex flex-col gap-3 sm:gap-4 transition-all duration-500",
        hasSelectedProperty ? "bottom-48 sm:bottom-12" : "bottom-5 sm:bottom-8"
      )}>
        <div className="flex flex-col overflow-hidden rounded-[12px] sm:rounded-[20px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <button 
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-zinc-900" />
          </button>
          
          <div className="mx-2 sm:mx-3 h-px bg-zinc-200/50" />
          
          <button 
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            <Minus className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-zinc-900" />
          </button>

          <div className="mx-2 sm:mx-3 h-px bg-zinc-200/50" />

          <button 
            onClick={handleGPS}
            title="My Location"
            className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            <Locate className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-zinc-900" />
          </button>
        </div>
      </div>

      {/* Satellite Toggle (Left Side) */}
      <div className={cn(
        "absolute left-3 sm:left-8 z-[1000] transition-all duration-500",
        hasSelectedProperty ? "bottom-48 sm:bottom-12" : "bottom-5 sm:bottom-8"
      )}>
        <button 
          onClick={() => setIsSatellite(!isSatellite)}
          title={isSatellite ? "Show Map" : "Show Satellite"}
          className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-[12px] sm:rounded-[20px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all hover:scale-110 active:scale-[0.98]"
        >
          {isSatellite ? <MapIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-zinc-900" /> : <Satellite className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-zinc-900" />}
        </button>
      </div>
    </>
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
  zoom,
  areaCenters
}: { 
  properties: Property[], 
  selectedProperty: Property | null, 
  onSelectProperty: (p: Property | null) => void, 
  zoom: number,
  areaCenters: any[]
}) {
  const map = useMap();
  
  const clusteredData = useMemo(() => {
    // If map isn't ready, just show individual markers
    if (!map) return properties.map(p => ({ 
      type: 'marker' as const, 
      props: [p], 
      center: getPropertyCoords(p, properties, areaCenters), 
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
      const coords = getPropertyCoords(prop, properties, areaCenters);
      if (!isValidLatLng(coords)) return; // Skip invalid coords in markers

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
        const group = groups[nearIdx];
        group.type = 'cluster';
        group.props.push(prop);
        
        // Update cluster center incrementally (Efficient O(1) per point)
        const n = group.props.length;
        group.center = [
          (group.center[0] * (n - 1) + coords[0]) / n,
          (group.center[1] * (n - 1) + coords[1]) / n
        ];
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
        y1: point.y - (g.type === 'cluster' ? size + 4 : 43.5 * scale) - 4,
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
      const fontSize = (isSelected ? 14 : 11) * scale;
      const labelWidth = 90 * scale;
      const pinHalfWidth = 18 * scale;
      const pinHeight = 43.5 * scale;

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
  }, [properties, selectedProperty, zoom, map, areaCenters]);

  const onClusterClick = (clusterProps: Property[]) => {
    if (clusterProps.length <= 1) return;
    
    const validCoords = clusterProps
      .map(p => getPropertyCoords(p, properties, areaCenters))
      .filter(isValidLatLng);
    
    if (validCoords.length === 0) return;

    const lats = validCoords.map(c => c[0]);
    const lngs = validCoords.map(c => c[1]);
    
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
              icon={createClusterIcon(data.props.length)}
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


function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function MapEvents({ 
  onSelectProperty, 
  setZoom, 
  onBoundsChange 
}: { 
  onSelectProperty: (p: Property | null) => void, 
  setZoom: (z: number) => void,
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void
}) {
  // Debounce zoom updates so the expensive collision detection memo
  // doesn't recalculate mid-gesture on every intermediate zoom level.
  const setZoomDebounced = useMemo(() => debounce(setZoom, 150), [setZoom]);

  const map = useMapEvents({
    zoomend: () => {
      setZoomDebounced(map.getZoom());
      handleBoundsChange();
    },
    moveend: () => {
      handleBoundsChange();
    },
    click: () => {
      onSelectProperty(null);
    }
  });

  const handleBoundsChange = () => {
    if (onBoundsChange) {
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouthWest().lat,
        maxLat: b.getNorthEast().lat,
        minLng: b.getSouthWest().lng,
        maxLng: b.getNorthEast().lng
      });
    }
  };

  return null;
}

export default function MapComponent({ 
  properties, 
  selectedProperty, 
  onSelectProperty, 
  userLocation,
  showDistance = false,
  disableCard = false,
  onBoundsChange
}: MapComponentProps) {
  const router = useRouter();
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave, areaCenters } = useShortlist();
  const [isSatellite, setIsSatellite] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [lastSearchBounds, setLastSearchBounds] = useState<string>('');
  const { setUserLocation } = useShortlist();

  // Try to get user location on mount if not already present
  useEffect(() => {
    if (!userLocation && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isFallback: false
          });
        },
        (error) => {
          console.log("Initial geolocation suppressed:", error.message);
        },
        { timeout: 5000 }
      );
    }
  }, []); // Only once on mount
  const rawCenter = selectedProperty 
    ? getCoords(selectedProperty, properties, areaCenters)
    : [29.3909, 76.9635];
  
  const center: [number, number] = isValidLatLng(rawCenter) ? rawCenter : [29.3909, 76.9635];

  const handleBoundsChange = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    const boundsKey = `${bounds.minLat.toFixed(4)},${bounds.maxLat.toFixed(4)},${bounds.minLng.toFixed(4)},${bounds.maxLng.toFixed(4)}`;
    
    // Show 'Search this area' button if bounds changed significantly and we aren't currently searching them
    if (boundsKey !== lastSearchBounds) {
      setShowSearchArea(true);
    }
  };

  const handleSearchThisArea = () => {
    if (onBoundsChange) {
      // Get current map bounds directly for accuracy
      const map = (window as any).leafletMap; // We'll need a way to access the map instance if we use a button
      // Alternatively, we can just use the state from MapEvents if we lift it up or use a ref.
    }
    // Re-triggering search with current bounds
    setShowSearchArea(false);
  };

  const propertyCoords = selectedProperty ? getCoords(selectedProperty, properties, areaCenters) : null;
  const userCoords: [number, number] | null = (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) 
    ? [userLocation.lat, userLocation.lng] 
    : null;

  // Memoized so the 50-point bezier doesn't recompute on every render
  const curvedPath = useMemo(() => {
    if (isValidLatLng(userCoords) && isValidLatLng(propertyCoords)) {
      return getCurvedPath(userCoords!, propertyCoords!);
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userCoords?.[0], userCoords?.[1],
    propertyCoords?.[0], propertyCoords?.[1]
  ]);

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={selectedProperty ? getCoords(selectedProperty, properties, areaCenters) : [29.3909, 76.9635]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapReady onReady={(map) => { (window as any).leafletMap = map; }} />
        <MapEvents 
          onSelectProperty={onSelectProperty} 
          setZoom={setZoom} 
          onBoundsChange={handleBoundsChange}
        />
        <InvalidateSize trigger={properties} />
        <MapController selectedProperty={selectedProperty} zoomLevel={15} properties={properties} areaCenters={areaCenters} />
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
          hasSelectedProperty={!!selectedProperty && !disableCard}
        />
        
        {/* User Location Marker - Always show if available */}
        {isValidLatLng(userCoords) && (
          <Marker 
            position={userCoords}
            zIndexOffset={500}
            icon={L.divIcon({
              html: ReactDOMServer.renderToStaticMarkup(
                <div className="relative flex items-center justify-center">
                  {/* Pulsing effect */}
                  <div className="absolute h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-20" />
                  <div className="flex items-center justify-center h-8 w-8 bg-white border-2 border-blue-500 rounded-full shadow-lg ring-4 ring-blue-500/20">
                    <Locate className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              ),
              className: 'user-location-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          />
        )}

        {curvedPath && (
          <Polyline 
            positions={curvedPath}
            pathOptions={{
              color: '#3b82f6', // Match blue theme or original rose
              weight: 2,
              dashArray: '8, 12',
              lineCap: 'round',
              opacity: 0.6
            }}
          />
        )}
        {selectedProperty && selectedProperty.landmark_location_distance && selectedProperty.landmark_location_distance > 0 && isValidLatLng(getCoords(selectedProperty, properties, areaCenters)) && (
          <Circle
            center={getCoords(selectedProperty, properties, areaCenters)}
            radius={selectedProperty.landmark_location_distance}
            pathOptions={{
              color: '#3b82f6', // blue-500
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              weight: 1,
              dashArray: '5, 5'
            }}
          />
        )}
        <CollisionAwareMarkers 
          properties={properties} 
          selectedProperty={selectedProperty} 
          onSelectProperty={onSelectProperty} 
          zoom={zoom} 
          areaCenters={areaCenters}
        />
      </MapContainer>

      {/* Search this area button */}
      <AnimatePresence>
        {showSearchArea && !selectedProperty && (
          <motion.div 
            initial={{ y: -20, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -20, opacity: 0, x: '-50%' }}
            className="absolute top-4 left-1/2 z-[1001]"
          >
            <button 
              onClick={() => {
                const map = (window as any).leafletMap;
                if (map && onBoundsChange) {
                  const b = map.getBounds();
                  const bounds = {
                    minLat: b.getSouthWest().lat,
                    maxLat: b.getNorthEast().lat,
                    minLng: b.getSouthWest().lng,
                    maxLng: b.getNorthEast().lng
                  };
                  onBoundsChange(bounds);
                  setLastSearchBounds(`${bounds.minLat.toFixed(4)},${bounds.maxLat.toFixed(4)},${bounds.minLng.toFixed(4)},${bounds.maxLng.toFixed(4)}`);
                  setShowSearchArea(false);
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-zinc-100 active:scale-[0.98]"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Search this area</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                className="absolute -top-2 -right-2 z-[1002] flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition-all hover:scale-110 active:scale-[0.98] border-2 border-white"
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
