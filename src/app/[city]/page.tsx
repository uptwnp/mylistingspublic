
import { SeoExploreView, generateSeoMetadata } from '../seo-view-shared';
import { Metadata } from 'next';

// Cache this page for 1 hour on the Edge
export const revalidate = 3600;
export const runtime = 'edge';

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  return generateSeoMetadata([city]);
}

export default async function Page({ params }: Props) {
  const { city } = await params;
  return <SeoExploreView slug={[city]} />;
}
