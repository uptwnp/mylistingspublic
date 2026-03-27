import { getProperties, getHomepageData } from "@/lib/supabase";
import { HomeClientWrapper } from "@/components/HomeClientWrapper";
import { cookies } from "next/headers";
import { Suspense } from "react";
import RootLoading from "./loading";

export const runtime = 'edge';
export const revalidate = 3600; // Cache page for 1 hour (ISR)

const CITY_KEY = 'dealer_network_selected_city';

export default async function Home() {
  // Use cookies to determine the city, but wrap the heavy fetching in Suspense
  // to prevent the entire page from being blocked.
  const cookieStore = await cookies();
  const serverCity = cookieStore.get(CITY_KEY)?.value || 'Panipat';

  return (
    <Suspense fallback={<RootLoading />}>
      <HomeContent serverCity={serverCity} />
    </Suspense>
  );
}

// Separate component for data fetching to allow streaming
async function HomeContent({ serverCity }: { serverCity: string }) {
  // Batched fetch for ALL homepage data in ONE RPC call.
  // This reduces TTFB by eliminating multiple round-trips and connection overhead.
  const batch = await getHomepageData(serverCity);
  
  const fallbackData = { data: [], count: 0 };
  
  return (
    <HomeClientWrapper 
       initialPlots={batch?.plots || fallbackData}
       initialApartments={batch?.apartments || fallbackData}
       initialVillas={batch?.villas || fallbackData}
       initialCommercial={batch?.commercial || fallbackData}
       serverCity={serverCity}
    />
  );
}
