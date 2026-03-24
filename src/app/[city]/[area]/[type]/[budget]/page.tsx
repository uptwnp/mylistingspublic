
import { SeoExploreView, generateSeoMetadata } from '../../../../seo-view-shared';
import { Metadata } from 'next';

// Cache deep search filters for 1 hour
export const revalidate = 3600;
export const runtime = 'edge';

type Props = { params: Promise<{ city: string; area: string; type: string; budget: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, area, type, budget } = await params;
  return generateSeoMetadata([city, area, type, budget]);
}

export default async function Page({ params }: Props) {
  const { city, area, type, budget } = await params;
  return <SeoExploreView slug={[city, area, type, budget]} />;
}
