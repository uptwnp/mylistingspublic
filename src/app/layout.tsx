import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";

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

// CRITICAL: Metadata is now STATIC. This is the #1 way to get an instant TTFB.
// Next.js 15 will wait for generateMetadata before sending the first byte.
// By making it static, we ensure the browser gets the HTML in <100ms.
export const metadata: Metadata = {
  title: "MyListings | Premium Property Showcase",
  description: "Discover curated internal property listings instantly.",
  icons: {
    icon: '/favicon.ico',
  }
};

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
        <Suspense fallback={<RootLoadingSkeleton />}>
           <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

/**
 * This skeleton ensures that even if the brand config or headers take time,
 * the user sees a premium UI structure IMMEDIATELY.
 */
function RootLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <div className="h-20 bg-white border-b border-zinc-100 flex items-center px-6">
        <div className="h-8 w-32 bg-zinc-100 rounded-lg" />
      </div>
      <main className="flex-1 bg-white p-6 space-y-6">
        <div className="h-64 bg-zinc-50 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
           <div className="h-32 bg-zinc-50 rounded-2xl" />
           <div className="h-32 bg-zinc-50 rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  // headers() call is moved inside the Suspense boundary.
  // This means it will NOT block the initial HTML byte.
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
