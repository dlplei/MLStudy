# 云端 LLM 配置指南

本文档介绍如何配置后端以使用云端 LLM 服务（如 DeepSeek、通义千问、文心一言等）。

## 📋 快速开始

### 1. 复制配置模板

```bash
cd backend
cp .env.example.cloud .env
```

### 2. 编辑配置文件

打开 `backend/.env`，根据你的 LLM 提供商修改以下配置：

```env
# LLM 提供商类型
LLM_PROVIDER=openai

# LLM API 基础 URL
LLM_BASE_URL=https://api.deepseek.com

# LLM 模型名称
LLM_MODEL=deepseek-chat

# LLM API Key（从控制台获取）
LLM_API_KEY=your-api-key-here

# 超时时间（秒）
LLM_TIMEOUT=30
```

### 3. 重启后端

```bash
cd backend
# Ctrl+C 停止当前进程
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动时会显示配置信息：
```
============================================================
📋 应用配置
============================================================
🤖 LLM Provider: openai
🔗 LLM Base URL: https://api.deepseek.com
🤖 LLM Model: deepseek-chat
🔑 LLM API Key: ********
⏱️  LLM Timeout: 30s
...
============================================================
```

---

## 🔧 主流 LLM 提供商配置

### 1. DeepSeek API

**获取 API Key**：
1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入"API Keys"页面
4. 创建新的 API Key

**配置**：
```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-xxxxxxxxxxxxxxxx
LLM_TIMEOUT=30
```

**推荐模型**：
- `deepseek-chat` - 通用对话模型（推荐）
- `deepseek-coder` - 代码生成模型

---

### 2. 阿里云通义千问

**获取 API Key**：
1. 访问 https://dashscope.console.aliyun.com/
2. 登录阿里云账号
3. 开通 DashScope 服务
4. 在"API-KEY 管理"中创建 Key

**配置**：
```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode
LLM_MODEL=qwen-turbo
LLM_API_KEY=sk-xxxxxxxxxxxxxxxx
LLM_TIMEOUT=30
```

**推荐模型**：
- `qwen-turbo` - 快速响应（推荐）
- `qwen-plus` - 平衡性能
- `qwen-max` - 最强能力

---

### 3. 百度文心一言

**获取 API Key**：
1. 访问 https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
2. 登录百度智能云账号
3. 创建应用
4. 获取 API Key 和 Secret Key

**配置**：
```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop
LLM_MODEL=ernie-bot
LLM_API_KEY=your-access-token
LLM_TIMEOUT=30
```

**推荐模型**：
- `ernie-bot` - 标准版
- `ernie-bot-turbo` - 快速版
- `ernie-bot-4` - 最强版

---

### 4. 火山引擎（豆包）

**获取 API Key**：
1. 访问 https://console.volcengine.com/ark
2. 登录火山引擎账号
3. 开通方舟平台服务
4. 创建 API Key

**配置**：
```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api
LLM_MODEL=doubao-pro-32k
LLM_API_KEY=xxxxxxxxxxxxxxxx
LLM_TIMEOUT=30
```

**推荐模型**：
- `doubao-lite-32k` - 轻量版（推荐）
- `doubao-pro-32k` - 专业版

---

### 5. OpenAI

**获取 API Key**：
1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 进入"API keys"页面
4. 创建新的 Secret Key

**配置**：
```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.openai.com
LLM_MODEL=gpt-3.5-turbo
LLM_API_KEY=sk-xxxxxxxxxxxxxxxx
LLM_TIMEOUT=30
```

**推荐模型**：
- `gpt-3.5-turbo` - 性价比高（推荐）
- `gpt-4` - 最强能力
- `gpt-4-turbo` - 最新模型

---

### 6. 本地 Ollama（默认）

如果你使用本地 Ollama，配置如下：

```env
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=deepseek-r1:1.5b
LLM_API_KEY=
LLM_TIMEOUT=30
```

---

## 🧪 测试配置

### 1. 检查后端日志

启动后端后，查看日志确认配置正确：

```bash
cd backend
uvicorn app.main:app --reload
```

应该看到：
```
🤖 LLM Provider: openai
🔗 LLM Base URL: https://api.deepseek.com
🤖 LLM Model: deepseek-chat
🔑 LLM API Key: ********
```

### 2. 测试 API

访问 **http://localhost:8000/docs**，找到 `/api/llm/explain` 端点：

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

### 3. 前端测试

1. 访问 **http://localhost:3000**
2. 点击任意算法卡片
3. 切换到"动态演示"标签
4. 点击"✨ AI 解说"按钮
5. 等待几秒钟，应该看到 AI 生成的解说词

---

## 🐛 常见问题

### 问题 1：404 Not Found

**原因**：API URL 不正确

**解决**：
- 检查 `LLM_BASE_URL` 是否正确
- 确认 URL 末尾不要加 `/`
- 例如：`https://api.deepseek.com` ✅ 正确
- 例如：`https://api.deepseek.com/` ❌ 错误

