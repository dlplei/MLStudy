/**
 * LLM 服务 (Phase 3)
 * 
 * 模拟 Ollama + DeepSeek API 调用，为演示步骤生成通俗解说词。
 * 
 * 设计说明：
 * - 当前为模拟实现，未来可替换为真实 API 调用
 * - 支持超时控制和错误处理
 * - 集成 LRU 缓存避免重复生成
 * - 完整的日志追踪
 * 
 * 未来接入真实 Ollama：
 * 1. 修改 callOllamaAPI 方法，替换模拟逻辑为真实 fetch
 * 2. 配置 OLLAMA_BASE_URL 指向实际服务器
 * 3. 调整超时时间和重试策略
 */

import { LRUCache } from './LRUCache';
import { logger } from './Logger';
import { apiRequest, USE_REAL_API } from './apiClient';
import type { LLMRequestConfig, LLMResponse, LLMLogEntry } from '../types/demo';

// ==================== 配置 ====================

/** Ollama API 基础 URL（未来替换为真实地址） */
const OLLAMA_BASE_URL = 'http://localhost:11434';

/** 默认模型 */
const DEFAULT_MODEL = 'deepseek-r1:1.5b';

/** 默认超时时间（毫秒） */
const DEFAULT_TIMEOUT_MS = 10000;

/** 模拟延迟范围（毫秒） */
const MIN_LATENCY_MS = 800;
const MAX_LATENCY_MS = 2500;

/** 模拟失败率（0-1，用于测试降级） */
const SIMULATED_FAILURE_RATE = 0.05;

// ==================== 缓存实例 ====================

/** LLM 响应缓存：key = `${model}:${language}:${promptHash}` */
const llmCache = new LRUCache<string>(100, 30 * 60 * 1000); // 30 分钟 TTL

// ==================== 提示词模板 ====================

interface ExplanationPrompt {
  algorithmName: string;
  stepTitle: string;
  technicalDescription: string;
  stepIndex: number;
  totalSteps: number;
}

/**
 * 生成通俗解说词的提示词
 */
function buildExplanationPrompt(
  context: ExplanationPrompt,
  language: 'zh' | 'en'
): string {
  const langInstruction = language === 'zh'
    ? '请用中文回答，使用简单易懂的比喻和日常生活中的例子。'
    : 'Please respond in English, using simple analogies and everyday examples.';

  return `你是一位优秀的机器学习科普老师。请为以下算法步骤生成一段通俗易懂的解说词。

算法名称：${context.algorithmName}
当前步骤：${context.stepTitle}（第 ${context.stepIndex + 1}/${context.totalSteps} 步）
技术描述：${context.technicalDescription}

要求：
1. 用 1-2 句话解释这个步骤在做什么
2. 使用生动的比喻或日常例子
3. 避免专业术语，让完全不懂技术的人也能理解
4. 语气友好、鼓励性

${langInstruction}

请直接输出解说词，不要添加任何前缀或解释。`;
}

/**
 * 计算提示词的哈希值（用于缓存 key）
 */
function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// ==================== 模拟 LLM 响应生成 ====================

/**
 * 模拟 LLM 生成通俗解说词
 * 基于模板和上下文生成合理的解说词
 */
function simulateLLMResponse(
  context: ExplanationPrompt,
  language: 'zh' | 'en'
): string {
  const templates = {
    zh: {
      'kmeans': [
        '想象你有一堆混在一起的红蓝绿三种颜色的球，现在要把它们分成三堆。',
        '我们先随便选三个球当"队长"，每个队长负责带领一队球。',
        '现在每个球都去找离自己最近的队长，站到那个队伍里。',
        '每个队长走到自己队伍的正中间，成为新的中心点。',
        '队长们不再移动了，分类完成！每个球都找到了自己的队伍。',
      ],
      'linear-regression': [
        '我们有一条水平的线，但它完全不符合数据的趋势。误差非常大。',
        '线开始倾斜了，正在慢慢靠近数据点的趋势方向。',
        '线越来越接近数据了，每个点到线的距离（误差）在变小。',
        '线已经很好地穿过了数据点的中间，误差很小了。',
        '完成了！这条线是所有可能的直线中，与数据点总体距离最小的一条。',
      ],
    },
    en: {
      'kmeans': [
        'Imagine you have a bunch of red, blue, and green balls mixed together, and you need to sort them into three piles.',
        'We randomly pick three balls as "team leaders", each responsible for leading a team.',
        'Now each ball finds the nearest team leader and joins that team.',
        'Each team leader moves to the exact center of their team.',
        'The leaders stop moving. Classification complete! Every ball has found its team.',
      ],
      'linear-regression': [
        'We have a horizontal line, but it doesn\'t match the data trend at all. The error is very large.',
        'The line is starting to tilt, slowly approaching the trend of the data points.',
        'The line is getting closer to the data. The distance (error) from each point to the line is shrinking.',
        'The line now passes nicely through the middle of the data points. The error is very small.',
        'Done! This line has the smallest overall distance to all data points among all possible lines.',
      ],
    },
  };

  const langTemplates = templates[language];
  const algoTemplates = langTemplates[context.algorithmName as keyof typeof langTemplates];

  if (algoTemplates && context.stepIndex < algoTemplates.length) {
    return algoTemplates[context.stepIndex];
  }

  // 默认模板
  return language === 'zh'
    ? `这一步是算法的关键环节，就像做菜时的调味一样重要。`
    : `This step is a crucial part of the algorithm, like seasoning when cooking.`;
}

