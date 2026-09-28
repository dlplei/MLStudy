/**
 * API 客户端配置
 * 通过环境变量控制是否使用真实后端 API
 */

/** 后端 API 基础 URL */
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - Vite 环境变量
    return import.meta.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000');

/** 是否启用真实 API（默认 false，使用模拟数据） */
export const USE_REAL_API = getEnvVar('VITE_USE_REAL_API', 'false') === 'true';

/** API 请求超时时间（毫秒） */
export const API_TIMEOUT = 30000;

/**
 * 通用 API 请求方法
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    timeout?: number;
  }
): Promise<T> {
  const { method = 'GET', body, timeout = API_TIMEOUT } = options || {};
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Network error');
  }
}
