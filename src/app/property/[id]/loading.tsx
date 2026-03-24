import React from 'react';

export default function LoadingPropertyDetail() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Breadcrumb & Heading Skeleton */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-28 sm:pt-32 pb-4 sm:pb-6 lg:px-12 animate-pulse">
        <div className="h-4 w-48 bg-zinc-100 rounded-full mb-4" />
        <div className="h-10 w-full max-w-2xl bg-zinc-100 rounded-2xl" />
      </section>

      {/* Main Content Skeleton */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          <div className="lg:col-span-8 space-y-8 animate-pulse">
            <div className="h-8 w-32 bg-zinc-100 rounded-lg" />
            <div className="aspect-[16/9] w-full bg-zinc-100 rounded-3xl" />
            
            <div className="flex gap-4">
               <div className="h-10 w-24 bg-zinc-100 rounded-full" />
               <div className="h-10 w-24 bg-zinc-100 rounded-full" />
               <div className="h-10 w-24 bg-zinc-100 rounded-full" />
            </div>

            <div className="space-y-4 pt-12">
                <div className="h-8 w-48 bg-zinc-100 rounded-xl" />
                <div className="space-y-2">
                    <div className="h-4 w-full bg-zinc-50 rounded-full" />
                    <div className="h-4 w-full bg-zinc-50 rounded-full" />
                    <div className="h-4 w-3/4 bg-zinc-50 rounded-full" />
                </div>
            </div>
            
            <div className="h-[400px] w-full bg-zinc-100 rounded-3xl" />
          </div>

          <aside className="lg:col-span-4 h-fit sticky top-24 animate-pulse">
            <div className="rounded-3xl border border-zinc-100 p-8 space-y-6">
                <div className="h-4 w-24 bg-zinc-100 rounded-full" />
                <div className="h-12 w-48 bg-zinc-100 rounded-2xl" />
                <div className="space-y-3 pt-4">
                    <div className="h-14 w-full bg-zinc-100 rounded-2xl" />
                    <div className="h-14 w-full bg-zinc-900/5 rounded-2xl" />
                </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
