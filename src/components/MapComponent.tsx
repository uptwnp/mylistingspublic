

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
import { trackEvent } from '@/lib/analytics';
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
  const scale = isSelected ? 1.15 : 1;
  const showFullLabel = !hideLabel;
  const cacheKey = `${property.property_id}-${isSelected}-${showFullLabel}`;
  if (customIconCache.has(cacheKey)) return customIconCache.get(cacheKey)!;

  const price = formatPrice(property.price_min);
  const config = getPropertyConfig(property.type);
  const iconUrl = config.iconUrl;

  // All sizes in explicit pixels — never use width/height:100% inside DivIcon
  // because it depends on Leaflet's wrapper box-model which can be unreliable.
  const PIN  = Math.round(36 * scale);  // circle diameter
  const TAIL = Math.round(14 * scale);  // tail square side
  const OVER = Math.round(10 * scale);  // how much tail overlaps pin
  const INNER = Math.round(24 * scale);
  const W = Math.round(160 * scale);    // total icon box width
  const H = Math.round(80 * scale);     // total icon box height
  const FS = Math.round((isSelected ? 13 : 11) * scale);

  // Precise tail-tip Y from top of icon box:
  // tailCenterY = (PIN - OVER) + TAIL/2  (center of tile in flex-column flow)
  // tip = tailCenterY + TAIL/2 * sqrt(2)  (bottom vertex of 45deg-rotated square)
  const tailCenterY = (PIN - OVER) + TAIL / 2;
  const TIP_Y = Math.round(tailCenterY + (TAIL / 2) * Math.SQRT2); // ~43px at scale=1

  const pinBg = isSelected ? '#09090b' : 'white';
  const innerBg = isSelected
    ? 'rgba(255,255,255,0.15)'
    : (config.bgColor.match(/\[(.*?)\]/)?.[1] || '#f4f4f5');
  const labelColor = config.color.match(/\[(.*?)\]/)?.[1] || (isSelected ? '#000' : '#18181b');
  const iconColor = config.color.match(/\[(.*?)\]/)?.[1] || (isSelected ? '#fff' : '#18181b');
  const border = `${Math.round(2 * scale)}px solid ${pinBg}`;
  const shadow = isSelected
    ? '0 8px 24px rgba(0,0,0,0.28)'
    : '0 2px 8px rgba(0,0,0,0.16),inset 0 0 0 1px rgba(0,0,0,0.06)';

  const iconSvg = ReactDOMServer.renderToStaticMarkup(
    <img 
      src={iconUrl} 
      alt="" 
      style={{ 
        width: Math.round(16 * scale), 
        height: Math.round(16 * scale),
        objectFit: 'contain',
        filter: isSelected ? 'brightness(0) invert(1)' : 'none'
      }} 
    />
  );

  // Build as a string — explicit pixel dimensions anchored to W×H box.
  // No filter, no transition — both break Leaflet's zoom compositing layer.
  const html = [
    `<div style="position:relative;width:${W}px;height:${H}px;display:flex;flex-direction:column;align-items:center">`,
      showFullLabel
        ? `<div style="position:absolute;left:${Math.round(W/2+PIN/2+5)}px;top:${Math.round(PIN/2-8)}px;font-size:${FS}px;font-weight:600;color:${labelColor};text-shadow:0 1px 0 #fff,-1px 0 0 #fff,0 -1px 0 #fff,1px 0 0 #fff;white-space:nowrap;letter-spacing:-0.02em;font-family:Inter,sans-serif;pointer-events:none">${price}</div>`
        : '',
      `<div style="display:flex;align-items:center;justify-content:center;width:${PIN}px;height:${PIN}px;background-color:${pinBg};border-radius:50%;border:${border};cursor:pointer;z-index:2;position:relative;flex-shrink:0;box-shadow:${shadow}">`,
        `<div style="display:flex;align-items:center;justify-content:center;background-color:${innerBg};border-radius:50%;width:${INNER}px;height:${INNER}px">${iconSvg}</div>`,
      `</div>`,
      `<div style="width:${TAIL}px;height:${TAIL}px;background-color:${pinBg};border-right:${border};border-bottom:${border};transform:rotate(45deg);margin-top:-${OVER}px;z-index:1;flex-shrink:0;border-radius:0 0 ${Math.round(3*scale)}px 0"></div>`,
    `</div>`,
  ].join('');

  const icon = L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize:   [W, H],
    iconAnchor: [Math.round(W / 2), TIP_Y],
    popupAnchor: [0, -TIP_Y],
  });
  customIconCache.set(cacheKey, icon);
  return icon;
};


