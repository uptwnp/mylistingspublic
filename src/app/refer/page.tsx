import React from 'react';
import { ReferClient } from '@/components/ReferClient';

// Enable ISR: Cache the Referral marketing for 1 hour
export const revalidate = 3600;

// Use Edge runtime for global speed
export const runtime = 'edge';

export default function ReferAndEarnPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 
          This page is now a Server Component. 
          The Referral marketing content correctly renders from the Edge cache.
          The interactive WhatsApp and call links are managed by ReferClient.
      */}
      <ReferClient />
    </div>
  );
}
