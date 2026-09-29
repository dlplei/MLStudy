# Swagger UI 修复说明

## 🐛 问题描述

在 Swagger UI（http://localhost:8000/docs）测试 `/api/llm/explain` 接口时，出现以下错误：

```
403 Forbidden
{
  "error": {
    "message": "team not allowed to access model. This team can only access models=['global-models']. Tried to access string",
    "type": "team_model_access_denied",
    "param": "model",
    "code": "403"
  }
}
```

**根本原因**：Swagger UI 自动将 `model` 字段填入默认值 `"string"`，而云端 LLM 服务不支持这个模型名称。

---

## ✅ 修复方案

### 1. API 逻辑优化

当 `model` 字段为空或为 `"string"` 时，自动使用配置文件中的默认模型：

```python
# 如果 model 为空或为默认占位符 "string"，使用配置文件中的默认模型
model = request.model
if not model or model == "string":
    from app.config import settings
    model = settings.LLM_MODEL or settings.OLLAMA_MODEL
    logger.info('LLM_API', f'使用默认模型: {model}')
```

### 2. Schema 优化

为 `model` 字段添加描述和示例，让 Swagger UI 显示更友好的提示：

```python
model: Optional[str] = Field(
    default=None, 
    description="模型名称（可选，不填则使用配置文件中的默认模型）",
    examples=["claude-haiku-4-5", "deepseek-chat", "qwen-turbo"]
)
```

---

## 🧪 测试方法

### 方法 1：使用测试脚本

```bash
cd backend
python test_swagger_fix.py
```

测试脚本会验证三种场景：
1. ✅ `model="string"`（Swagger UI 默认值）
2. ✅ `model` 为空
3. ✅ `model` 为正确的模型名

### 方法 2：在 Swagger UI 测试

1. 访问 http://localhost:8000/docs
2. 找到 `/api/llm/explain` 接口
3. 点击 "Try it out"
4. **不修改 `model` 字段**（保持为空或默认值）
5. 点击 "Execute"
6. 应该看到成功的响应

### 方法 3：使用 curl 测试

```bash
# 测试 1: model 为空
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

# 测试 2: model 为 "string"
curl -X POST http://localhost:8000/api/llm/explain \
  -H "Content-Type: application/json" \
  -d '{
    "algorithmName": "K-Means 聚类",
    "stepTitle": "随机初始化聚类中心",
    "technicalDescription": "随机选择3个数据点作为初始聚类中心",
    "stepIndex": 1,
    "totalSteps": 5,
    "language": "zh",
    "model": "string"
  }'
```

---

## 📊 预期结果

### 修复前

```json
{
  "detail": "API error: 403 - {\"error\":{\"message\":\"team not allowed to access model...\"}}"
}
```

### 修复后

```json
{
  "status": "success",
  "text": "想象你有一堆不同颜色的弹珠...",
  "responseTimeMs": 14129,
  "tokensUsed": 464,
  "requestId": "req_xxx"
}
```

---

## 🔍 日志验证

修复后，后端日志应该显示：

```
{"message": "使用默认模型: claude-haiku-4-5", "category": "LLM_API"}
{"message": "Generation complete", "category": "LLM_SERVICE", "status": "success"}
```

---

## 💡 最佳实践

### 1. 在 Swagger UI 中测试

- **不填 `model` 字段**：使用配置文件中的默认模型
- **填写正确的模型名**：使用指定的模型

### 2. 在前端调用

前端代码已经正确处理，会自动传递正确的模型名：

```typescript
const response = await llmService.generateExplanation(
  {
    algorithmName: config.title.zh,
    stepTitle: currentSnapshot.title.zh,
    // ...
  },
  'zh'
);
```

### 3. 配置默认模型

在 `backend/.env` 中设置默认模型：

```env
# 云端 LLM
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-xxx

# 或本地 Ollama
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=deepseek-r1:1.5b
```

---

## 🎯 总结

✅ **问题已修复**：Swagger UI 测试不再报错  
✅ **向后兼容**：前端调用不受影响  
✅ **用户体验优化**：`model` 字段变为可选  
✅ **文档改进**：Swagger UI 显示清晰的描述和示例  

现在你可以在 Swagger UI 中直接测试，无需手动填写 `model` 字段！
