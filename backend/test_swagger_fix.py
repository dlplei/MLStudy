#!/usr/bin/env python3
"""
测试 Swagger UI 修复
验证当 model 字段为空或为 "string" 时，API 是否使用默认模型
"""
import httpx
import json

BASE_URL = "http://localhost:8000"

def test_swagger_default_model():
    """测试 Swagger UI 场景：model 为 'string'"""
    print("=" * 60)
    print("🧪 测试 Swagger UI 场景（model='string'）")
    print("=" * 60)
    
    payload = {
        "algorithmName": "K-Means 聚类",
        "stepTitle": "随机初始化聚类中心",
        "technicalDescription": "随机选择3个数据点作为初始聚类中心",
        "stepIndex": 1,
        "totalSteps": 5,
        "language": "zh",
        "model": "string"  # Swagger UI 的默认值
    }
    
    print(f"\n📤 请求 payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    
    try:
        response = httpx.post(
            f"{BASE_URL}/api/llm/explain",
            json=payload,
            timeout=30
        )
        
        print(f"\n📥 响应状态: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 请求成功！")
            print(f"   状态: {result.get('status')}")
            print(f"   响应时间: {result.get('responseTimeMs')}ms")
            if result.get('text'):
                print(f"   生成内容: {result['text'][:100]}...")
            return True
        else:
            print(f"❌ 请求失败")
            print(f"   错误: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_empty_model():
    """测试 model 为空的情况"""
    print("\n" + "=" * 60)
    print("🧪 测试 model 为空的情况")
    print("=" * 60)
    
    payload = {
        "algorithmName": "K-Means 聚类",
        "stepTitle": "随机初始化聚类中心",
        "technicalDescription": "随机选择3个数据点作为初始聚类中心",
        "stepIndex": 1,
        "totalSteps": 5,
        "language": "zh"
        # model 字段不填
    }
    
    print(f"\n📤 请求 payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    
    try:
        response = httpx.post(
            f"{BASE_URL}/api/llm/explain",
            json=payload,
            timeout=30
        )
        
        print(f"\n📥 响应状态: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 请求成功！")
            print(f"   状态: {result.get('status')}")
            print(f"   响应时间: {result.get('responseTimeMs')}ms")
            if result.get('text'):
                print(f"   生成内容: {result['text'][:100]}...")
            return True
        else:
            print(f"❌ 请求失败")
            print(f"   错误: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_correct_model():
    """测试使用正确模型的情况"""
    print("\n" + "=" * 60)
    print("🧪 测试使用正确模型")
    print("=" * 60)
    
    # 从环境变量或配置文件读取默认模型
    # 这里使用一个常见的模型名作为示例
    payload = {
        "algorithmName": "K-Means 聚类",
        "stepTitle": "随机初始化聚类中心",
        "technicalDescription": "随机选择3个数据点作为初始聚类中心",
        "stepIndex": 1,
        "totalSteps": 5,
        "language": "zh",
        "model": "claude-haiku-4-5"  # 替换为你的实际模型
    }
    
    print(f"\n📤 请求 payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    
    try:
        response = httpx.post(
            f"{BASE_URL}/api/llm/explain",
            json=payload,
            timeout=30
        )
        
        print(f"\n📥 响应状态: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 请求成功！")
            print(f"   状态: {result.get('status')}")
            print(f"   响应时间: {result.get('responseTimeMs')}ms")
            if result.get('text'):
                print(f"   生成内容: {result['text'][:100]}...")
            return True
        else:
            print(f"❌ 请求失败")
            print(f"   错误: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


if __name__ == "__main__":
    print("\n🚀 开始测试 Swagger UI 修复\n")
    
    results = []
    
    # 测试 1: Swagger UI 场景
    results.append(("Swagger UI (model='string')", test_swagger_default_model()))
    
    # 测试 2: model 为空
    results.append(("model 为空", test_empty_model()))
    
    # 测试 3: 正确模型
    results.append(("正确模型", test_correct_model()))
    
    # 打印总结
    print("\n" + "=" * 60)
    print("📊 测试总结")
    print("=" * 60)
    
    for name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"{status} - {name}")
    
    all_passed = all(success for _, success in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ 所有测试通过！Swagger UI 修复成功。")
    else:
        print("⚠️  部分测试失败，请检查后端日志。")
    print("=" * 60)
