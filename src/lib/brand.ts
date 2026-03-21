
export interface BrandConfig {
  name: string;
  isCustom: boolean;
  logoText: {
    styled: boolean;
    prefix?: string;
    suffix?: string;
    text?: string;
  };
}

export function getBrandConfig(hostname: string | null): BrandConfig {
  const fallback: BrandConfig = {
    name: "MyListings",
    isCustom: false,
    logoText: {
      styled: true,
      prefix: "My",
      suffix: "Listings"
    }
  };

  if (!hostname) return fallback;

  const host = hostname.split(':')[0].toLowerCase();
  
  // If it starts with www. or is localhost, it's a fallback
  if (host.startsWith('www.') || host === 'localhost' || host === '127.0.0.1') {
    return fallback;
  }

  // Extract first part (subdomain)
  const parts = host.split('.');
  
  // If we have a subdomain (e.g., subdomain.domain.com)
  if (parts.length >= 2) {
    const subdomain = parts[0];

    // If the first part is NOT 'www', treat it as a custom brand
    if (subdomain !== 'www') {
      // Use the subdomain as the brand name
      // We format it as uppercase to give it a brand-like appearance
      const brandName = subdomain.toUpperCase();
      
      return {
        name: brandName,
        isCustom: true,
        logoText: {
          styled: false,
          text: brandName
        }
      };
    }
  }

  return fallback;
}
