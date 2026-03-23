import { getProperties } from "@/lib/supabase";
import { HomeClientWrapper } from "@/components/HomeClientWrapper";
import { cookies } from "next/headers";

export const runtime = 'edge';

const CITY_KEY = 'dealer_network_selected_city';

export default async function Home() {
  // Read previous city selection from cookie for Server-Side Pre-fetching
  const cookieStore = await cookies();
  const serverCity = cookieStore.get(CITY_KEY)?.value || 'Panipat';

  // Pre-fetch defaults for the selected city
  // We fetch only the first 20 for each section (we will filter down to 6)
  const [plotData, apartmentData, villaData, commercialData] = await Promise.all([
    getProperties(0, 20, false, serverCity, 'Residential Plot'),
    getProperties(0, 20, false, serverCity, 'Flat/Apartment'),
    getProperties(0, 20, false, serverCity, 'House/Villa'),
    getProperties(0, 20, false, serverCity, 'Commercial'),
  ]);

  // Transform the data to match the filtered output logic in PropertySection 
  // (We do the same filtering here as in the client to ensure consistency)
  const processForSection = (results: any, type: string) => {
    const data = results.data || [];
    const filtered = data.filter((p: any) => {
      const pType = p.type?.toLowerCase() || '';
      const targetType = type.toLowerCase();
      
      let typeMatch = false;
      if (targetType === 'residential plot') typeMatch = pType.includes('plot') || pType.includes('land');
      else if (targetType === 'house/villa') typeMatch = pType.includes('house') || pType.includes('villa');
      else if (targetType === 'flat/apartment') typeMatch = pType.includes('flat') || pType.includes('apartment');
      else if (targetType === 'commercial') typeMatch = pType.includes('commercial') || pType.includes('shop') || pType.includes('office');
      else typeMatch = pType.includes(targetType);

      return typeMatch;
    }).slice(0, 6);

    return { data: filtered, count: results.count };
  };

  return (
    <HomeClientWrapper 
       initialPlots={processForSection(plotData, 'Residential Plot')}
       initialApartments={processForSection(apartmentData, 'Flat/Apartment')}
       initialVillas={processForSection(villaData, 'House/Villa')}
       initialCommercial={processForSection(commercialData, 'Commercial')}
       serverCity={serverCity}
    />
  );
}