### 问题 2：401 Unauthorized

**原因**：API Key 不正确或未设置

**解决**：
- 检查 `LLM_API_KEY` 是否正确
- 确认 API Key 没有多余的空格
- 确认 API Key 没有过期

### 问题 3：429 Too Many Requests

**原因**：请求频率超限

**解决**：
- 等待几分钟后重试
- 检查 LLM 提供商的配额限制
- 考虑升级到付费套餐

### 问题 4：500 Internal Server Error

**原因**：LLM 服务返回错误

**解决**：
- 查看后端日志：`tail -f backend/logs/app.log`
- 检查错误信息
- 确认模型名称正确
- 确认 API 配额充足

---

## 📊 配置对比

| 提供商 | 价格 | 速度 | 质量 | 中文支持 |
|--------|------|------|------|----------|
| DeepSeek | 💰 便宜 | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ 优秀 |
| 通义千问 | 💰💰 中等 | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ 优秀 |
| 文心一言 | 💰💰 中等 | ⚡⚡ | ⭐⭐⭐ | ✅ 优秀 |
| 豆包 | 💰 便宜 | ⚡⚡⚡ | ⭐⭐⭐ | ✅ 优秀 |
| OpenAI | 💰💰💰 贵 | ⚡⚡ | ⭐⭐⭐⭐⭐ | ⚠️ 一般 |
| Ollama | 🆓 免费 | ⚡⚡ | ⭐⭐⭐ | ✅ 优秀 |

---

## 🔒 安全建议

1. **不要提交 .env 到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - 使用 `.env.example.cloud` 作为模板

2. **保护 API Key**
   - 不要硬编码在代码中
   - 不要分享给他人
   - 定期轮换 API Key

3. **设置配额限制**
   - 在 LLM 提供商控制台设置月度配额
   - 避免意外产生高额费用

4. **监控使用情况**
   - 定期检查 API 调用日志
   - 监控费用支出
   - 设置告警通知

---

## 📝 配置示例

### 示例 1：DeepSeek（推荐）

```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-abc123def456
LLM_TIMEOUT=30
```

### 示例 2：通义千问

```env
LLM_PROVIDER=openai
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode
LLM_MODEL=qwen-turbo
LLM_API_KEY=sk-abc123def456
LLM_TIMEOUT=30
```

### 示例 3：本地 Ollama

```env
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=deepseek-r1:1.5b
LLM_API_KEY=
LLM_TIMEOUT=30
```

---

## 🎯 总结

1. **复制配置模板**：`cp .env.example.cloud .env`
2. **填写配置信息**：根据你的 LLM 提供商填写
3. **重启后端**：`uvicorn app.main:app --reload`
4. **测试 API**：访问 http://localhost:8000/docs
5. **前端测试**：访问 http://localhost:3000

如有问题，查看 `backend/logs/app.log` 日志文件。