// ==================== LLM 服务类 ====================

class LLMService {
  /**
   * 生成通俗解说词
   * 
   * 流程：
   * 1. 构建提示词
   * 2. 检查缓存
   * 3. 缓存命中 → 直接返回
   * 4. 缓存未命中 → 调用 LLM API
   * 5. 写入缓存
   * 6. 记录日志
   */
  /**
   * 从真实后端 API 生成解说词
   */
  private async generateFromRealAPI(
    context: ExplanationPrompt,
    language: 'zh' | 'en',
    model?: string
  ): Promise<LLMResponse> {
    const requestId = logger.newRequestId();
    const startTime = performance.now();
    
    try {
      const response = await apiRequest<{
        status: string;
        text?: string;
        error?: string;
        responseTimeMs: number;
        tokensUsed?: number;
        requestId: string;
      }>('/api/llm/explain', {
        method: 'POST',
        body: {
          algorithmName: context.algorithmName,
          stepTitle: context.stepTitle,
          technicalDescription: context.technicalDescription,
          stepIndex: context.stepIndex,
          totalSteps: context.totalSteps,
          language,
          model,
        },
      });
      
      const responseTime = Math.round(performance.now() - startTime);
      
      logger.info('LLM_SERVICE', 'Real API response', {
        responseTimeMs: responseTime,
        requestId,
      }, requestId);
      
      return {
        status: response.status as 'success' | 'error' | 'timeout',
        text: response.text,
        error: response.error,
        responseTimeMs: responseTime,
        tokensUsed: response.tokensUsed,
        requestId,
      };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('LLM_SERVICE', 'Real API failed', {
        error: errorMsg,
        responseTimeMs: responseTime,
        requestId,
      }, requestId);
      
      return {
        status: 'error',
        error: errorMsg,
        responseTimeMs: responseTime,
        requestId,
      };
    }
  }

  async generateExplanation(
    context: ExplanationPrompt,
    language: 'zh' | 'en',
    options?: {
      model?: string;
      timeoutMs?: number;
      forceRegenerate?: boolean;
    }
  ): Promise<LLMResponse> {
    // 如果启用真实 API，直接调用后端
    if (USE_REAL_API) {
      return this.generateFromRealAPI(context, language, options?.model);
    }

    // 否则使用模拟实现
    const requestId = logger.newRequestId();
    const startTime = performance.now();
    const model = options?.model || DEFAULT_MODEL;
    const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;

    // 构建提示词
    const prompt = buildExplanationPrompt(context, language);
    const promptHash = hashPrompt(prompt);
    const cacheKey = `${model}:${language}:${promptHash}`;

    logger.debug('LLM_SERVICE', `Generating explanation`, {
      algorithmName: context.algorithmName,
      stepIndex: context.stepIndex,
      language,
      model,
      requestId,
    }, requestId);

    try {
      // 检查缓存（除非强制重新生成）
      if (!options?.forceRegenerate) {
        const cached = llmCache.get(cacheKey);
        if (cached) {
          const responseTime = performance.now() - startTime;
          logger.info('LLM_SERVICE', `Cache HIT`, {
            cacheKey,
            responseTimeMs: Math.round(responseTime),
            requestId,
          }, requestId);

          this.logLLMCall({
            request_id: requestId,
            model,
            algorithm_name: context.algorithmName,
            step_index: context.stepIndex,
            language,
            execution_time_ms: Math.round(responseTime),
            status: 'success',
            tokens_used: cached.length,
            prompt_length: prompt.length,
            response_length: cached.length,
          });

          return {
            status: 'success',
            text: cached,
            responseTimeMs: Math.round(responseTime),
            tokensUsed: cached.length,
            requestId,
          };
        }
      }

      // 调用 LLM API（模拟）
      const response = await this.callOllamaAPI(prompt, model, timeoutMs, requestId);

      if (response.status === 'success' && response.text) {
        // 写入缓存
        llmCache.set(cacheKey, response.text);

        const responseTime = performance.now() - startTime;
        logger.info('LLM_SERVICE', `Generation complete`, {
          responseTimeMs: Math.round(responseTime),
          tokensUsed: response.tokensUsed,
          requestId,
        }, requestId);

        this.logLLMCall({
          request_id: requestId,
          model,
          algorithm_name: context.algorithmName,
          step_index: context.stepIndex,
          language,
          execution_time_ms: Math.round(responseTime),
          status: 'success',
          tokens_used: response.tokensUsed,
          prompt_length: prompt.length,
          response_length: response.text.length,
        });

        return {
          ...response,
          responseTimeMs: Math.round(responseTime),
        };
      }

      // 错误处理
      const responseTime = performance.now() - startTime;
      logger.error('LLM_SERVICE', `Generation failed`, {
        error: response.error,
        responseTimeMs: Math.round(responseTime),
        requestId,
      }, requestId);

      this.logLLMCall({
        request_id: requestId,
        model,
        algorithm_name: context.algorithmName,
        step_index: context.stepIndex,
        language,
        execution_time_ms: Math.round(responseTime),
        status: response.status as 'error' | 'timeout',
        prompt_length: prompt.length,
        error: response.error,
      });

      return {
        ...response,
        responseTimeMs: Math.round(responseTime),
      };
    } catch (err) {
      const responseTime = performance.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      logger.error('LLM_SERVICE', `Unexpected error`, {
        error: errorMsg,
        responseTimeMs: Math.round(responseTime),
        requestId,
      }, requestId);

      this.logLLMCall({
        request_id: requestId,
        model,
        algorithm_name: context.algorithmName,
        step_index: context.stepIndex,
        language,
        execution_time_ms: Math.round(responseTime),
        status: 'error',
        prompt_length: prompt.length,
        error: errorMsg,
      });

      return {
        status: 'error',
        error: errorMsg,
        responseTimeMs: Math.round(responseTime),
        requestId,
      };
    }
  }

