import Head from 'next/head';

/**
 * SEO Meta Tags Component
 * Manage page metadata for better SEO
 */

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  robots?: string;
  language?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaultMetadata = {
  title: 'Premium SaaS Template',
  description: 'Production-ready SaaS template with authentication, multi-tenancy, and modern UI components',
  keywords: ['SaaS', 'Template', 'Next.js', 'React', 'TypeScript', 'Tailwind'],
  author: 'Premium SaaS',
  ogType: 'website' as const,
  twitterCard: 'summary_large_image' as const,
  language: 'en',
  robots: 'index, follow',
};

export function MetaTags(props: MetaTagsProps) {
  const meta = { ...defaultMetadata, ...props };

  const fullTitle = meta.title
    ? `${meta.title} | Premium SaaS Template`
    : defaultMetadata.title;

  const ogTitle = meta.ogTitle || meta.title || defaultMetadata.title;
  const ogDescription = meta.ogDescription || meta.description;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && meta.keywords.length > 0 && (
        <meta name="keywords" content={meta.keywords.join(', ')} />
      )}
      <meta name="author" content={meta.author} />
      <meta name="robots" content={meta.robots} />
      <meta httpEquiv="Content-Language" content={meta.language} />

      {/* Canonical URL */}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle} />
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}
      {meta.ogUrl && <meta property="og:url" content={meta.ogUrl} />}
      <meta property="og:type" content={meta.ogType} />
      <meta property="og:site_name" content="Premium SaaS Template" />
      <meta property="og:locale" content={meta.language === 'en' ? 'en_US' : meta.language} />

      {/* Article specific tags */}
      {meta.ogType === 'article' && (
        <>
          {meta.publishedTime && (
            <meta property="article:published_time" content={meta.publishedTime} />
          )}
          {meta.modifiedTime && (
            <meta property="article:modified_time" content={meta.modifiedTime} />
          )}
          {meta.author && <meta property="article:author" content={meta.author} />}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={meta.twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {meta.ogImage && <meta name="twitter:image" content={meta.ogImage} />}
      {meta.twitterSite && <meta name="twitter:site" content={meta.twitterSite} />}
      {meta.twitterCreator && <meta name="twitter:creator" content={meta.twitterCreator} />}

      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#6366f1" />

      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Head>
  );
}

/**
 * JSON-LD Structured Data Component
 * For rich search results
 */
export interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'Product' | 'BreadcrumbList';
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

/**
 * Generate Organization structured data
 */
export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  contactPoint,
}: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
}) {
  return (
    <StructuredData
      type="Organization"
      data={{
        name,
        url,
        logo,
        description,
        contactPoint,
      }}
    />
  );
}

/**
 * Generate WebSite structured data
 */
export function WebSiteSchema({
  name,
  url,
  description,
  searchUrl,
}: {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}) {
  const data: Record<string, any> = {
    name,
    url,
    description,
  };

  if (searchUrl) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return <StructuredData type="WebSite" data={data} />;
}
