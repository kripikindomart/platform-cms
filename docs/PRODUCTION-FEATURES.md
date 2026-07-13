# Production Features Guide

This guide covers all production-ready features included in the Premium SaaS Template.

## Table of Contents

1. [Error Handling](#error-handling)
2. [Loading States](#loading-states)
3. [SEO & Metadata](#seo--metadata)
4. [Performance Monitoring](#performance-monitoring)
5. [Best Practices](#best-practices)

---

## Error Handling

### Error Boundary Component

The Error Boundary catches React errors and displays a user-friendly fallback UI.

#### Basic Usage

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function MyApp() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

#### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h1>Custom Error Message</h1>
      <p>Something went wrong!</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

#### HOC Wrapper

```tsx
import { withErrorBoundary } from '@/components/ui/error-boundary';

const MyComponent = () => {
  return <div>Content</div>;
};

export default withErrorBoundary(MyComponent);
```

#### Features

- **Automatic Error Catching**: Catches errors in component tree
- **Fallback UI**: Beautiful error page with retry functionality
- **Development Mode**: Shows detailed error information in development
- **Error Logging**: Ready for integration with error tracking services (Sentry, LogRocket, etc.)
- **Reset Functionality**: Users can attempt to recover from errors

---

## Loading States

### Skeleton Components

Skeleton loaders provide visual feedback during data loading.

#### Basic Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton variant="text" width={200} height={20} />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rounded" className="w-full h-32" />
```

#### Skeleton Variants

- `text` - For text content (4px height with rounded corners)
- `circular` - For avatars and icons (fully rounded)
- `rectangular` - For images and blocks (no rounding)
- `rounded` - For cards and containers (rounded-xl)

#### Animation Types

```tsx
<Skeleton animation="pulse" />  {/* Default pulsing */}
<Skeleton animation="wave" />   {/* Shimmer effect */}
<Skeleton animation="none" />   {/* Static */}
```

#### Preset Components

```tsx
import { SkeletonText, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

// Text with multiple lines
<SkeletonText lines={5} />

// Card skeleton
<SkeletonCard />

// Table skeleton
<SkeletonTable rows={10} columns={5} />
```

#### Real-World Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUserData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <SkeletonCard />;
  }

  return <div>{/* Your actual content */}</div>;
}
```

---

## SEO & Metadata

### Meta Tags Component

Comprehensive SEO optimization with Open Graph and Twitter Cards.

#### Basic Usage

```tsx
import { MetaTags } from '@/components/seo/meta-tags';

export default function BlogPost() {
  return (
    <>
      <MetaTags
        title="My Blog Post"
        description="An amazing article about web development"
        keywords={['React', 'Next.js', 'Web Development']}
      />
      <article>{/* Your content */}</article>
    </>
  );
}
```

#### Full SEO Configuration

```tsx
<MetaTags
  title="Premium Product"
  description="Best product ever made"
  keywords={['product', 'premium', 'quality']}
  author="Your Company"
  
  // Open Graph
  ogTitle="Premium Product - Your Company"
  ogDescription="The best product description"
  ogImage="https://example.com/og-image.jpg"
  ogUrl="https://example.com/product"
  ogType="product"
  
  // Twitter Card
  twitterCard="summary_large_image"
  twitterSite="@yourcompany"
  twitterCreator="@creator"
  
  // Additional
  canonical="https://example.com/product"
  robots="index, follow"
  language="en"
/>
```

#### Structured Data (JSON-LD)

```tsx
import { OrganizationSchema, WebSiteSchema } from '@/components/seo/meta-tags';

// Organization Schema
<OrganizationSchema
  name="Your Company"
  url="https://example.com"
  logo="https://example.com/logo.png"
  description="Company description"
  contactPoint={{
    telephone: '+1-234-567-8900',
    contactType: 'Customer Service',
    email: 'support@example.com'
  }}
/>

// Website Schema
<WebSiteSchema
  name="Your Website"
  url="https://example.com"
  description="Website description"
  searchUrl="https://example.com/search"
/>
```

#### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Page title (appended with site name) |
| `description` | string | Page description |
| `keywords` | string[] | SEO keywords |
| `author` | string | Content author |
| `ogTitle` | string | Open Graph title (defaults to title) |
| `ogDescription` | string | Open Graph description |
| `ogImage` | string | Open Graph image URL |
| `ogUrl` | string | Canonical URL for Open Graph |
| `ogType` | string | Content type (website, article, product) |
| `twitterCard` | string | Twitter card type |
| `canonical` | string | Canonical URL |
| `robots` | string | Robot indexing directives |

---

## Performance Monitoring

### Performance Utilities

Tools for measuring and optimizing application performance.

#### Measure Function Execution

```tsx
import { measurePerformance, measurePerformanceAsync } from '@/lib/performance';

// Synchronous function
const { result, duration } = measurePerformance(
  () => expensiveCalculation(),
  'Expensive Calculation'
);

// Async function
const { result, duration } = await measurePerformanceAsync(
  () => fetchData(),
  'Data Fetch'
);
```

#### Performance Markers

```tsx
import { PerformanceMarker } from '@/lib/performance';

const marker = new PerformanceMarker();

marker.mark('start-render');
// ... rendering logic
marker.mark('end-render');

const duration = marker.measure('render-time', 'start-render', 'end-render');
```

#### Web Vitals

```tsx
import { getWebVitals, logWebVitals } from '@/lib/performance';

// Get vitals programmatically
const vitals = await getWebVitals();
console.log('LCP:', vitals.LCP);
console.log('FID:', vitals.FID);
console.log('CLS:', vitals.CLS);

// Or log all vitals
await logWebVitals();
```

#### Page Load Metrics

```tsx
import { getPageLoadMetrics } from '@/lib/performance';

const metrics = getPageLoadMetrics();
console.log('DNS Lookup:', metrics.dns, 'ms');
console.log('TCP Connection:', metrics.tcp, 'ms');
console.log('TTFB:', metrics.ttfb, 'ms');
console.log('Total Time:', metrics.totalTime, 'ms');
```

#### Resource Analysis

```tsx
import { analyzeSlowResources, estimateBundleSize } from '@/lib/performance';

// Find slow-loading resources
const slowResources = analyzeSlowResources(1000); // >1000ms
slowResources.forEach((resource) => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// Estimate bundle sizes
const sizes = estimateBundleSize();
console.log('JavaScript:', sizes.js, 'bytes');
console.log('CSS:', sizes.css, 'bytes');
console.log('Images:', sizes.images, 'bytes');
```

#### Complete Performance Report

```tsx
import { generatePerformanceReport } from '@/lib/performance';

// Generate comprehensive report in console
await generatePerformanceReport();
```

#### Memory Usage (Chrome/Edge)

```tsx
import { getMemoryUsage } from '@/lib/performance';

const memory = getMemoryUsage();
if (memory) {
  console.log('Used:', memory.usedJSHeapSize);
  console.log('Total:', memory.totalJSHeapSize);
  console.log('Limit:', memory.jsHeapSizeLimit);
  console.log('Usage:', memory.usedPercent.toFixed(2), '%');
}
```

---

## Best Practices

### Error Handling Best Practices

1. **Wrap Root Component**: Place Error Boundary at the app root
2. **Strategic Placement**: Add boundaries around critical sections
3. **Custom Fallbacks**: Provide context-specific error messages
4. **Error Logging**: Integrate with error tracking services
5. **User Recovery**: Always provide a way to recover or go back

```tsx
// Good - Strategic placement
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <Header />
          <ErrorBoundary fallback={<ErrorPage />}>
            <main>{children}</main>
          </ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Loading States Best Practices

1. **Match Layout**: Skeleton should match the actual content layout
2. **Consistent Heights**: Use consistent heights for better UX
3. **Smooth Transitions**: Use fade-in animations when content loads
4. **Avoid Layout Shift**: Reserve space to prevent CLS
5. **Progressive Loading**: Show content as it becomes available

```tsx
// Good - Progressive loading
export default function Dashboard() {
  const { data: user, loading: userLoading } = useUser();
  const { data: stats, loading: statsLoading } = useStats();

  return (
    <div>
      {userLoading ? <SkeletonCard /> : <UserCard user={user} />}
      {statsLoading ? <SkeletonCard /> : <StatsCard stats={stats} />}
    </div>
  );
}
```

### SEO Best Practices

1. **Unique Titles**: Every page should have a unique, descriptive title
2. **Quality Descriptions**: Write compelling 150-160 character descriptions
3. **Relevant Keywords**: Use natural, relevant keywords (avoid stuffing)
4. **Open Graph Images**: Always provide high-quality OG images (1200x630px)
5. **Structured Data**: Add JSON-LD for rich search results
6. **Canonical URLs**: Use canonical tags to prevent duplicate content

```tsx
// Good - Comprehensive SEO
export default function ProductPage({ product }) {
  return (
    <>
      <MetaTags
        title={product.name}
        description={product.description.substring(0, 160)}
        keywords={product.tags}
        ogImage={product.image}
        ogType="product"
        canonical={`https://example.com/products/${product.slug}`}
      />
      <StructuredData
        type="Product"
        data={{
          name: product.name,
          description: product.description,
          image: product.image,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD'
          }
        }}
      />
      {/* Product content */}
    </>
  );
}
```

### Performance Best Practices

1. **Monitor in Production**: Track real user metrics
2. **Set Budgets**: Define performance budgets and monitor them
3. **Lazy Load**: Use code splitting and lazy loading
4. **Optimize Images**: Use WebP, proper sizing, and lazy loading
5. **Cache Strategies**: Implement proper caching headers
6. **Bundle Analysis**: Regular bundle size audits

```tsx
// Good - Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <SkeletonCard />,
  ssr: false // Client-side only if needed
});
```

### Performance Metrics Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5-4s | >4s |
| **FID** (First Input Delay) | ≤100ms | 100-300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1-0.25 | >0.25 |
| **TTFB** (Time to First Byte) | ≤800ms | 800-1800ms | >1800ms |
| **FCP** (First Contentful Paint) | ≤1.8s | 1.8-3s | >3s |

---

## Integration Examples

### Complete Page Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SkeletonCard } from '@/components/ui/skeleton';
import { MetaTags } from '@/components/seo/meta-tags';
import { measurePerformanceAsync } from '@/lib/performance';

function ProductContent({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      const { result, duration } = await measurePerformanceAsync(
        () => fetch(`/api/products/${id}`).then(r => r.json()),
        'Product Load'
      );
      
      setProduct(result);
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <>
      <MetaTags
        title={product.name}
        description={product.description}
        ogImage={product.image}
        ogType="product"
      />
      <div>{/* Product details */}</div>
    </>
  );
}

export default function ProductPage({ params }) {
  return (
    <ErrorBoundary>
      <ProductContent id={params.id} />
    </ErrorBoundary>
  );
}
```

---

## Next Steps

- **Error Tracking**: Integrate Sentry or LogRocket for production error monitoring
- **Analytics**: Add Google Analytics or Plausible for user metrics
- **A/B Testing**: Implement feature flags and A/B testing
- **Monitoring**: Set up uptime monitoring and performance alerts
- **CDN**: Use Vercel Edge or Cloudflare for global performance

---

## Support

For questions or issues with production features, check the main documentation or open an issue in the repository.
