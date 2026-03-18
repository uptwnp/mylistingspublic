import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";



export const runtime = 'edge';

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StickyHub } from "@/components/StickyHub";
import { DiscussionProvider } from "@/context/DiscussionContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyListing | Premium Property Showcase",
  description: "Discover curated internal property listings instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <DiscussionProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <StickyHub />
        </DiscussionProvider>
      </body>
    </html>
  );
}
