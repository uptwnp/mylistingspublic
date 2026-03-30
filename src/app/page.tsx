import { HomeClientWrapper } from "@/components/HomeClientWrapper";
import { cookies } from "next/headers";
import { Suspense } from "react";
import RootLoading from "./loading";

export const runtime = 'edge';
export const revalidate = 2592000; // 30 days
export const ppr = true; // Use Partial Prerendering for instant shell

const CITY_KEY = 'dealer_network_selected_city';

// CRITICAL: Homepage is now a fully static shell.
// By NOT awaiting the database at the top level, we ensure the 
// address bar finishes loading in <100ms on all mobile devices.
export default function Home() {
  return (
    <Suspense fallback={<RootLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const cookieStore = await cookies();
  const serverCity = cookieStore.get(CITY_KEY)?.value || 'Panipat';

  // We passed undefined for data initially so the client takes over "After Load"
  return (
    <HomeClientWrapper 
       serverCity={serverCity}
    />
  );
}
