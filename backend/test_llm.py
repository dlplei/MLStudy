#!/usr/bin/env python3
"""
测试 LLM API 连接
"""
import os
import sys
import httpx
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_llm_api():
    """测试 LLM API"""
    provider = os.getenv('LLM_PROVIDER', 'ollama')
    base_url = os.getenv('LLM_BASE_URL', 'http://localhost:11434')
    model = os.getenv('LLM_MODEL', 'deepseek-r1:1.5b')
    api_key = os.getenv('LLM_API_KEY', '')
    
    print("=" * 60)
    print("🧪 LLM API 测试")
    print("=" * 60)
    print(f"Provider: {provider}")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    print(f"API Key: {'*' * 8 if api_key else '未设置'}")
    print("=" * 60)
    print()
    
    if provider == 'openai':
        return test_openai_api(base_url, model, api_key)
    else:
        return test_ollama_api(base_url, model)


def test_ollama_api(base_url: str, model: str):
    """测试 Ollama API"""
    print("📡 测试 Ollama API...")
    
    # 1. 检查服务是否运行
    try:
        response = httpx.get(f"{base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama 服务运行正常")
            models = response.json().get('models', [])
            print(f"   可用模型数量: {len(models)}")
            for m in models[:5]:  # 显示前5个
                print(f"   - {m.get('name')}")
        else:
            print(f"❌ Ollama 服务返回: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法连接 Ollama: {e}")
        return False
    
    # 2. 检查模型是否存在
    print(f"\n🔍 检查模型: {model}")
    try:
        response = httpx.get(f"{base_url}/api/tags", timeout=5)
        models = response.json().get('models', [])
        model_names = [m.get('name') for m in models]
        
        if model in model_names:
            print(f"✅ 模型存在: {model}")
        else:
            print(f"❌ 模型不存在: {model}")
            print(f"   可用模型: {', '.join(model_names[:10])}")
            return False
    except Exception as e:
        print(f"❌ 检查模型失败: {e}")
        return False
    
    # 3. 测试生成
    print(f"\n🧪 测试生成...")
    try:
        response = httpx.post(
            f"{base_url}/api/generate",
            json={
                'model': model,
                'prompt': '你好，请用一句话介绍自己',
                'stream': False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result.get('response', '')
            print(f"✅ 生成成功")
            print(f"   响应: {text[:100]}...")
            return True
        else:
            print(f"❌ 生成失败: {response.status_code}")
            print(f"   错误: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 生成测试失败: {e}")
        return False


def test_openai_api(base_url: str, model: str, api_key: str):
    """测试 OpenAI 兼容 API"""
    print("📡 测试 OpenAI 兼容 API...")
    
    if not api_key:
        print("❌ API Key 未设置")
        return False
    
    # 1. 检查服务是否可访问
    print(f"\n🔍 检查 API 端点...")
    try:
        # 尝试访问 models 端点（如果存在）
        response = httpx.get(
            f"{base_url}/models",
            headers={'Authorization': f'Bearer {api_key}'},
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ API 端点可访问")
            try:
                models = response.json().get('data', [])
                print(f"   可用模型数量: {len(models)}")
                for m in models[:]:
                    print(f"   - {m.get('id')}")
                    #print(f"   - {m}")
            except:
                print("   (无法解析模型列表)")
        elif response.status_code == 404:
            print("⚠️  /v1/models 端点不存在（某些服务可能不支持）")
            print("   继续测试生成...")
        else:
            print(f"⚠️  API 返回: {response.status_code}")
    except Exception as e:
        print(f"⚠️  检查失败: {e}")
        print("   继续测试生成...")
    
    # 2. 测试生成
    print(f"\n🧪 测试生成（模型: {model}）...")
    try:
        response = httpx.post(
            f"{base_url}/chat/completions",
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': [
                    {'role': 'user', 'content': '你好，请用一句话介绍自己'}
                ],
                'temperature': 0.7,
                'max_tokens': 100
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            choices = result.get('choices', [])
            if choices:
                text = choices[0].get('message', {}).get('content', '')
                print(f"✅ 生成成功")
                print(f"   响应: {text[:100]}...")
                return True
            else:
                print(f"❌ 响应格式错误")
                return False
        elif response.status_code == 404:
            print(f"❌ 404 Not Found")
            print(f"   可能原因:")
            print(f"   1. 模型名称不正确: {model}")
            print(f"   2. API URL 路径不对")
            print(f"   3. 该模型在此服务上不存在")
            print(f"\n   错误详情: {response.text}")
            return False
        elif response.status_code == 401:
            print(f"❌ 401 Unauthorized")
            print(f"   API Key 不正确或已过期")
            return False
        elif response.status_code == 429:
            print(f"❌ 429 Too Many Requests")
            print(f"   请求频率超限，请稍后重试")
            return False
        else:
            print(f"❌ 生成失败: {response.status_code}")
            print(f"   错误: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 生成测试失败: {e}")
        return False


if __name__ == '__main__':
    success = test_llm_api()
    print("\n" + "=" * 60)
    if success:
        print("✅ 所有测试通过！LLM API 工作正常。")
    else:
        print("❌ 测试失败，请检查配置。")
        print("\n💡 建议：")
        print("   1. 检查 backend/.env 中的 LLM_MODEL 是否正确")
        print("   2. 查看云端服务文档，确认支持的模型名称")
        print("   3. 确认 LLM_BASE_URL 是否正确")
        print("   4. 确认 LLM_API_KEY 是否有效")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
