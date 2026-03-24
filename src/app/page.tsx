import { getProperties } from "@/lib/supabase";
import { HomeClientWrapper } from "@/components/HomeClientWrapper";
import { cookies } from "next/headers";

export const runtime = 'edge';
export const revalidate = 3600; // Cache page for 1 hour (ISR)

const CITY_KEY = 'dealer_network_selected_city';

export default async function Home() {
  // Read previous city selection from cookie for Server-Side Pre-fetching
  const cookieStore = await cookies();
  const serverCity = cookieStore.get(CITY_KEY)?.value || 'Panipat';

  // Only pre-fetch the first section (Plots) for the hero/above-fold
  // Rest of the sections will lazy-load via Intersection Observer for speed
  const plotData = await getProperties(0, 6, false, serverCity, 'Residential Plot');

  // Transform is now a simple pass-through since RPC handles filtering
  const processForSection = (results: any) => ({
    data: results.data || [],
    count: results.count || 0
  });

  return (
    <HomeClientWrapper 
       initialPlots={processForSection(plotData)}
       serverCity={serverCity}
    />
  );
}
