import { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const { name, value, rating } = metric;
    
    // Color code based on rating
    const color = rating === 'good' ? '\x1b[32m' : rating === 'needs-improvement' ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    // Only log important metrics in dev
    if (['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'].includes(name)) {
      console.log(`${color}[Web Vitals] ${name}: ${value.toFixed(2)} (${rating})${reset}`);
    }
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    // Example: Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
    
    // Or send to custom endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value: metric.value,
          rating: metric.rating,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silent fail - don't break the app for analytics
      });
    }
  }
}

// Performance observer for custom metrics
export function observePerformance() {
  if (typeof window === 'undefined') return;
  
  // Observe long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Long task detected (> 50ms)
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Unsupported browser
    }
  }
  
  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) {
            // Slow resource loading (> 1s)
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Performance] Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Unsupported browser
    }
  }
}

// Helper to measure component render time
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development' && duration > 16) {
      // Render took more than one frame (16ms)
      console.warn(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  };
}

// Lazy load images with Intersection Observer
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  const images = document.querySelectorAll('img[data-lazy]');
  
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );
  
  images.forEach((img) => imageObserver.observe(img));
}

// Prefetch critical resources
export function prefetchCriticalResources() {
  if (typeof window === 'undefined') return;
  
  // Prefetch critical API endpoints
  const criticalEndpoints = [
    '/api/strategies?limit=4',
    '/api/forum/topics?limit=3',
  ];
  
  criticalEndpoints.forEach((endpoint) => {
    if ('link' in document.createElement('link')) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    }
  });
  
  // Preconnect to external domains
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://images.unsplash.com',
    'https://api.dicebear.com',
  ];
  
  externalDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
}