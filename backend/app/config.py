"""
配置管理模块
从 .env 文件加载所有配置
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """应用配置"""
    
    # Ollama 配置
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Ollama API 基础 URL")
    OLLAMA_MODEL: str = Field(default="deepseek-r1:1.5b", description="默认 LLM 模型")
    OLLAMA_TIMEOUT: int = Field(default=30, description="Ollama 请求超时时间（秒）")
    
    # 缓存配置
    CACHE_TTL: int = Field(default=600, description="缓存 TTL（秒）")
    CACHE_MAX_SIZE: int = Field(default=100, description="缓存最大条目数")
    
    # 日志配置
    LOG_LEVEL: str = Field(default="INFO", description="日志级别")
    LOG_FILE: str = Field(default="logs/app.log", description="日志文件路径")
    
    # API 配置
    API_HOST: str = Field(default="0.0.0.0", description="API 监听地址")
    API_PORT: int = Field(default=8000, description="API 监听端口")
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:5173"], description="CORS 允许的来源")
    
    # 模拟配置（开发环境）
    SIMULATE_LATENCY_MIN: int = Field(default=50, description="模拟最小延迟（毫秒）")
    SIMULATE_LATENCY_MAX: int = Field(default=200, description="模拟最大延迟（毫秒）")
    SIMULATE_FAILURE_RATE: float = Field(default=0.05, description="模拟失败率")
    LLM_LATENCY_MIN: int = Field(default=800, description="LLM 模拟最小延迟（毫秒）")
    LLM_LATENCY_MAX: int = Field(default=2500, description="LLM 模拟最大延迟（毫秒）")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# 全局配置实例
settings = Settings()
