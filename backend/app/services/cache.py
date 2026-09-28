"""
LRU 缓存实现
"""
import time
import json
from typing import Any, Dict, Generic, Optional, TypeVar
from collections import OrderedDict
from app.config import settings

T = TypeVar('T')


class CacheEntry(Generic[T]):
    """缓存条目"""
    def __init__(self, value: T, timestamp: float, hit_count: int = 0):
        self.value = value
        self.timestamp = timestamp
        self.hit_count = hit_count
        self.size_bytes = len(json.dumps(value).encode('utf-8')) if value else 0


class LRUCache(Generic[T]):
    """
    LRU (最近最少使用) 缓存
    
    特性：
    - O(1) 时间复杂度的 get/set 操作
    - 基于 OrderedDict 实现
    - 支持 TTL 过期
    - 缓存统计信息
    """
    
    def __init__(self, capacity: int = None, ttl_seconds: int = None):
        self.capacity = capacity or settings.CACHE_MAX_SIZE
        self.ttl_seconds = ttl_seconds or settings.CACHE_TTL
        self.cache: OrderedDict[str, CacheEntry[T]] = OrderedDict()
        self.stats = {
            'hits': 0,
            'misses': 0,
            'evictions': 0,
            'total_requests': 0
        }
    
    @staticmethod
    def generate_key(algorithm_id: str, params: Optional[Dict[str, Any]] = None) -> str:
        """生成缓存 Key"""
        if not params:
            return algorithm_id
        
        # 参数排序确保一致性
        param_str = ':'.join(
            f'{k}={v}' for k, v in sorted(params.items())
        )
        return f'{algorithm_id}:{param_str}'
    
    def get(self, key: str) -> Optional[T]:
        """获取缓存条目"""
        self.stats['total_requests'] += 1
        
        if key not in self.cache:
            self.stats['misses'] += 1
            return None
        
        entry = self.cache[key]
        
        # 检查是否过期
        if time.time() - entry.timestamp > self.ttl_seconds:
            del self.cache[key]
            self.stats['misses'] += 1
            return None
        
        # 移到末尾（最近使用）
        self.cache.move_to_end(key)
        entry.hit_count += 1
        self.stats['hits'] += 1
        
        return entry.value
    
    def set(self, key: str, value: T) -> None:
        """设置缓存条目"""
        if key in self.cache:
            del self.cache[key]
        
        # 淘汰策略
        while len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)  # 移除最久未使用的
            self.stats['evictions'] += 1
        
        self.cache[key] = CacheEntry(value, time.time())
    
    def has(self, key: str) -> bool:
        """检查缓存是否存在且未过期"""
        if key not in self.cache:
            return False
        
        entry = self.cache[key]
        if time.time() - entry.timestamp > self.ttl_seconds:
            del self.cache[key]
            return False
        
        return True
    
    def clear(self) -> None:
        """清除所有缓存"""
        self.cache.clear()
    
    def delete(self, key: str) -> bool:
        """删除指定条目"""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        total_requests = self.stats['hits'] + self.stats['misses']
        estimated_memory = sum(entry.size_bytes for entry in self.cache.values())
        
        return {
            'total_requests': total_requests,
            'hits': self.stats['hits'],
            'misses': self.stats['misses'],
            'hit_rate': self.stats['hits'] / total_requests if total_requests > 0 else 0,
            'size': len(self.cache),
            'capacity': self.capacity,
            'evictions': self.stats['evictions'],
            'estimated_memory_bytes': estimated_memory
        }


# 全局缓存实例
demo_cache = LRUCache[Dict]()
llm_cache = LRUCache[str]()
