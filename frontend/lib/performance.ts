/**
 * Performance Monitoring Utilities
 * Track and measure application performance
 */

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Measure async function execution time
 */
export async function measurePerformanceAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Performance marker for custom timing
 */
export class PerformanceMarker {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`[Performance] Start mark "${startMark}" not found`);
      return 0;
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !end) {
      console.warn(`[Performance] End mark "${endMark}" not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;

    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
    } catch (error) {
      // Ignore if marks don't exist in performance timeline
    }

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  clear(): void {
    this.marks.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Web Vitals monitoring
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function getWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {};

    // Get navigation timing
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        vitals.TTFB = perfData.responseStart - perfData.requestStart;
      }
    }

    // Use Performance Observer for other metrics
    if ('PerformanceObserver' in window) {
      // FCP
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
              fcpObserver.disconnect();
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Ignore if not supported
      }

      // LCP
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Ignore if not supported
      }

      // FID
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            vitals.FID = (entry as any).processingStart - entry.startTime;
            fidObserver.disconnect();
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Ignore if not supported
      }

      // CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              vitals.CLS = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Ignore if not supported
      }
    }

    // Return vitals after a delay to allow measurements
    setTimeout(() => resolve(vitals), 3000);
  });
}

/**
 * Log web vitals to console
 */
export async function logWebVitals(): Promise<void> {
  const vitals = await getWebVitals();
  console.group('[Web Vitals]');
  console.log('TTFB (Time to First Byte):', vitals.TTFB?.toFixed(2), 'ms');
  console.log('FCP (First Contentful Paint):', vitals.FCP?.toFixed(2), 'ms');
  console.log('LCP (Largest Contentful Paint):', vitals.LCP?.toFixed(2), 'ms');
  console.log('FID (First Input Delay):', vitals.FID?.toFixed(2), 'ms');
  console.log('CLS (Cumulative Layout Shift):', vitals.CLS?.toFixed(4));
  console.groupEnd();
}

/**
 * Resource timing analysis
 */
export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
}

export function getResourceTimings(): ResourceTiming[] {
  if (!('performance' in window)) return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map((resource) => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize || 0,
  }));
}

/**
 * Analyze slow resources
 */
export function analyzeSlowResources(threshold = 1000): ResourceTiming[] {
  const timings = getResourceTimings();
  return timings
    .filter((resource) => resource.duration > threshold)
    .sort((a, b) => b.duration - a.duration);
}

/**
 * Get total page load metrics
 */
export function getPageLoadMetrics() {
  if (!('performance' in window)) return null;

  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!perfData) return null;

  return {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    ttfb: perfData.responseStart - perfData.requestStart,
    download: perfData.responseEnd - perfData.responseStart,
    domProcessing: perfData.domComplete - perfData.domInteractive,
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
    totalTime: perfData.loadEventEnd - perfData.fetchStart,
  };
}

/**
 * Monitor bundle sizes (client-side estimation)
 */
export function estimateBundleSize(): { js: number; css: number; images: number; total: number } {
  const resources = getResourceTimings();
  
  const sizes = {
    js: 0,
    css: 0,
    images: 0,
    total: 0,
  };

  resources.forEach((resource) => {
    sizes.total += resource.size;

    if (resource.type === 'script') {
      sizes.js += resource.size;
    } else if (resource.type === 'link' || resource.name.endsWith('.css')) {
      sizes.css += resource.size;
    } else if (['img', 'image'].includes(resource.type) || /\.(jpg|jpeg|png|gif|svg|webp)/.test(resource.name)) {
      sizes.images += resource.size;
    }
  });

  return sizes;
}

/**
 * Memory usage monitoring (Chrome/Edge only)
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

/**
 * Complete performance report
 */
export async function generatePerformanceReport() {
  console.group('📊 Performance Report');
  
  // Web Vitals
  const vitals = await getWebVitals();
  console.group('Web Vitals');
  console.table(vitals);
  console.groupEnd();
  
  // Page Load Metrics
  const pageLoad = getPageLoadMetrics();
  if (pageLoad) {
    console.group('Page Load Metrics (ms)');
    console.table(pageLoad);
    console.groupEnd();
  }
  
  // Bundle Sizes
  const bundleSize = estimateBundleSize();
  console.group('Bundle Sizes (bytes)');
  console.table(bundleSize);
  console.groupEnd();
  
  // Slow Resources
  const slowResources = analyzeSlowResources(500);
  if (slowResources.length > 0) {
    console.group('⚠️ Slow Resources (>500ms)');
    console.table(slowResources);
    console.groupEnd();
  }
  
  // Memory Usage
  const memory = getMemoryUsage();
  if (memory) {
    console.group('Memory Usage');
    console.table(memory);
    console.groupEnd();
  }
  
  console.groupEnd();
}
