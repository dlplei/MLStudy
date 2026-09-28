"""
演示数据 API 路由
"""
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.demo_service import demo_service

router = APIRouter()


class FetchDemoRequest(BaseModel):
    """获取演示配置请求"""
    params: Optional[Dict[str, Any]] = None


@router.get("/available")
async def get_available_demos():
    """获取所有可用的演示算法"""
    return {
        'status': 'success',
        'result': demo_service.get_available_demos()
    }


@router.get("/has/{algorithm_id}")
async def has_demo(algorithm_id: str):
    """检查算法是否有可用的演示"""
    return {
        'status': 'success',
        'result': demo_service.has_demo(algorithm_id)
    }


@router.post("/{algorithm_id}")
async def fetch_demo_config(algorithm_id: str, request: Optional[FetchDemoRequest] = None):
    """
    获取演示配置
    
    Args:
        algorithm_id: 算法 ID
        request: 请求参数（可选）
    
    Returns:
        演示配置数据
    """
    params = request.params if request else None
    result = await demo_service.fetch_demo_config(algorithm_id, params)
    
    if result['status'] == 'error':
        raise HTTPException(status_code=404, detail=result.get('error', 'Demo not found'))
    
    return result


@router.get("/{algorithm_id}/step/{step_index}")
async def fetch_demo_step(algorithm_id: str, step_index: int, params: Optional[str] = Query(None)):
    """
    获取演示的单个步骤
    
    Args:
        algorithm_id: 算法 ID
        step_index: 步骤索引
        params: 参数 JSON 字符串（可选）
    
    Returns:
        步骤数据
    """
    import json
    params_dict = json.loads(params) if params else None
    
    config_response = await demo_service.fetch_demo_config(algorithm_id, params_dict)
    
    if config_response['status'] != 'success' or not config_response.get('result'):
        raise HTTPException(status_code=404, detail=config_response.get('error', 'Demo not found'))
    
    config = config_response['result']
    if step_index < 0 or step_index >= len(config['snapshots']):
        raise HTTPException(status_code=404, detail=f'Step {step_index} not found')
    
    snapshot = config['snapshots'][step_index]
    
    return {
        'status': 'success',
        'result': snapshot,
        'responseTimeMs': config_response['responseTimeMs'],
        'cached': config_response['cached'],
        'requestId': config_response['requestId']
    }


@router.get("/cache/stats")
async def get_cache_stats():
    """获取缓存统计信息"""
    return {
        'status': 'success',
        'result': demo_service.get_cache_stats()
    }


@router.delete("/cache")
async def clear_cache():
    """清除缓存"""
    demo_service.clear_cache()
    return {
        'status': 'success',
        'message': 'Cache cleared'
    }
