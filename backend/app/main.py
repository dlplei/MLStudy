"""
ML Algorithm Demo API - FastAPI 主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings, print_config
from app.api import demos, llm

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时打印配置
    print_config()
    yield
    # 关闭时的清理操作（如果有）

# 创建 FastAPI 应用
app = FastAPI(
    title="ML Algorithm Demo API",
    description="机器学习算法演示 API - 提供算法演示数据和 AI 解说词生成服务",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(demos.router, prefix="/api/demos", tags=["demos"])
app.include_router(llm.router, prefix="/api/llm", tags=["llm"])


@app.get("/")
async def root():
    """根路由 - API 信息"""
    return {
        "name": "ML Algorithm Demo API",
        "version": "3.0.0",
        "description": "机器学习算法演示 API",
        "endpoints": {
            "demos": "/api/demos",
            "llm": "/api/llm",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "ml-demo-api",
        "version": "3.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
