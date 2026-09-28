"""
数据模型定义（Pydantic Schemas）
对应前端的 TypeScript 接口
"""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# ==================== 基础类型 ====================

class StepDescription(BaseModel):
    """步骤描述（中英文）"""
    zh: str
    en: str


class StepMetadata(BaseModel):
    """步骤元信息"""
    generation_time_ms: int = Field(alias="generationTimeMs")
    source: Literal["cache", "compute", "api"]
    cache_key: Optional[str] = Field(default=None, alias="cacheKey")
    version: str
    explanation_source: Optional[Literal["preset", "llm", "fallback"]] = Field(default=None, alias="explanationSource")
    llm_generation_time_ms: Optional[int] = Field(default=None, alias="llmGenerationTimeMs")
    llm_model: Optional[str] = Field(default=None, alias="llmModel")
    
    class Config:
        populate_by_name = True


# ==================== 演示数据模型 ====================

class DemoSnapshot(BaseModel):
    """演示快照"""
    step_index: int = Field(alias="stepIndex")
    title: StepDescription
    description: StepDescription
    plain_explanation: StepDescription = Field(alias="plainExplanation")
    action_label: StepDescription = Field(alias="actionLabel")
    visualization_data: Dict[str, Any] = Field(alias="visualizationData")
    step_meta: StepMetadata = Field(alias="stepMeta")
    
    class Config:
        populate_by_name = True


class DemoConfig(BaseModel):
    """演示配置"""
    algorithm_id: str = Field(alias="algorithmId")
    title: StepDescription
    total_steps: int = Field(alias="totalSteps")
    snapshots: List[DemoSnapshot]
    params: Optional[Dict[str, Any]] = None
    
    class Config:
        populate_by_name = True


# ==================== API 响应模型 ====================

class DemoApiResponse(BaseModel):
    """演示 API 响应"""
    status: Literal["success", "error", "timeout"]
    result: Optional[DemoConfig] = None
    error: Optional[str] = None
    response_time_ms: int = Field(alias="responseTimeMs")
    cached: bool
    request_id: str = Field(alias="requestId")
    
    class Config:
        populate_by_name = True


class DemoStepResponse(BaseModel):
    """演示步骤 API 响应"""
    status: Literal["success", "error", "timeout"]
    result: Optional[DemoSnapshot] = None
    error: Optional[str] = None
    response_time_ms: int = Field(alias="responseTimeMs")
    cached: bool
    request_id: str = Field(alias="requestId")
    
    class Config:
        populate_by_name = True


# ==================== LLM 相关模型 ====================

class LLMRequest(BaseModel):
    """LLM 请求"""
    algorithm_name: str = Field(alias="algorithmName")
    step_title: str = Field(alias="stepTitle")
    technical_description: str = Field(alias="technicalDescription")
    step_index: int = Field(alias="stepIndex")
    total_steps: int = Field(alias="totalSteps")
    language: Literal["zh", "en"] = "zh"
    model: Optional[str] = None
    
    class Config:
        populate_by_name = True


class LLMResponse(BaseModel):
    """LLM 响应"""
    status: Literal["success", "error", "timeout"]
    text: Optional[str] = None
    error: Optional[str] = None
    response_time_ms: int = Field(alias="responseTimeMs")
    tokens_used: Optional[int] = Field(default=None, alias="tokensUsed")
    request_id: str = Field(alias="requestId")
    
    class Config:
        populate_by_name = True


# ==================== 日志模型 ====================

class DemoLogEntry(BaseModel):
    """演示请求日志"""
    algorithm_name: str
    parameters: Dict[str, Any]
    execution_time_ms: int
    source: Literal["cache", "compute", "api"]
    cache_hit: bool
    cache_key: str
    request_id: str
    total_steps: int
    error: Optional[str] = None


class LLMLogEntry(BaseModel):
    """LLM 调用日志"""
    request_id: str
    model: str
    algorithm_name: str
    step_index: int
    language: Literal["zh", "en"]
    execution_time_ms: int
    status: Literal["success", "error", "timeout"]
    tokens_used: Optional[int] = None
    error: Optional[str] = None
    prompt_length: int
    response_length: Optional[int] = None
