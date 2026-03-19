import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Property } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatPrice(value: number) {
  if (!value) return '₹0';
  
  // The database stores prices in Lakhs (e.g., 75.00 = 75 Lakh, 250.00 = 2.5 Cr)
  if (value >= 100) {
    const val = value / 100;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)} Cr`;
  }
  
  return `₹${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} L`;
}

export function formatPriceRange(min: number, max: number) {
  if (!min && !max) return 'Price on Request';
  if (min === max || !max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

export function getFallbackUnit(price: number | null | undefined, size: number | null | undefined): string {
  if (!price || !size || typeof price !== 'number' || typeof size !== 'number' || size === 0) {
    return 'Sq.Yds'; // Default fallback
  }
  const ratio = price / size;
  if (ratio >= 0.05 && ratio <= 5) {
    return 'Gaj';
  }
  return 'Sq.Yds';
}

export function formatSizeRange(min: number, max: number, unit: string | null, price?: number) {
  if (!min && !max) return 'N/A';
  
  const unitStr = unit || 'Sq.Yds';
  
  if (min === max || !max) return `${min} ${unitStr}`.trim();
  return `${min} - ${max} ${unitStr}`.trim();
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function getMedian(arr: number[]) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getPropertyCoords(property: Partial<Property>, allProperties?: Partial<Property>[], areaCenters?: any[]): [number, number] {
  // Use pre-parsed coordinates from our new view
  const lat = property.latitude;
  const lng = property.longitude;

  if (!lat || !lng) {
    // Absolute Fallback to City Center (should theoretically rarely happen now)
    const hash = (property.property_id || property.area || 'unknown').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseLat = property.city?.toLowerCase() === 'karnal' ? 29.6857 : 29.3909;
    const baseLng = property.city?.toLowerCase() === 'karnal' ? 76.9907 : 76.9635;
    const lOff = ((hash % 100) / 5000) - 0.01;
    const gOff = (((hash * 13) % 100) / 5000) - 0.01;
    return [baseLat + lOff, baseLng + gOff];
  }

  // If this is a fallback location (from the area center), we apply a stable scatter
  // so properties in the same area don't overlap completely on the map.
  if (property.loc_fallback) {
    const hashStr = `${property.property_id || ''}-${property.area || 'unknown'}`;
    const hash = hashStr.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // ~500m randomization
    const scatterLat = ((hash % 100) / 10000) - 0.005; 
    const scatterLng = (((hash * 13) % 100) / 10000) - 0.005;
    
    return [lat + scatterLat, lng + scatterLng];
  }

  // Exact location - return as is
  return [lat, lng];
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
