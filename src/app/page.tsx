import { getHomepageData } from "@/lib/supabase";
import { HomeClientWrapper } from "@/components/HomeClientWrapper";
import { cookies } from "next/headers";
import { Suspense } from "react";
import RootLoading from "./loading";

export const runtime = 'edge';
export const revalidate = 21600; // Cache page for 6 hours (ISR)

const CITY_KEY = 'dealer_network_selected_city';

// CRITICAL: Homepage is now a direct shell.
// By NOT making the main Home function async and NOT awaiting cookies at the top level,
// we allow the RootLayout (Navbar/Footer) and the <RootLoading /> shimmers
// to appear on the user's screen in <100ms.
export default function Home() {
  return (
    <Suspense fallback={<RootLoading />}>
      <HomeContent />
    </Suspense>
  );
}

// Data fetching and dynamic header logic (cookies) is now isolated inside 
// this sub-component, which is Suspended. This ensures the rest of the 
// page (and the shell) can stream without waiting for the database.
async function HomeContent() {
  const cookieStore = await cookies();
  const serverCity = cookieStore.get(CITY_KEY)?.value || 'Panipat';

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
