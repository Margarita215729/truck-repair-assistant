/**
 * Performance Monitoring Service
 * 
 * Tracks application performance metrics for optimization and monitoring.
 * Designed for mobile-first truck driver experience with <2s load targets.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'load' | 'api' | 'render' | 'interaction';
  metadata?: Record<string, any>;
}

interface PerformanceBudget {
  category: string;
  threshold: number;
  warning: number;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private budgets: PerformanceBudget[] = [
    { category: 'load', threshold: 2000, warning: 1500 }, // 2s target
    { category: 'api', threshold: 5000, warning: 3000 },   // 5s max API
    { category: 'render', threshold: 100, warning: 50 },   // 100ms render
    { category: 'interaction', threshold: 50, warning: 30 } // 50ms interaction
  ];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.setupPerformanceObservers();
    }
  }

  // Core Web Vitals monitoring
  private initializeWebVitals(): void {
    // First Contentful Paint (FCP)
    this.observeMetric('first-contentful-paint', (entry) => {
      this.recordMetric('FCP', entry.startTime, 'load', {
        entryType: entry.entryType,
        url: window.location.href
      });
    });

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.recordMetric('LCP', entry.startTime, 'load', {
        element: entry.element?.tagName,
        url: entry.url
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value, 'render', {
          sources: entry.sources?.length || 0
        });
      }
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entry) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime, 'interaction', {
        eventType: entry.name,
        target: entry.target?.tagName
      });
    });
  }

  private observeMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer not supported for ${type}:`, error);
    }
  }

  private setupPerformanceObservers(): void {
    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.recordMetric('DOM_Content_Loaded', navigation.domContentLoadedEventEnd - navigation.startTime, 'load');
      this.recordMetric('Page_Load', navigation.loadEventEnd - navigation.startTime, 'load');
      this.recordMetric('DNS_Lookup', navigation.domainLookupEnd - navigation.domainLookupStart, 'load');
      this.recordMetric('TCP_Connection', navigation.connectEnd - navigation.connectStart, 'load');
      this.recordMetric('Server_Response', navigation.responseEnd - navigation.requestStart, 'api');
    });

    // Resource timing
    this.observeMetric('resource', (entry: PerformanceResourceTiming) => {
      const category = this.categorizeResource(entry.name);
      this.recordMetric(`Resource_${category}`, entry.duration, 'load', {
        name: entry.name,
        size: entry.transferSize,
        cached: entry.transferSize === 0
      });
    });
  }

  private categorizeResource(url: string): string {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'Image';
    if (url.includes('api/') || url.includes('/api')) return 'API';
    return 'Other';
  }

  // Public API
  recordMetric(name: string, value: number, category: PerformanceMetric['category'], metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
      metadata
    };

    this.metrics.push(metric);
    this.checkBudget(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance issues
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true') {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`, metadata);
    }
  }

  private checkBudget(metric: PerformanceMetric): void {
    const budget = this.budgets.find(b => b.category === metric.category);
    if (!budget) return;

    if (metric.value > budget.threshold) {
      console.error(`🚨 Performance Budget Exceeded: ${metric.name} (${metric.value.toFixed(2)}ms > ${budget.threshold}ms)`);
    } else if (metric.value > budget.warning) {
      console.warn(`⚠️ Performance Warning: ${metric.name} (${metric.value.toFixed(2)}ms > ${budget.warning}ms)`);
    }
  }

  // Analytics
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    const groupedMetrics = this.groupMetricsByName();
    
    for (const [name, values] of Object.entries(groupedMetrics)) {
      summary[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }
    
    return summary;
  }

  private groupMetricsByName(): Record<string, number[]> {
    const grouped: Record<string, number[]> = {};
    
    for (const metric of this.metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric.value);
    }
    
    return grouped;
  }

  getCoreWebVitals(): { fcp?: number; lcp?: number; fid?: number; cls?: number } {
    const latest = (name: string) => {
      const metrics = this.metrics.filter(m => m.name === name);
      return metrics.length > 0 ? metrics[metrics.length - 1].value : undefined;
    };

    return {
      fcp: latest('FCP'),
      lcp: latest('LCP'),
      fid: latest('FID'),
      cls: latest('CLS')
    };
  }

  // Mobile-specific optimizations
  measureTouchResponsiveness(element: Element, eventType: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(`Touch_${eventType}`, duration, 'interaction', {
        element: element.tagName,
        className: element.className
      });
    };
  }

  measureAPICall(name: string): (success: boolean, metadata?: Record<string, any>) => void {
    const startTime = performance.now();
    
    return (success: boolean, metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.recordMetric(`API_${name}`, duration, 'api', {
        success,
        ...metadata
      });
    };
  }

  // Cleanup
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();
export default performanceMonitoring;