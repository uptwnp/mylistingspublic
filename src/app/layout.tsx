import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { getBrandConfig } from "@/lib/brand";

export const runtime = 'edge';

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StickyHub } from "@/components/StickyHub";
import { ShortlistProvider } from "@/context/ShortlistContext";
import { BrandProvider } from "@/context/BrandContext";
import { ContactDetailForm } from "@/components/ContactDetailForm";
import { InquiryModal } from "@/components/InquiryModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: 'swap',
  weight: ['600', '700', '800'],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const brand = getBrandConfig(host);
  
  return {
    title: `${brand.name} | Premium Property Showcase`,
    description: "Discover curated internal property listings instantly.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return RootLayoutContent({ children });
}

async function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const host = headersList.get('host');

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
