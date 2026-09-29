#!/bin/bash

echo "🔍 诊断 LLM 问题..."
echo ""

# 1. 检查 Ollama 是否运行
echo "1️⃣  检查 Ollama 服务..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama 运行正常"
else
    echo "   ❌ Ollama 未运行"
    echo "   请执行: ollama serve"
    exit 1
fi
echo ""

# 2. 列出已下载的模型
echo "2️⃣  已下载的模型："
ollama list | grep -v "NAME" | awk '{print "   - " $1}'
echo ""

# 3. 检查 .env 配置
echo "3️⃣  后端配置："
if [ -f backend/.env ]; then
    grep "OLLAMA_MODEL" backend/.env | sed 's/^/   /'
else
    echo "   ❌ backend/.env 不存在"
fi
echo ""

# 4. 测试模型是否可用
echo "4️⃣  测试模型..."
MODEL=$(grep "OLLAMA_MODEL" backend/.env | cut -d'=' -f2)
echo "   测试模型: $MODEL"

if curl -s http://localhost:11434/api/tags | grep -q "$MODEL"; then
    echo "   ✅ 模型已下载"
else
    echo "   ❌ 模型未下载"
    echo "   请执行: ollama pull $MODEL"
fi
echo ""

# 5. 测试生成
echo "5️⃣  测试生成（需要 10-30 秒）..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:11434/api/generate -d "{
  \"model\": \"$MODEL\",
  \"prompt\": \"你好\",
  \"stream\": false
}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ 生成成功"
else
    echo "   ❌ 生成失败 (HTTP $HTTP_CODE)"
fi
echo ""

echo "🎉 诊断完成！"
echo ""
echo "💡 建议："
echo "   1. 如果模型未下载，执行: ollama pull $MODEL"
echo "   2. 重启后端: cd backend && uvicorn app.main:app --reload"
echo "   3. 测试 API: http://localhost:8000/docs"
