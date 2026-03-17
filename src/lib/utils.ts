import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
