'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Action to clear all site data caches.
 * Purges the 'listings' tag and the root homepage.
 */
export async function refreshGlobalCache() {
  try {
    // Purge the specific listing data tag used in unstable_cache
    revalidateTag('listings');
    
    // Purge the homepage (ISR)
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return { success: false };
  }
}
