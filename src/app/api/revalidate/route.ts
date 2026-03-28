import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * API Route to clear the cache remotely.
 * This can be triggered by a Supabase Webhook whenever a property is added or edited.
 * 
 * URL: [your-url]/api/revalidate?token=[REVALIDATE_TOKEN]
 * Method: POST
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Security Check: Only allow requests with the correct secret token
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Purge the listing data tag
    revalidateTag('listings');
    
    // Purge the homepage shell
    revalidatePath('/', 'layout');

    console.log('Cache revalidated via webhook');
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Global cache cleared successfully.'
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err }, { status: 500 });
  }
}

// Support GET for testing if needed (though POST is recommended for webhooks)
export async function GET(request: NextRequest) {
  return POST(request);
}
