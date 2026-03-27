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

  // Pre-fetch all main sections for the homepage to eliminate client-side loading flickering
  // This significantly improves perceived speed and LCP as listings are ready on first paint
  const [plotData, apartmentData, villaData, commercialData] = await Promise.all([
    getProperties(0, 6, false, serverCity, 'Residential Plot'),
    getProperties(0, 6, false, serverCity, 'Flat'),
    getProperties(0, 6, false, serverCity, 'Residential House'),
    getProperties(0, 6, false, serverCity, 'Commercial Built-up')
  ]);

  const processForSection = (results: any) => ({
    data: results.data || [],
    count: results.count || 0
  });

  return (
    <HomeClientWrapper 
       initialPlots={processForSection(plotData)}
       initialApartments={processForSection(apartmentData)}
       initialVillas={processForSection(villaData)}
       initialCommercial={processForSection(commercialData)}
       serverCity={serverCity}
    />
  );
}
