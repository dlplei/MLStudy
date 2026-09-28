"""
演示数据服务
"""
import time
import random
import uuid
from typing import Any, Dict, Optional
from app.config import settings
from app.services.cache import demo_cache
from app.utils.logger import logger
from app.data.demos import LOCAL_DATA_SOURCE


DATA_VERSION = "3.0.0"


class DemoService:
    """演示数据服务类"""
    
    @staticmethod
    def _generate_request_id() -> str:
        """生成请求 ID"""
        return f"req_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
    
    async def fetch_demo_config(
        self,
        algorithm_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        获取演示配置
        
        Args:
            algorithm_id: 算法 ID
            params: 演示参数（可选）
        
        Returns:
            API 响应字典
        """
        request_id = self._generate_request_id()
        start_time = time.time()
        cache_key = demo_cache.generate_key(algorithm_id, params)
        
        logger.debug('DEMO_SERVICE', 'Fetching demo config', {
            'algorithm_id': algorithm_id,
            'cache_key': cache_key,
            'request_id': request_id
        }, request_id)
        
        try:
            # 模拟网络延迟
            await self._simulate_latency()
            
            elapsed = time.time() - start_time
            if elapsed > 5.0:  # 5秒超时
                raise Exception('Request timeout')
            
            # 检查缓存
            cached = demo_cache.get(cache_key)
            if cached:
                response_time = int((time.time() - start_time) * 1000)
                logger.info('DEMO_SERVICE', 'Cache HIT', {
                    'algorithm_id': algorithm_id,
                    'cache_key': cache_key,
                    'response_time_ms': response_time,
                    'request_id': request_id
                }, request_id)
                
                self._log_demo_request({
                    'algorithm_name': algorithm_id,
                    'parameters': params or {},
                    'execution_time_ms': response_time,
                    'source': 'cache',
                    'cache_hit': True,
                    'cache_key': cache_key,
                    'request_id': request_id,
                    'total_steps': cached['totalSteps']
                })
                
                return {
                    'status': 'success',
                    'result': cached,
                    'responseTimeMs': response_time,
                    'cached': True,
                    'requestId': request_id
                }
            
            # 缓存未命中
            logger.debug('DEMO_SERVICE', 'Cache MISS, computing', {
                'algorithm_id': algorithm_id,
                'cache_key': cache_key,
                'request_id': request_id
            }, request_id)
            
            config = self._compute_demo_config(algorithm_id, params)
            
            if not config:
                response_time = int((time.time() - start_time) * 1000)
                logger.warning('DEMO_SERVICE', 'Demo not available', {
                    'algorithm_id': algorithm_id,
                    'request_id': request_id
                }, request_id)
                
                return {
                    'status': 'error',
                    'result': None,
                    'error': f'Demo not available for algorithm: {algorithm_id}',
                    'responseTimeMs': response_time,
                    'cached': False,
                    'requestId': request_id
                }
            
            # 写入缓存
            demo_cache.set(cache_key, config)
            
            response_time = int((time.time() - start_time) * 1000)
            logger.info('DEMO_SERVICE', 'Computed and cached', {
                'algorithm_id': algorithm_id,
                'cache_key': cache_key,
                'response_time_ms': response_time,
                'request_id': request_id
            }, request_id)
            
            self._log_demo_request({
                'algorithm_name': algorithm_id,
                'parameters': params or {},
                'execution_time_ms': response_time,
                'source': 'compute',
                'cache_hit': False,
                'cache_key': cache_key,
                'request_id': request_id,
                'total_steps': config['totalSteps']
            })
            
            return {
                'status': 'success',
                'result': config,
                'responseTimeMs': response_time,
                'cached': False,
                'requestId': request_id
            }
        
        except Exception as e:
            response_time = int((time.time() - start_time) * 1000)
            error_msg = str(e)
            
            logger.error('DEMO_SERVICE', 'Request failed', {
                'algorithm_id': algorithm_id,
                'error': error_msg,
                'response_time_ms': response_time,
                'request_id': request_id
            }, request_id)
            
            return {
                'status': 'error',
                'result': None,
                'error': error_msg,
                'responseTimeMs': response_time,
                'cached': False,
                'requestId': request_id
            }
    
    def has_demo(self, algorithm_id: str) -> bool:
        """检查算法是否有可用的演示"""
        return algorithm_id in LOCAL_DATA_SOURCE
    
    def get_available_demos(self) -> list:
        """获取所有支持演示的算法 ID 列表"""
        return list(LOCAL_DATA_SOURCE.keys())
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        return demo_cache.get_stats()
    
    def clear_cache(self):
        """清除缓存"""
        demo_cache.clear()
        logger.info('DEMO_SERVICE', 'Cache cleared')
    
    def update_config_in_cache(self, algorithm_id: str, config: Dict[str, Any]):
        """更新缓存中的配置"""
        cache_key = demo_cache.generate_key(algorithm_id, config.get('params'))
        demo_cache.set(cache_key, config)
        logger.info('DEMO_SERVICE', 'Config updated in cache', {'algorithm_id': algorithm_id})
    
    def _compute_demo_config(
        self,
        algorithm_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """计算演示配置"""
        base_config = LOCAL_DATA_SOURCE.get(algorithm_id)
        if not base_config:
            return None
        
        # 为每个快照注入元信息
        enhanced_snapshots = []
        for snapshot in base_config['snapshots']:
            enhanced_snapshot = {
                **snapshot,
                'stepMeta': {
                    'generationTimeMs': random.randint(10, 60),
                    'source': 'compute',
                    'cacheKey': demo_cache.generate_key(algorithm_id, params),
                    'version': DATA_VERSION,
                    'explanationSource': 'preset'
                }
            }
            enhanced_snapshots.append(enhanced_snapshot)
        
        return {
            **base_config,
            'snapshots': enhanced_snapshots,
            'params': params
        }
    
    async def _simulate_latency(self):
        """模拟网络延迟"""
        import asyncio
        latency = random.randint(settings.SIMULATE_LATENCY_MIN, settings.SIMULATE_LATENCY_MAX)
        await asyncio.sleep(latency / 1000)
    
    def _log_demo_request(self, entry: Dict[str, Any]):
        """记录演示请求日志"""
        logger.log_demo_request(entry)


# 全局实例
demo_service = DemoService()
