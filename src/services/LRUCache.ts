/**
 * LRU (Least Recently Used) 缓存实现
 * 
 * 用于缓存演示数据，避免对相同请求的重复计算。
 * 缓存 Key 格式: "algorithmId:param1=val1:param2=val2"
 * 
 * 设计说明：
 * - 使用 Map 数据结构，利用其插入顺序特性实现 LRU
 * - 每次访问（get）都将条目移到末尾（最新）
 * - 超出容量时淘汰最久未使用的条目（Map 的第一个条目）
 * - 时间复杂度: get/set 均为 O(1)
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  /** 缓存命中次数 */
  hitCount: number;
  /** 数据大小（字节，用于内存估算） */
  sizeBytes: number;
}

export interface CacheStats {
  /** 总请求数 */
  totalRequests: number;
  /** 缓存命中数 */
  hits: number;
  /** 缓存未命中数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
  /** 当前缓存条目数 */
  size: number;
  /** 最大容量 */
  capacity: number;
  /** 淘汰次数 */
  evictions: number;
  /** 估算内存占用（字节） */
  estimatedMemoryBytes: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly capacity: number;
  private readonly ttlMs: number;
  private stats: { hits: number; misses: number; evictions: number };

  /**
   * @param capacity 最大缓存条目数
   * @param ttlMs 缓存过期时间（毫秒），默认 5 分钟
   */
  constructor(capacity: number = 50, ttlMs: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.capacity = capacity;
    this.ttlMs = ttlMs;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * 生成缓存 Key
   * 格式: "algorithmId:param1=val1:param2=val2"
   */
  static generateKey(algorithmId: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return algorithmId;
    }
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(':');
    return `${algorithmId}:${paramStr}`;
  }

  /**
   * 获取缓存条目
   * 命中时将条目移到末尾（标记为最近使用）
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // 移到末尾（最近使用）
    this.cache.delete(key);
    entry.hitCount++;
    this.cache.set(key, entry);
    this.stats.hits++;

    return entry.value;
  }

  /**
   * 设置缓存条目
   * 超出容量时淘汰最久未使用的条目
   */
  set(key: string, value: T): void {
    // 如果已存在，先删除旧条目
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 估算数据大小
    const sizeBytes = this.estimateSize(value);

    // 淘汰策略
    while (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hitCount: 0,
      sizeBytes,
    });
  }

  /** 检查缓存是否存在且未过期 */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /** 清除所有缓存 */
  clear(): void {
    this.cache.clear();
  }

  /** 获取缓存统计信息 */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    let estimatedMemoryBytes = 0;
    this.cache.forEach((entry) => {
      estimatedMemoryBytes += entry.sizeBytes;
    });

    return {
      totalRequests,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      size: this.cache.size,
      capacity: this.capacity,
      evictions: this.stats.evictions,
      estimatedMemoryBytes,
    };
  }

  /** 删除指定条目 */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** 估算数据大小（简单实现） */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // UTF-16 每字符2字节
    } catch {
      return 1024; // 默认 1KB
    }
  }
}
