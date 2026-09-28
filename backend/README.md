# ML Algorithm Demo API (FastAPI Backend)

机器学习算法演示 API 后端服务，基于 FastAPI 实现。

## 🚀 特性

- ✅ **FastAPI 框架** - 高性能异步 API
- ✅ **Ollama 集成** - 真实调用 DeepSeek 生成通俗解说词
- ✅ **LRU 缓存** - 提升响应速度
- ✅ **结构化日志** - 完整的调试和追踪
- ✅ **环境变量配置** - 灵活的配置管理
- ✅ **CORS 支持** - 跨域请求支持
- ✅ **自动文档** - Swagger UI + ReDoc

## 📦 安装

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt
```

## ⚙️ 配置

复制 `.env` 文件并修改配置：

```env
# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:1.5b
OLLAMA_TIMEOUT=30

# 缓存配置
CACHE_TTL=600
CACHE_MAX_SIZE=100

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# API 配置
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:5173"]
```

## 🏃 运行

```bash
# 开发模式（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📖 API 文档

启动服务后访问：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API 端点

### 演示数据 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/demos/available` | 获取所有可用的演示算法 |
| GET | `/api/demos/has/{algorithm_id}` | 检查算法是否有演示 |
| POST | `/api/demos/{algorithm_id}` | 获取演示配置 |
| GET | `/api/demos/{algorithm_id}/step/{step_index}` | 获取单个步骤 |
| GET | `/api/demos/cache/stats` | 获取缓存统计 |
| DELETE | `/api/demos/cache` | 清除缓存 |

### LLM API

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/llm/explain` | 生成通俗解说词 |
| POST | `/api/llm/explain/batch` | 批量生成解说词 |
| GET | `/api/llm/cache/stats` | 获取 LLM 缓存统计 |
| DELETE | `/api/llm/cache` | 清除 LLM 缓存 |

## 📝 示例请求

### 获取演示配置

```bash
curl -X POST http://localhost:8000/api/demos/kmeans \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 生成 AI 解说词

```bash
curl -X POST http://localhost:8000/api/llm/explain \
  -H "Content-Type: application/json" \
  -d '{
    "algorithmName": "K-Means 聚类",
    "stepTitle": "随机初始化聚类中心",
    "technicalDescription": "随机选择3个数据点作为初始聚类中心",
    "stepIndex": 1,
    "totalSteps": 5,
    "language": "zh"
  }'
```

## 🏗️ 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── api/
│   │   ├── __init__.py
│   │   ├── demos.py         # 演示数据 API
│   │   └── llm.py           # LLM API
│   ├── services/
│   │   ├── __init__.py
│   │   ├── demo_service.py  # 演示服务
│   │   ├── llm_service.py   # LLM 服务
│   │   └── cache.py         # LRU 缓存
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic 模型
│   ├── data/
│   │   ├── __init__.py
│   │   └── demos.py         # 演示数据
│   └── utils/
│       ├── __init__.py
│       └── logger.py        # 日志工具
├── logs/                    # 日志目录
├── .env                     # 环境变量
├── requirements.txt         # Python 依赖
└── README.md               # 本文件
```

## 🔧 Ollama 配置

### 安装 Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载 https://ollama.com/download/OllamaSetup.exe
```

### 下载模型

```bash
# 下载 DeepSeek 模型
ollama pull deepseek-r1:1.5b

# 或更大的模型
ollama pull deepseek-r1:7b
```

### 启动 Ollama

```bash
ollama serve
```

## 🧪 测试

```bash
# 运行测试（待实现）
pytest

# 检查代码质量
flake8 app/
```

## 📊 日志

日志文件位于 `logs/app.log`，格式为 JSON：

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "name": "ml_demo_api",
  "message": "Cache HIT",
  "category": "DEMO_SERVICE",
  "request_id": "req_1705312245123_abc123",
  "algorithm_id": "kmeans",
  "response_time_ms": 45
}
```

## 🚀 部署

### Docker 部署（推荐）

创建 `Dockerfile`：

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

构建和运行：

```bash
docker build -t ml-demo-api .
docker run -p 8000:8000 --env-file .env ml-demo-api
```

### 生产环境建议

1. 使用 Gunicorn + Uvicorn workers
2. 配置 Nginx 反向代理
3. 启用 HTTPS
4. 配置日志轮转
5. 使用 Redis 作为缓存后端

## 📄 许可证

MIT License
