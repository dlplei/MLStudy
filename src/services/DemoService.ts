/**
 * 演示数据服务 (DemoService)
 * 
 * 模拟后端 API 行为，包含：
 * - LRU 缓存机制
 * - 结构化日志记录
 * - 模拟网络延迟
 * - 优雅降级
 * - 统一的数据契约
 * 
 * 未来接入真实后端时，只需替换 fetchDemoData 的实现，
 * 前端消费逻辑完全不变。
 */

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

// ==================== 配置 ====================

/** 模拟网络延迟范围（毫秒） */
const MIN_LATENCY_MS = 50;
const MAX_LATENCY_MS = 200;

/** 模拟超时阈值（毫秒） */
const TIMEOUT_MS = 5000;

/** 数据版本号 */
const DATA_VERSION = '2.0.0';

// ==================== 本地数据源注册表 ====================

/** 本地数据源 - 模拟后端数据库 */
const localDataSource: Record<string, DemoConfig> = {
  'kmeans': kmeansDemoConfig,
  'linear-regression': linearRegressionDemoConfig,
};

// ==================== 缓存实例 ====================

const demoCache = new LRUCache<DemoConfig>(30, 10 * 60 * 1000);

// ==================== 核心服务 ====================

class DemoService {
  /**
   * 获取演示数据（模拟 API 调用）
   * 
   * 流程：
   * 1. 生成请求 ID
   * 2. 检查缓存
   * 3. 缓存命中 → 直接返回
   * 4. 缓存未命中 → 从数据源获取
   * 5. 写入缓存
   * 6. 记录结构化日志
   */
  async fetchDemoConfig(
    algorithmId: string,
    params?: Record<string, unknown>
  ): Promise<DemoApiResponse> {
    const requestId = logger.newRequestId();
    const startTime = performance.now();
    const cacheKey = LRUCache.generateKey(algorithmId, params);

    logger.debug('DEMO_SERVICE', `Fetching demo config`, {
      algorithmId,
      cacheKey,
      requestId,
    }, requestId);

    try {
      // 模拟网络延迟
      await this.simulateLatency();

      // 检查超时
      const elapsed = performance.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        throw new Error('Request timeout');
      }

      // 检查缓存
      const cached = demoCache.get(cacheKey);
      if (cached) {
        const responseTime = performance.now() - startTime;
        logger.info('DEMO_SERVICE', `Cache HIT`, {
          algorithmId,
          cacheKey,
          responseTimeMs: Math.round(responseTime),
          requestId,
        }, requestId);

        // 记录结构化日志
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

        return {
          status: 'success',
          data: cached,
          responseTimeMs: Math.round(responseTime),
          cached: true,
          requestId,
        };
      }

      // 缓存未命中 - 从数据源获取
      logger.debug('DEMO_SERVICE', `Cache MISS, computing`, {
        algorithmId,
        cacheKey,
        requestId,
      }, requestId);

      const config = this.computeDemoConfig(algorithmId, params);

      if (!config) {
        const responseTime = performance.now() - startTime;
        logger.warn('DEMO_SERVICE', `Demo not available`, {
          algorithmId,
          requestId,
        }, requestId);

        return {
          status: 'error',
          data: null,
          error: `Demo not available for algorithm: ${algorithmId}`,
          responseTimeMs: Math.round(responseTime),
          cached: false,
          requestId,
        };
      }

      // 写入缓存
      demoCache.set(cacheKey, config);

      const responseTime = performance.now() - startTime;
      logger.info('DEMO_SERVICE', `Computed and cached`, {
        algorithmId,
        cacheKey,
        responseTimeMs: Math.round(responseTime),
        requestId,
      }, requestId);

      // 记录结构化日志
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

      return {
        status: 'success',
        data: config,
        responseTimeMs: Math.round(responseTime),
        cached: false,
        requestId,
      };
    } catch (err) {
      const responseTime = performance.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      logger.error('DEMO_SERVICE', `Request failed`, {
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

      return {
        status: 'error',
        data: null,
        error: errorMsg,
        responseTimeMs: Math.round(responseTime),
        cached: false,
        requestId,
      };
    }
  }

  /**
   * 获取单个步骤的数据（模拟按需加载 API）
   */
  async fetchStep(
    algorithmId: string,
    stepIndex: number,
    params?: Record<string, unknown>
  ): Promise<DemoApiResponse<DemoSnapshot>> {
    const configResponse = await this.fetchDemoConfig(algorithmId, params);

    if (configResponse.status !== 'success' || !configResponse.data) {
      return {
        status: configResponse.status as 'error' | 'timeout',
        data: null,
        error: configResponse.error,
        responseTimeMs: configResponse.responseTimeMs,
        cached: configResponse.cached,
        requestId: configResponse.requestId,
      };
    }

    const snapshot = configResponse.data.snapshots[stepIndex];
    if (!snapshot) {
      return {
        status: 'error',
        data: null,
        error: `Step ${stepIndex} not found`,
        responseTimeMs: configResponse.responseTimeMs,
        cached: configResponse.cached,
        requestId: configResponse.requestId,
      };
    }

    return {
      status: 'success',
      data: snapshot,
      responseTimeMs: configResponse.responseTimeMs,
      cached: configResponse.cached,
      requestId: configResponse.requestId,
    };
  }

  /**
   * 检查算法是否有可用的演示
   */
  hasDemo(algorithmId: string): boolean {
    return algorithmId in localDataSource;
  }

  /**
   * 获取所有支持演示的算法 ID 列表
   */
  getAvailableDemos(): string[] {
    return Object.keys(localDataSource);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return demoCache.getStats();
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    demoCache.clear();
    logger.info('DEMO_SERVICE', 'Cache cleared');
  }

  // ==================== 内部方法 ====================

  /**
   * 从数据源计算演示配置
   * 未来这里将替换为后端 API 调用
   */
  private computeDemoConfig(
    algorithmId: string,
    _params?: Record<string, unknown>
  ): DemoConfig | null {
    const baseConfig = localDataSource[algorithmId];
    if (!baseConfig) return null;

    // 为每个快照注入元信息（模拟后端处理）
    const enhancedSnapshots: DemoSnapshot[] = baseConfig.snapshots.map((snapshot) => ({
      ...snapshot,
      metadata: {
        generationTimeMs: Math.round(Math.random() * 50 + 10),
        source: 'compute' as const,
        cacheKey: LRUCache.generateKey(algorithmId, _params),
        version: DATA_VERSION,
      },
    }));

    return {
      ...baseConfig,
      snapshots: enhancedSnapshots,
      params: _params,
    };
  }

  /**
   * 模拟网络延迟
   */
  private simulateLatency(): Promise<void> {
    const latency = Math.floor(
      Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS) + MIN_LATENCY_MS
    );
    return new Promise((resolve) => setTimeout(resolve, latency));
  }
}

// 全局单例
export const demoService = new DemoService();
