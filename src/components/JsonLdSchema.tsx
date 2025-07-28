
'use client';

import { usePathname } from 'next/navigation';

export function JsonLdSchema() {
  const pathname = usePathname();
  const baseUrl = 'https://sangmameghamart.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sangma Megha Mart',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add links to your social media profiles here
      // e.g., "https://www.facebook.com/your-page",
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sangma Megha Mart',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
