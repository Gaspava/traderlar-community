import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateSEO({
  title = 'Traderlar.com - Trading Topluluğu',
  description = "Türkiye'nin en büyük trader topluluğuna hoş geldiniz. Stratejiler, analizler, tartışmalar ve profesyonel içerikler için doğru yerdesiniz.",
  keywords = 'trading, trader, borsa, forex, kripto, strateji, analiz, topluluk',
  image = '/og-image.jpg',
  url = 'https://traderlar.com',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlar.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  return {
    title,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: 'Traderlar.com' }],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Traderlar.com',
      type: type as any,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'tr_TR',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
      creator: '@traderlarcom',
      site: '@traderlarcom',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };
}

export function generateArticleStructuredData({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  url,
}: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  url: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlar.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    image: image ? `${baseUrl}${image}` : undefined,
    url: `${baseUrl}${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Traderlar.com',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlar.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Traderlar.com',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Türkiye'nin en büyük trader topluluğu",
    sameAs: [
      'https://twitter.com/traderlarcom',
      'https://www.facebook.com/traderlarcom',
      'https://www.instagram.com/traderlarcom',
      'https://www.youtube.com/traderlarcom',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@traderlar.com',
      availableLanguage: ['Turkish', 'English'],
    },
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlar.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}