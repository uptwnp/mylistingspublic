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

export function formatSizeRange(min: number, max: number, unit: string | null) {
  if (!min && !max) return 'N/A';
  const unitStr = unit || '';
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

export function getPropertyCoords(property: Partial<Property>, allProperties?: Partial<Property>[]): [number, number] {
  if (property.latitude && property.longitude) {
    return [property.latitude, property.longitude];
  }

  // Generate a predictable scatter based on area name
  const areaName = property.area || 'unknown';
  const hash = (property.property_id || areaName).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const scatterLat = ((hash % 100) / 10000) - 0.005; // ~500m scatter
  const scatterLng = (((hash * 13) % 100) / 10000) - 0.005;

  // 1. Try to find the average of other properties in the EXACT SAME city and area
  if (allProperties && property.city && property.area) {
    const sameAreaProps = allProperties.filter(
      p => p.city?.toLowerCase() === property.city?.toLowerCase() &&
           p.area?.toLowerCase() === property.area?.toLowerCase() &&
           p.latitude && p.longitude &&
           p.property_id !== property.property_id
    );

    if (sameAreaProps.length > 0) {
      const avgLat = sameAreaProps.reduce((sum, p) => sum + (p.latitude || 0), 0) / sameAreaProps.length;
      const avgLng = sameAreaProps.reduce((sum, p) => sum + (p.longitude || 0), 0) / sameAreaProps.length;
      return [avgLat + scatterLat, avgLng + scatterLng];
    }
    
    // 2. Fallback to city average if area has no properties with lat/long
    const sameCityProps = allProperties.filter(
      p => p.city?.toLowerCase() === property.city?.toLowerCase() &&
           p.latitude && p.longitude &&
           p.property_id !== property.property_id
    );

    if (sameCityProps.length > 0) {
      const avgLat = sameCityProps.reduce((sum, p) => sum + (p.latitude || 0), 0) / sameCityProps.length;
      const avgLng = sameCityProps.reduce((sum, p) => sum + (p.longitude || 0), 0) / sameCityProps.length;
      return [avgLat + scatterLat, avgLng + scatterLng];
    }
  }

  // 3. Absolute Fallback to City Center
  const baseLat = property.city?.toLowerCase() === 'karnal' ? 29.6857 : 29.3909;
  const baseLng = property.city?.toLowerCase() === 'karnal' ? 76.9907 : 76.9635;

  // We spread the points tighter around the static fallback
  const fallbackLatOffset = ((hash % 100) / 5000) - 0.01;
  const fallbackLngOffset = (((hash * 13) % 100) / 5000) - 0.01;

  return [baseLat + fallbackLatOffset, baseLng + fallbackLngOffset];
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
