import { LRUCache } from './LRUCache';
import { logger } from './Logger';
import {
  DemoConfig,
  DemoApiResponse,
  DemoSnapshot,
} from '../types/demo';
import {
  kmeansDemoConfig,
  linearRegressionDemoConfig,
} from '../data/demos';

const MIN_LATENCY_MS = 50;
const MAX_LATENCY_MS = 200;
const TIMEOUT_MS = 5000;
const DATA_VERSION = '3.0.0';

const localDataSource: Record<string, DemoConfig> = {
  'kmeans': kmeansDemoConfig,
  'linear-regression': linearRegressionDemoConfig,
};

const demoCache = new LRUCache<DemoConfig>(30, 10 * 60 * 1000);

class DemoService {
  async fetchDemoConfig(
    algorithmId: string,
    params?: Record<string, unknown>
  ): Promise<DemoApiResponse> {
    const requestId = logger.newRequestId();
    const startTime = performance.now();
    const cacheKey = LRUCache.generateKey(algorithmId, params);

    logger.debug('DEMO_SERVICE', 'Fetching demo config', {
      algorithmId,
      cacheKey,
      requestId,
    }, requestId);

    try {
      await this.simulateLatency();

      const elapsed = performance.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        throw new Error('Request timeout');
      }

      const cached = demoCache.get(cacheKey);
      if (cached) {
        const responseTime = performance.now() - startTime;
        logger.info('DEMO_SERVICE', 'Cache HIT', {
          algorithmId,
          cacheKey,
          responseTimeMs: Math.round(responseTime),
          requestId,
        }, requestId);

        logger.logDemoRequest({
          algorithm_name: algorithmId,
          parameters: params || {},
          execution_time_ms: Math.round(responseTime),
          source: 'cache',
          cache_hit: true,
          cache_key: cacheKey,
          request_id: requestId,
          total_steps: cached.totalSteps,
        });

        const response: DemoApiResponse = {
          status: 'success',
          result: cached,
          responseTimeMs: Math.round(responseTime),
          cached: true,
          requestId,
        };
        return response;
      }

      logger.debug('DEMO_SERVICE', 'Cache MISS, computing', {
        algorithmId,
        cacheKey,
        requestId,
      }, requestId);

      const config = this.computeDemoConfig(algorithmId, params);

      if (!config) {
        const responseTime = performance.now() - startTime;
        logger.warn('DEMO_SERVICE', 'Demo not available', {
          algorithmId,
          requestId,
        }, requestId);

        const response: DemoApiResponse = {
          status: 'error',
          result: null,
          error: 'Demo not available for algorithm: ' + algorithmId,
          responseTimeMs: Math.round(responseTime),
          cached: false,
          requestId,
        };
        return response;
      }

      demoCache.set(cacheKey, config);

      const responseTime = performance.now() - startTime;
      logger.info('DEMO_SERVICE', 'Computed and cached', {
        algorithmId,
        cacheKey,
        responseTimeMs: Math.round(responseTime),
        requestId,
      }, requestId);

      logger.logDemoRequest({
        algorithm_name: algorithmId,
        parameters: params || {},
        execution_time_ms: Math.round(responseTime),
        source: 'compute',
        cache_hit: false,
        cache_key: cacheKey,
        request_id: requestId,
        total_steps: config.totalSteps,
      });

      const response: DemoApiResponse = {
        status: 'success',
        result: config,
        responseTimeMs: Math.round(responseTime),
        cached: false,
        requestId,
      };
      return response;
    } catch (err) {
      const responseTime = performance.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      logger.error('DEMO_SERVICE', 'Request failed', {
        algorithmId,
        error: errorMsg,
        responseTimeMs: Math.round(responseTime),
        requestId,
      }, requestId);

      logger.logDemoRequest({
        algorithm_name: algorithmId,
        parameters: params || {},
        execution_time_ms: Math.round(responseTime),
        source: 'compute',
        cache_hit: false,
        cache_key: cacheKey,
        request_id: requestId,
        total_steps: 0,
        error: errorMsg,
      });

      const response: DemoApiResponse = {
        status: 'error',
        result: null,
        error: errorMsg,
        responseTimeMs: Math.round(responseTime),
        cached: false,
        requestId,
      };
      return response;
    }
  }

  async fetchStep(
    algorithmId: string,
    stepIndex: number,
    params?: Record<string, unknown>
  ): Promise<DemoApiResponse<DemoSnapshot>> {
    const configResponse = await this.fetchDemoConfig(algorithmId, params);

    if (configResponse.status !== 'success' || !configResponse.result) {
      const response: DemoApiResponse<DemoSnapshot> = {
        status: configResponse.status as 'error' | 'timeout',
        result: null,
        error: configResponse.error,
        responseTimeMs: configResponse.responseTimeMs,
        cached: configResponse.cached,
        requestId: configResponse.requestId,
      };
      return response;
    }

    const snapshot = configResponse.result.snapshots[stepIndex];
    if (!snapshot) {
      const response: DemoApiResponse<DemoSnapshot> = {
        status: 'error',
        result: null,
        error: 'Step ' + stepIndex + ' not found',
        responseTimeMs: configResponse.responseTimeMs,
        cached: configResponse.cached,
        requestId: configResponse.requestId,
      };
      return response;
    }

    const response: DemoApiResponse<DemoSnapshot> = {
      status: 'success',
      result: snapshot,
      responseTimeMs: configResponse.responseTimeMs,
      cached: configResponse.cached,
      requestId: configResponse.requestId,
    };
    return response;
  }

  hasDemo(algorithmId: string): boolean {
    return algorithmId in localDataSource;
  }

  getAvailableDemos(): string[] {
    return Object.keys(localDataSource);
  }

  getCacheStats() {
    return demoCache.getStats();
  }

  clearCache(): void {
    demoCache.clear();
    logger.info('DEMO_SERVICE', 'Cache cleared');
  }

  updateConfigInCache(algorithmId: string, config: DemoConfig): void {
    const cacheKey = LRUCache.generateKey(algorithmId, config.params);
    demoCache.set(cacheKey, config);
    logger.info('DEMO_SERVICE', 'Config updated in cache', { algorithmId });
  }

  private computeDemoConfig(
    algorithmId: string,
    _params?: Record<string, unknown>
  ): DemoConfig | null {
    const baseConfig = localDataSource[algorithmId];
    if (!baseConfig) return null;

    const enhancedSnapshots: DemoSnapshot[] = baseConfig.snapshots.map((snapshot) => {
      const enhanced: DemoSnapshot = {
        ...snapshot,
        stepMeta: {
          generationTimeMs: Math.round(Math.random() * 50 + 10),
          source: 'compute',
          cacheKey: LRUCache.generateKey(algorithmId, _params),
          version: DATA_VERSION,
          explanationSource: 'preset',
        },
      };
      return enhanced;
    });

    const config: DemoConfig = {
      ...baseConfig,
      snapshots: enhancedSnapshots,
      params: _params,
    };
    return config;
  }

  private simulateLatency(): Promise<void> {
    const latency = Math.floor(
      Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS) + MIN_LATENCY_MS
    );
    return new Promise((resolve) => setTimeout(resolve, latency));
  }
}

export const demoService = new DemoService();
