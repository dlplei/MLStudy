# 故障排查指南

## 🚨 常见问题及解决方案

### 问题 1：访问 http://localhost:5173 无法打开

**原因**：Vite 配置的端口是 3000，不是 5173

**解决方案**：
```bash
# 访问正确的地址
http://localhost:3000
```

---

### 问题 2：前端无法连接后端 API

**症状**：浏览器控制台显示 CORS 错误

**解决方案**：

1. 检查后端是否运行：
```bash
curl http://localhost:8000/health
```

2. 检查后端 `.env` 配置：
```bash
cd backend
cat .env | grep CORS
```

确保包含：
```env
CORS_ORIGINS=["http://localhost:3000"]
```

3. 重启后端：
```bash
# 停止后端（Ctrl+C）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 问题 3：AI 解说词生成失败

**症状**：点击"生成 AI 解说"后显示错误

**排查步骤**：

1. **检查 Ollama 是否运行**：
```bash
curl http://localhost:11434/api/tags
```

如果失败，启动 Ollama：
```bash
ollama serve
```

2. **检查模型是否下载**：
```bash
ollama list
```

如果没有模型，下载：
```bash
ollama pull deepseek-r1:1.5b
```

3. **检查后端是否配置正确**：
```bash
cd backend
cat .env | grep OLLAMA
```

应该看到：
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:1.5b
```

4. **测试后端 LLM API**：
```bash
curl -X POST http://localhost:8000/api/llm/explain \
  -H "Content-Type: application/json" \
  -d '{
    "algorithmName": "K-Means",
    "stepTitle": "初始化",
    "technicalDescription": "随机选择中心点",
    "stepIndex": 0,
    "totalSteps": 5,
    "language": "zh"
  }'
```

5. **检查前端是否启用真实 API**：
```bash
# 查看环境变量
echo $VITE_USE_REAL_API
```

如果为空或 false，设置：
```bash
export VITE_USE_REAL_API=true
npm run dev
```

---

### 问题 4：后端启动失败

**症状**：`uvicorn` 命令报错

**常见错误及解决**：

**错误 1：ModuleNotFoundError**
```bash
# 安装依赖
cd backend
pip install -r requirements.txt
```

**错误 2：Address already in use**
```bash
# 查找占用端口的进程
lsof -i :8000

# 杀掉进程
kill -9 <PID>

# 或者使用其他端口
uvicorn app.main:app --reload --port 8001
```

**错误 3：Permission denied**
```bash
# 使用其他端口（避免使用 1024 以下的端口）
uvicorn app.main:app --reload --port 8000
```

---

### 问题 5：前端启动失败

**症状**：`npm run dev` 报错

**常见错误及解决**：

**错误 1：Cannot find module**
```bash
# 安装依赖
npm install
```

**错误 2：Port 3000 is already in use**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀掉进程
kill -9 <PID>

# 或者修改 vite.config.js 使用其他端口
```

---

### 问题 6：配置没有生效

**症状**：修改 `.env` 后配置没有变化

**解决方案**：

1. **后端**：重启服务
```bash
# 停止服务（Ctrl+C）
# 重新启动
uvicorn app.main:app --reload
```

启动时会打印配置信息，检查是否正确。

2. **前端**：重启开发服务器
```bash
# 停止服务（Ctrl+C）
# 重新设置环境变量
export VITE_USE_REAL_API=true
# 重新启动
npm run dev
```

---

## 🔍 系统检查脚本

创建 `check_system.sh`：

```bash
#!/bin/bash

echo "🔍 检查系统状态..."
echo ""

# 检查 Ollama
echo "1️⃣  检查 Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama 运行正常"
    echo "   可用模型："
    curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/      - /'
else
    echo "   ❌ Ollama 未运行"
    echo "   请执行: ollama serve"
fi
echo ""

# 检查后端
echo "2️⃣  检查后端..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ 后端运行正常"
    curl -s http://localhost:8000/health | grep -o '"status":"[^"]*"' | sed 's/"status":"//g' | sed 's/"//g' | sed 's/^/   状态: /'
else
    echo "   ❌ 后端未运行"
    echo "   请执行: cd backend && uvicorn app.main:app --reload"
fi
echo ""

# 检查前端
echo "3️⃣  检查前端..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ 前端运行正常"
else
    echo "   ❌ 前端未运行"
    echo "   请执行: npm run dev"
fi
echo ""

# 检查环境变量
echo "4️⃣  检查环境变量..."
if [ "$VITE_USE_REAL_API" = "true" ]; then
    echo "   ✅ VITE_USE_REAL_API=true（使用真实 API）"
else
    echo "   ⚠️  VITE_USE_REAL_API=${VITE_USE_REAL_API:-未设置}（使用模拟数据）"
fi
echo ""

echo "🎉 检查完成！"
echo ""
echo "📍 访问地址："
echo "   - 前端界面: http://localhost:3000"
echo "   - 后端 API: http://localhost:8000"
echo "   - API 文档: http://localhost:8000/docs"
```

使用方法：
```bash
chmod +x check_system.sh
./check_system.sh
```

---

## 📊 端口对照表

| 服务 | 端口 | 地址 | 说明 |
|------|------|------|------|
| 前端 | 3000 | http://localhost:3000 | React 用户界面 |
| 后端 | 8000 | http://localhost:8000 | FastAPI API 服务 |
| API 文档 | 8000 | http://localhost:8000/docs | Swagger UI |
| Ollama | 11434 | http://localhost:11434 | AI 模型服务 |

---

## 🎯 快速修复清单

如果系统不工作，按顺序检查：

- [ ] Ollama 是否运行？`curl http://localhost:11434/api/tags`
- [ ] 模型是否下载？`ollama list`
- [ ] 后端是否运行？`curl http://localhost:8000/health`
- [ ] 前端是否运行？`curl http://localhost:3000`
- [ ] 后端 `.env` 配置是否正确？`cat backend/.env`
- [ ] 前端环境变量是否设置？`echo $VITE_USE_REAL_API`
- [ ] CORS 配置是否包含 `http://localhost:3000`？
- [ ] 访问的是 `http://localhost:3000` 而不是 5173？

---

## 💡 调试技巧

### 1. 查看后端日志

```bash
# 实时查看日志
tail -f backend/logs/app.log
```

### 2. 查看浏览器网络请求

打开浏览器开发者工具（F12）→ Network 标签，查看 API 请求是否成功。

### 3. 测试 API

使用 curl 或 Postman 测试 API：

```bash
# 获取可用演示
curl http://localhost:8000/api/demos/available

# 获取演示配置
curl -X POST http://localhost:8000/api/demos/kmeans \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. 清除缓存

```bash
# 清除后端缓存
curl -X DELETE http://localhost:8000/api/demos/cache
curl -X DELETE http://localhost:8000/api/llm/cache
```

---

## 🆘 获取帮助

如果以上方法都无法解决问题：

1. 检查 `backend/logs/app.log` 日志文件
2. 查看浏览器控制台的错误信息
3. 运行 `./check_system.sh` 检查系统状态
4. 重启所有服务（Ollama → 后端 → 前端）

---

## 📝 总结

**最常见的 3 个问题**：

1. ❌ 访问 `http://localhost:5173` → ✅ 应该访问 `http://localhost:3000`
2. ❌ 后端 CORS 配置错误 → ✅ 确保包含 `http://localhost:3000`
3. ❌ Ollama 未运行 → ✅ 执行 `ollama serve`

**记住**：
- 前端端口：**3000**
- 后端端口：**8000**
- Ollama 端口：**11434**
