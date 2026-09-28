"""
LLM API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service

router = APIRouter()


class ExplanationRequest(BaseModel):
    """生成解说词请求"""
    algorithmName: str
    stepTitle: str
    technicalDescription: str
    stepIndex: int
    totalSteps: int
    language: str = "zh"
    model: Optional[str] = None


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
    
    result = await llm_service.generate_explanation(
        context=context,
        language=request.language,
        model=request.model
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
    
    results = await llm_service.batch_generate_explanations(
        contexts=contexts,
        language=request.language,
        model=request.model,
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
