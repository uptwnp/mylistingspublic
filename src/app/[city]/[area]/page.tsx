
import { SeoExploreView, generateSeoMetadata } from '../../seo-view-shared';
import { Metadata } from 'next';

// Cache common search routes for 1 hour
export const revalidate = 3600;
export const runtime = 'edge';

type Props = { params: Promise<{ city: string, area: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, area } = await params;
  return generateSeoMetadata([city, area]);
}

export default async function Page({ params }: Props) {
  const { city, area } = await params;
  return <SeoExploreView slug={[city, area]} />;
}
