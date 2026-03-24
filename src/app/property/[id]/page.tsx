import React from 'react';
import { getPropertyById } from '@/lib/supabase';
import { PropertyDetailView } from '@/components/PropertyDetailView';
import { notFound } from 'next/navigation';

// Enable ISR: Cache this page on the Edge for 1 hour
export const revalidate = 3600;

// Force edge runtime for global performance
export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return notFound();
  }

  // Fetch only the core property data on the server
  // This makes the initial HTML generation much faster
  const property = await getPropertyById(id);

  if (!property) {
    return notFound();
  }

  // Similar properties will be lazy-fetched on the client to improve TTI
  // and prioritize the main property details.
  return (
    <PropertyDetailView 
      initialProperty={property} 
    />
  );
}
