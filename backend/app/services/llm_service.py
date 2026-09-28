"""
LLM 服务
调用 Ollama API 生成通俗解说词
"""
import time
import random
import uuid
import httpx
from typing import Any, Dict, Optional
from app.config import settings
from app.services.cache import llm_cache
from app.utils.logger import logger


class LLMService:
    """LLM 服务类"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.default_model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
    
    @staticmethod
    def _generate_request_id() -> str:
        """生成请求 ID"""
        return f"req_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
    
    @staticmethod
    def _build_prompt(context: Dict[str, Any], language: str) -> str:
        """构建提示词"""
        lang_instruction = "请用中文回答，使用简单易懂的比喻和日常生活中的例子。" if language == "zh" else "Please respond in English, using simple analogies and everyday examples."
        
        return f"""你是一位优秀的机器学习科普老师。请为以下算法步骤生成一段通俗易懂的解说词。

算法名称：{context['algorithm_name']}
当前步骤：{context['step_title']}（第 {context['step_index'] + 1}/{context['total_steps']} 步）
技术描述：{context['technical_description']}

要求：
1. 用 1-2 句话解释这个步骤在做什么
2. 使用生动的比喻或日常例子
3. 避免专业术语，让完全不懂技术的人也能理解
4. 语气友好、鼓励性

{lang_instruction}

请直接输出解说词，不要添加任何前缀或解释。"""
    
    @staticmethod
    def _hash_prompt(prompt: str) -> str:
        """计算提示词哈希"""
        return str(hash(prompt))
    
    async def generate_explanation(
        self,
        context: Dict[str, Any],
        language: str = "zh",
        model: Optional[str] = None,
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """
        生成通俗解说词
        
        Args:
            context: 上下文信息（算法名称、步骤标题、技术描述等）
            language: 语言（zh/en）
            model: 模型名称（可选，默认使用配置中的模型）
            force_regenerate: 是否强制重新生成（忽略缓存）
        
        Returns:
            LLM 响应字典
        """
        request_id = self._generate_request_id()
        start_time = time.time()
        model = model or self.default_model
        
        # 构建提示词
        prompt = self._build_prompt(context, language)
        prompt_hash = self._hash_prompt(prompt)
        cache_key = f"{model}:{language}:{prompt_hash}"
        
        logger.debug('LLM_SERVICE', 'Generating explanation', {
            'algorithm_name': context['algorithm_name'],
            'step_index': context['step_index'],
            'language': language,
            'model': model,
            'request_id': request_id
        }, request_id)
        
        try:
            # 检查缓存
            if not force_regenerate:
                cached = llm_cache.get(cache_key)
                if cached:
                    response_time = int((time.time() - start_time) * 1000)
                    logger.info('LLM_SERVICE', 'Cache HIT', {
                        'cache_key': cache_key,
                        'response_time_ms': response_time,
                        'request_id': request_id
                    }, request_id)
                    
                    self._log_llm_call({
                        'request_id': request_id,
                        'model': model,
                        'algorithm_name': context['algorithm_name'],
                        'step_index': context['step_index'],
                        'language': language,
                        'execution_time_ms': response_time,
                        'status': 'success',
                        'tokens_used': len(cached),
                        'prompt_length': len(prompt),
                        'response_length': len(cached)
                    })
                    
                    return {
                        'status': 'success',
                        'text': cached,
                        'response_time_ms': response_time,
                        'tokens_used': len(cached),
                        'request_id': request_id
                    }
            
            # 调用 Ollama API
            response = await self._call_ollama_api(prompt, model, request_id)
            response_time = int((time.time() - start_time) * 1000)
            
            if response['status'] == 'success' and response.get('text'):
                # 写入缓存
                llm_cache.set(cache_key, response['text'])
                
                logger.info('LLM_SERVICE', 'Generation complete', {
                    'response_time_ms': response_time,
                    'tokens_used': response.get('tokens_used'),
                    'request_id': request_id
                }, request_id)
                
                self._log_llm_call({
                    'request_id': request_id,
                    'model': model,
                    'algorithm_name': context['algorithm_name'],
                    'step_index': context['step_index'],
                    'language': language,
                    'execution_time_ms': response_time,
                    'status': 'success',
                    'tokens_used': response.get('tokens_used'),
                    'prompt_length': len(prompt),
                    'response_length': len(response['text'])
                })
                
                return {
                    **response,
                    'response_time_ms': response_time
                }
            
            # 错误处理
            logger.error('LLM_SERVICE', 'Generation failed', {
                'error': response.get('error'),
                'response_time_ms': response_time,
                'request_id': request_id
            }, request_id)
            
            self._log_llm_call({
                'request_id': request_id,
                'model': model,
                'algorithm_name': context['algorithm_name'],
                'step_index': context['step_index'],
                'language': language,
                'execution_time_ms': response_time,
                'status': response['status'],
                'prompt_length': len(prompt),
                'error': response.get('error')
            })
            
            return {
                **response,
                'response_time_ms': response_time
            }
        
        except Exception as e:
            response_time = int((time.time() - start_time) * 1000)
            error_msg = str(e)
            
            logger.error('LLM_SERVICE', 'Unexpected error', {
                'error': error_msg,
                'response_time_ms': response_time,
                'request_id': request_id
            }, request_id)
            
            return {
                'status': 'error',
                'error': error_msg,
                'response_time_ms': response_time,
                'request_id': request_id
            }
    
    async def batch_generate_explanations(
        self,
        contexts: list,
        language: str = "zh",
        model: Optional[str] = None,
        concurrency: int = 3
    ) -> list:
        """批量生成解说词"""
        import asyncio
        
        results = []
        for i in range(0, len(contexts), concurrency):
            batch = contexts[i:i + concurrency]
            batch_results = await asyncio.gather(*[
                self.generate_explanation(ctx, language, model)
                for ctx in batch
            ])
            results.extend(batch_results)
        
        return results
    
    async def _call_ollama_api(self, prompt: str, model: str, request_id: str) -> Dict[str, Any]:
        """调用 Ollama API"""
        # 模拟延迟（开发环境）
        latency = random.randint(settings.LLM_LATENCY_MIN, settings.LLM_LATENCY_MAX)
        await asyncio.sleep(latency / 1000)
        
        # 模拟失败
        if random.random() < settings.SIMULATE_FAILURE_RATE:
            return {
                'status': 'error',
                'error': 'Simulated API error',
                'request_id': request_id
            }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        'model': model,
                        'prompt': prompt,
                        'stream': False,
                        'options': {
                            'temperature': 0.7,
                            'num_predict': 200
                        }
                    }
                )
                
                if response.status_code != 200:
                    return {
                        'status': 'error',
                        'error': f"API error: {response.status_code}",
                        'request_id': request_id
                    }
                
                result = response.json()
                return {
                    'status': 'success',
                    'text': result.get('response', ''),
                    'tokens_used': result.get('eval_count', 0),
                    'request_id': request_id
                }
        
        except httpx.TimeoutException:
            return {
                'status': 'timeout',
                'error': f'Request timeout after {self.timeout}s',
                'request_id': request_id
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'request_id': request_id
            }
    
    def _log_llm_call(self, entry: Dict[str, Any]):
        """记录 LLM 调用日志"""
        logger.log_llm_call(entry)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计"""
        return llm_cache.get_stats()
    
    def clear_cache(self):
        """清除缓存"""
        llm_cache.clear()
        logger.info('LLM_SERVICE', 'Cache cleared')


# 全局实例
llm_service = LLMService()
