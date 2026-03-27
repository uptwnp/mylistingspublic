import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { getBrandConfig } from "@/lib/brand";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StickyHub } from "@/components/StickyHub";
import { ShortlistProvider } from "@/context/ShortlistContext";
import { BrandProvider } from "@/context/BrandContext";
import { ContactDetailForm } from "@/components/ContactDetailForm";
import { InquiryModal } from "@/components/InquiryModal";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: 'swap',
  weight: ['600', '700', '800'],
});

export async function generateMetadata(): Promise<Metadata> {
  // generateMetadata runs in parallel to the layout. It will block the head but not the initial shell.
  const headersList = await headers();
  const host = headersList.get('host');
  const brand = getBrandConfig(host);
  
  return {
    title: `${brand.name} | Premium Property Showcase`,
    description: "Discover curated internal property listings instantly.",
  };
}

// CRITICAL: Removed 'async' from the RootLayout itself to ensure the server
// sends the <html> and <body> shell IMMEDIATELY without waiting for DB/Headers/etc.
// This allows Shimmers/Loading skeletons to appear in <100ms.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lcfhvhhexidtbzcxwryx.supabase.co" />
        <link rel="dns-prefetch" href="https://lcfhvhhexidtbzcxwryx.supabase.co" />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <Suspense fallback={null}>
           <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

// Separate component for brand/hosting info that might need a moment to resolve
// Putting it here allows the outer shell (body/html) to stream before this component is ready.
async function LayoutContent({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const host = headersList.get('host');

  return (
    <BrandProvider initialHost={(host || '').split(':')[0]}>
      <ShortlistProvider>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <StickyHub />
        <ContactDetailForm />
        <InquiryModal />
      </ShortlistProvider>
    </BrandProvider>
  );
}