const createClusterIcon = (count: number) => {
  const cacheKey = `cluster-${count}`;
  if (clusterIconCache.has(cacheKey)) return clusterIconCache.get(cacheKey)!;

  // Fixed size — no zoom scaling. Changing iconSize during zoom causes markers
  // to be re-created and potentially flash or appear at the wrong position.
  const SIZE = 48;
  const html = [
    `<div style="width:${SIZE}px;height:${SIZE}px;background:#09090b;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.25);position:relative">`,
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
  // Use refs for properties/areaCenters — we don't want flyTo to re-trigger
  // just because the parent passed a new array reference.
  const propertiesRef = useRef(properties);
  const areaCentersRef = useRef(areaCenters);
  useEffect(() => { propertiesRef.current = properties; }, [properties]);
  useEffect(() => { areaCentersRef.current = areaCenters; }, [areaCenters]);

  useEffect(() => {
    if (!map) return;
    const propId = selectedProperty?.property_id ?? null;

    if (selectedProperty && propId !== prevPropertyIdRef.current) {
      const coords = getPropertyCoords(selectedProperty, propertiesRef.current, areaCentersRef.current);
      if (!isValidLatLng(coords)) {
        console.warn('MapController: invalid coords for', propId);
        prevPropertyIdRef.current = propId;
        return;
      }
      try {
        const currentBounds = map.getBounds();
        if (!currentBounds?.contains) return;
        const latLng = L.latLng(coords[0], coords[1]);
        const isAlreadyVisible = currentBounds.contains(latLng);
        const currentZoom = map.getZoom();
        const safeZoom = (typeof currentZoom === 'number' && !isNaN(currentZoom)) ? currentZoom : zoomLevel;
        const targetZoom = isAlreadyVisible ? Math.max(safeZoom, zoomLevel) : zoomLevel;
        if (isNaN(targetZoom)) return;
        map.flyTo(coords, targetZoom, { animate: true, duration: 0.6, easeLinearity: 0.5 });
      } catch (err) {
        console.error('Map flyTo failed:', err);
      }
      prevPropertyIdRef.current = propId;
    } else if (!selectedProperty) {
      prevPropertyIdRef.current = null;
    }
  // Only re-run when the selected property ID actually changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.property_id, zoomLevel, map]);

  return null;
}


// Handler for container resizing — uses ResizeObserver instead of polling interval
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const container = map.getContainer();
    let ro: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(container);
    }
    return () => { ro?.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  // Run once on mount only — container size changes handled by ResizeObserver
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
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

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  
  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          trackEvent('location_allowed', { method: 'gps' });
          trackEvent('used_nearMe');
          map.flyTo([position.coords.latitude, position.coords.longitude], 16, {
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
          onClick={() => {
            const next = !isSatellite;
            trackEvent(next ? 'switched_to_satellite_view' : 'switched_to_terrain_view');
            setIsSatellite(next);
          }}
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
        groups[nearIdx].type = 'cluster';
        groups[nearIdx].props.push(prop);
      }
    });

    // Now for markers that aren't in a cluster, determine label visibility
    const occupiedRects: { x1: number, y1: number, x2: number, y2: number }[] = [];
    
    // Pre-occupy space with all markers/clusters pins
    // Scale MUST match createCustomIcon: fixed 1.15 for selected, 1.0 for normal
    groups.forEach(g => {
      const point = map.project(L.latLng(g.center[0], g.center[1]), zoom);
      const isSelected = g.props.some(p => p.property_id === selectedProperty?.property_id);
      const sc = isSelected ? 1.15 : 1;
      const size = g.type === 'cluster' ? 24 : Math.round(18 * sc);
      const anchorH = g.type === 'cluster' ? 24 : Math.round(43 * sc); // matches TIP_Y
      
      occupiedRects.push({
        x1: point.x - size - 4,
        y1: point.y - anchorH - 4,
        x2: point.x + size + 4,
        y2: point.y + 4
      });
    });

    return groups.map(g => {
      if (g.type === 'cluster') return { ...g, hideLabel: true };
      
      const prop = g.props[0];
      const isSelected = prop.property_id === selectedProperty?.property_id;
      // Show labels at zoom 13+ to keep city-level views clean, or always if selected
      const showLabelBase = isSelected || zoom >= 13;
      
      if (!showLabelBase) return { ...g, hideLabel: true };

      const point = map.project(L.latLng(g.center[0], g.center[1]), zoom);
      const sc = isSelected ? 1.15 : 1;
      
      // These dimensions must match the CSS and the calculation in createCustomIcon
      const PIN = Math.round(36 * sc);
      const labelWidth = Math.round(90 * sc);
      const labelHeight = Math.round(20 * sc);
      const pinHalfWidth = PIN / 2;
      const anchorH = Math.round(43 * sc);

      // Label is placed at: left: W/2 + PIN/2 + 5, top: PIN/2 - 8
      // In relative project points:
      const labelRect = {
        x1: point.x + pinHalfWidth + 5,
        y1: point.y - anchorH + (PIN / 2) - 8,
        x2: point.x + pinHalfWidth + 5 + labelWidth,
        y2: point.y - anchorH + (PIN / 2) - 8 + labelHeight
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
      map.setView(bounds.getCenter(), map.getZoom() + 2, { animate: true, duration: 0.4 });
    } else {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 0.5 });
    }
  };

  return (
    <>
      {clusteredData.map((data, idx) => {
        if (data.type === 'cluster') {
          // Stable key: sort property IDs so key doesn't change if clustering order changes
          const clusterKey = 'cluster-' + [...data.props.map(p => p.property_id)].sort().join('-').slice(0, 40);
          return (
            <Marker 
              key={clusterKey}
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
  // Debounce zoom updates at 300ms so the expensive collision detection
  // doesn't recalculate mid-animation. flyTo can take 600ms, and fires
  // zoomend at the end — 300ms debounce ensures we only react once.
  const setZoomDebounced = useMemo(() => debounce(setZoom, 300), [setZoom]);
  const isAnimatingRef = useRef(false);

  const map = useMapEvents({
    movestart: () => {
      // Track when map is mid-animation (flyTo, zoomIn, etc.)
      isAnimatingRef.current = true;
    },
    zoomend: () => {
      // Delay zoom state update until any animation fully settles
      setZoomDebounced(map.getZoom());
    },
    moveend: () => {
      // Animation complete — safe to update markers & bounds now
      isAnimatingRef.current = false;
      // Also set zoom in case moveend fires without zoomend (pure panning)
      setZoomDebounced(map.getZoom());
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          minLat: b.getSouthWest().lat,
          maxLat: b.getNorthEast().lat,
          minLng: b.getSouthWest().lng,
          maxLng: b.getNorthEast().lng
        });
      }
    },
    click: () => {
      onSelectProperty(null);
    }
  });

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
        markerZoomAnimation={false}
        fadeAnimation={false}
      >
        <MapReady onReady={(map) => { (window as any).leafletMap = map; }} />
        <MapEvents 
          onSelectProperty={onSelectProperty} 
          setZoom={setZoom} 
          onBoundsChange={handleBoundsChange}
        />
        <InvalidateSize />
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
        
        {curvedPath && (
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
        )}
        
        {isValidLatLng(userCoords) && (
          <Marker 
            position={userCoords}
            icon={L.divIcon({
              html: '<div class="gps-marker"><div class="gps-marker-pulse"></div><div class="gps-marker-dot"></div></div>',
              className: 'user-location-marker', // we already removed border/background in CSS for this
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })}
            zIndexOffset={2000} // Keep GPS above property markers
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
                  trackEvent('searched_in_area');
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
