# 快速启动指南

## 📋 系统架构说明

本系统采用**前后端分离**架构：

- **后端**（FastAPI）：运行在 `http://localhost:8000`，只提供 API 接口
- **前端**（React）：运行在 `http://localhost:3000`，提供用户界面

⚠️ **重要**：访问 `http://localhost:8000/` 只会看到 API 信息页面，**不是前端界面**！

## 🚀 启动步骤

### 方式一：仅启动前端（使用模拟数据）

如果你只想看前端界面，不需要 AI 功能：

```bash
# 1. 安装前端依赖（首次运行）
npm install

# 2. 启动前端
npm run dev
```

访问：**http://localhost:3000**

✅ 前端会使用内置的模拟数据运行
✅ 无需启动后端
✅ 无需 Ollama

---

### 方式二：完整启动（前端 + 后端 + AI）

如果你需要完整的 AI 解说词生成功能：

#### 1. 安装 Ollama（如果还没有）

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载：https://ollama.com/download/OllamaSetup.exe
```

#### 2. 下载 DeepSeek 模型

```bash
ollama pull deepseek-r1:1.5b
```

#### 3. 启动 Ollama 服务

```bash
ollama serve
```

保持这个终端运行。

#### 4. 启动后端

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（首次运行）
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖（首次运行）
pip install -r requirements.txt

# 启动后端
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动成功后会看到配置信息：
```
============================================================
📋 应用配置
============================================================
🔗 Ollama Base URL: http://localhost:11434
🤖 Ollama Model: deepseek-r1:1.5b
⏱️  Ollama Timeout: 30s
💾 Cache TTL: 600s
💾 Cache Max Size: 100
📝 Log Level: INFO
📝 Log File: logs/app.log
🌐 API Host: 0.0.0.0
🌐 API Port: 8000
🔒 CORS Origins: ['http://localhost:3000']
============================================================
```

访问后端 API 文档：**http://localhost:8000/docs**

#### 5. 启动前端（连接后端）

打开**新的终端窗口**：

```bash
# 设置环境变量，启用真实 API
export VITE_USE_REAL_API=true  # macOS/Linux
# Windows PowerShell: $env:VITE_USE_REAL_API="true"
# Windows CMD: set VITE_USE_REAL_API=true

# 启动前端
npm run dev
```

访问：**http://localhost:3000**

---

## 🔍 验证系统

### 1. 检查后端是否运行

```bash
curl http://localhost:8000/health
```

应该返回：
```json
{
  "status": "healthy",
  "service": "ml-demo-api",
  "version": "3.0.0"
}
```

### 2. 检查 Ollama 是否运行

```bash
curl http://localhost:11434/api/tags
```

应该返回模型列表。

### 3. 测试 AI 解说词生成

访问后端文档：**http://localhost:8000/docs**

找到 `/api/llm/explain` 端点，点击 "Try it out"，输入：

```json
{
  "algorithmName": "K-Means 聚类",
  "stepTitle": "随机初始化聚类中心",
  "technicalDescription": "随机选择3个数据点作为初始聚类中心",
  "stepIndex": 1,
  "totalSteps": 5,
  "language": "zh"
}
```

点击 "Execute"，应该看到 AI 生成的通俗解说词。

### 4. 在前端测试

1. 访问 **http://localhost:3000**
2. 点击任意算法卡片（如 K-Means）
3. 切换到"动态演示"标签
4. 点击"生成 AI 解说"按钮
5. 等待几秒钟，应该看到 AI 生成的解说词

---

## 🛠️ 常见问题

### Q1: 访问 http://localhost:8000/ 看不到前端页面？

**A**: 这是正常的！后端只提供 API，不提供前端页面。
- 前端页面在：**http://localhost:3000**
- 后端 API 文档在：**http://localhost:8000/docs**

### Q2: 前端显示"AI 解说词生成失败"？

**A**: 检查以下几点：
1. Ollama 是否运行：`curl http://localhost:11434/api/tags`
2. 模型是否下载：`ollama list`
3. 后端是否启动：`curl http://localhost:8000/health`
4. 前端是否配置了 `VITE_USE_REAL_API=true`

### Q3: 后端启动时显示配置信息不对？

**A**: 检查 `.env` 文件：
```bash
cd backend
cat .env
```

确保配置正确，例如：
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:1.5b
OLLAMA_TIMEOUT=30
```

### Q4: 前端无法连接后端？

**A**: 检查 CORS 配置：
1. 后端 `.env` 中的 `CORS_ORIGINS` 是否包含 `http://localhost:3000`
2. 前端是否运行在 `http://localhost:3000`

### Q5: 只想看前端，不想启动后端？

**A**: 可以！前端默认使用模拟数据：
```bash
# 确保没有设置 VITE_USE_REAL_API
unset VITE_USE_REAL_API  # macOS/Linux

# 或者明确设置为 false
export VITE_USE_REAL_API=false

# 启动前端
npm run dev
```

---

## 📊 系统组件关系

```
┌─────────────┐
│   浏览器    │
└──────┬──────┘
       │
       │ http://localhost:3000
       ▼
┌─────────────┐
│ React 前端  │
│  (Vite)     │
└──────┬──────┘
       │
       │ API 调用（如果 VITE_USE_REAL_API=true）
       ▼
┌─────────────┐      ┌─────────────┐
│ FastAPI     │──────│   Ollama    │
│ 后端        │      │  (DeepSeek) │
│ :8000       │      │  :11434     │
└─────────────┘      └─────────────┘
```

---

## 🎯 快速测试脚本

创建一个测试脚本来验证所有组件：

```bash
#!/bin/bash

echo "🔍 检查系统状态..."
echo ""

# 检查 Ollama
echo "1️⃣  检查 Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "   ✅ Ollama 运行正常"
else
    echo "   ❌ Ollama 未运行，请执行: ollama serve"
fi
echo ""

# 检查后端
echo "2️⃣  检查后端..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ 后端运行正常"
else
    echo "   ❌ 后端未运行，请执行: cd backend && uvicorn app.main:app --reload"
fi
echo ""

# 检查前端
echo "3️⃣  检查前端..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ 前端运行正常"
else
    echo "   ❌ 前端未运行，请执行: npm run dev"
fi
echo ""

echo "🎉 检查完成！"
```

保存为 `check_system.sh`，然后运行：
```bash
chmod +x check_system.sh
./check_system.sh
```

---

## 📝 总结

| 组件 | 地址 | 用途 |
|------|------|------|
| 前端界面 | http://localhost:3000 | 用户界面 |
| 后端 API | http://localhost:8000 | API 服务 |
| API 文档 | http://localhost:8000/docs | Swagger 文档 |
| Ollama | http://localhost:11434 | AI 模型服务 |

**记住**：
- 前端和后端是**分开启动**的
- 访问前端去 **http://localhost:3000**
- 访问后端 API 文档去 **http://localhost:8000/docs**