  /**
   * 批量生成多个步骤的解说词
   * 用于预生成策略
   */
  async batchGenerateExplanations(
    contexts: ExplanationPrompt[],
    language: 'zh' | 'en',
    options?: {
      model?: string;
      concurrency?: number;
    }
  ): Promise<LLMResponse[]> {
    const concurrency = options?.concurrency || 3;
    const results: LLMResponse[] = [];

    // 分批并发处理
    for (let i = 0; i < contexts.length; i += concurrency) {
      const batch = contexts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((ctx) => this.generateExplanation(ctx, language, options))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return llmCache.getStats();
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    llmCache.clear();
    logger.info('LLM_SERVICE', 'Cache cleared');
  }

  // ==================== 内部方法 ====================

  /**
   * 调用 Ollama API（模拟实现）
   * 
   * 未来替换为真实 API 调用：
   * ```typescript
   * const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     model,
   *     prompt,
   *     stream: false,
   *     options: { temperature: 0.7, num_predict: 200 }
   *   }),
   *   signal: AbortSignal.timeout(timeoutMs),
   * });
   * const result = await response.json();
   * return { status: 'success', text: result.response, ... };
   * ```
   */
  private async callOllamaAPI(
    prompt: string,
    model: string,
    timeoutMs: number,
    requestId: string
  ): Promise<LLMResponse> {
    // 模拟网络延迟
    const latency = Math.floor(
      Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS) + MIN_LATENCY_MS
    );

    // 模拟超时
    if (latency > timeoutMs) {
      return {
        status: 'timeout',
        error: `Request timeout after ${timeoutMs}ms`,
        responseTimeMs: timeoutMs,
        requestId,
      };
    }

    // 模拟随机失败
    if (Math.random() < SIMULATED_FAILURE_RATE) {
      return {
        status: 'error',
        error: 'Simulated API error',
        responseTimeMs: latency,
        requestId,
      };
    }

    // 等待模拟延迟
    await new Promise((resolve) => setTimeout(resolve, latency));

    // 从提示词中提取上下文信息
    const algorithmMatch = prompt.match(/算法名称：(.+?)\n/);
    const algorithmName = algorithmMatch ? algorithmMatch[1].trim() : 'unknown';

    // 模拟 LLM 生成（基于模板）
    const language = prompt.includes('请用中文回答') ? 'zh' : 'en';
    const stepMatch = prompt.match(/第 (\d+)\/(\d+) 步/);
    const stepIndex = stepMatch ? parseInt(stepMatch[1]) - 1 : 0;
    const totalSteps = stepMatch ? parseInt(stepMatch[2]) : 5;

    const generatedText = simulateLLMResponse(
      {
        algorithmName,
        stepTitle: '',
        technicalDescription: '',
        stepIndex,
        totalSteps,
      },
      language
    );

    // 模拟 token 计数（粗略估计）
    const tokensUsed = Math.ceil(generatedText.length / 2);

    return {
      status: 'success',
      text: generatedText,
      responseTimeMs: latency,
      tokensUsed,
      requestId,
    };
  }

  /**
   * 记录 LLM 调用日志
   */
  private logLLMCall(entry: LLMLogEntry): void {
    logger.logLLMCall(entry);
  }
}

// 全局单例
export const llmService = new LLMService();
