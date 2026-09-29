"""
LLM API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.llm_service import llm_service
from app.utils.logger import logger

router = APIRouter()


class ExplanationRequest(BaseModel):
    """生成解说词请求"""
    algorithmName: str = Field(..., description="算法名称", examples=["K-Means 聚类"])
    stepTitle: str = Field(..., description="步骤标题", examples=["随机初始化聚类中心"])
    technicalDescription: str = Field(..., description="技术描述", examples=["随机选择3个数据点作为初始聚类中心"])
    stepIndex: int = Field(..., description="步骤索引（从0开始）", examples=[1])
    totalSteps: int = Field(..., description="总步骤数", examples=[5])
    language: str = Field(default="zh", description="语言（zh/en）", examples=["zh"])
    model: Optional[str] = Field(
        default=None, 
        description="模型名称（可选，不填则使用配置文件中的默认模型）",
        examples=["claude-haiku-4-5", "deepseek-chat", "qwen-turbo"]
    )


class BatchExplanationRequest(BaseModel):
    """批量生成解说词请求"""
    contexts: List[ExplanationRequest]
    language: str = "zh"
    model: Optional[str] = None
    concurrency: int = 3


@router.post("/explain")
async def generate_explanation(request: ExplanationRequest):
    """
    生成通俗解说词
    
    Args:
        request: 请求参数
        - model: 模型名称（可选，不填则使用配置文件中的默认模型）
    
    Returns:
        LLM 生成的解说词
    """
    context = {
        'algorithm_name': request.algorithmName,
        'step_title': request.stepTitle,
        'technical_description': request.technicalDescription,
        'step_index': request.stepIndex,
        'total_steps': request.totalSteps
    }
    
    # 如果 model 为空或为默认占位符 "string"，使用配置文件中的默认模型
    model = request.model
    if not model or model == "string":
        from app.config import settings
        model = settings.LLM_MODEL or settings.OLLAMA_MODEL
        logger.info('LLM_API', f'使用默认模型: {model}')
    
    result = await llm_service.generate_explanation(
        context=context,
        language=request.language,
        model=model
    )
    
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result.get('error', 'LLM generation failed'))
    
    return result


@router.post("/explain/batch")
async def batch_generate_explanations(request: BatchExplanationRequest):
    """
    批量生成解说词
    
    Args:
        request: 批量请求参数
        - model: 模型名称（可选，不填则使用配置文件中的默认模型）
    
    Returns:
        LLM 生成的解说词列表
    """
    contexts = [
        {
            'algorithm_name': ctx.algorithmName,
            'step_title': ctx.stepTitle,
            'technical_description': ctx.technicalDescription,
            'step_index': ctx.stepIndex,
            'total_steps': ctx.totalSteps
        }
        for ctx in request.contexts
    ]
    
    # 如果 model 为空或为默认占位符 "string"，使用配置文件中的默认模型
    model = request.model
    if not model or model == "string":
        from app.config import settings
        model = settings.LLM_MODEL or settings.OLLAMA_MODEL
        logger.info('LLM_API', f'批量生成使用默认模型: {model}')
    
    results = await llm_service.batch_generate_explanations(
        contexts=contexts,
        language=request.language,
        model=model,
        concurrency=request.concurrency
    )
    
    return {
        'status': 'success',
        'result': results
    }


@router.get("/cache/stats")
async def get_cache_stats():
    """获取 LLM 缓存统计信息"""
    return {
        'status': 'success',
        'result': llm_service.get_cache_stats()
    }


@router.delete("/cache")
async def clear_cache():
    """清除 LLM 缓存"""
    llm_service.clear_cache()
    return {
        'status': 'success',
        'message': 'LLM cache cleared'
    }
