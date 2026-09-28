/**
 * 结构化日志服务
 * 
 * 模拟服务器端 debug 日志记录，为未来接入真实后端做准备。
 * 日志格式遵循结构化标准，便于后续接入日志分析系统。
 */

import type { LLMLogEntry } from '../types/demo';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data: Record<string, unknown>;
  requestId?: string;
}

export interface DemoLogEntry {
  algorithm_name: string;
  parameters: Record<string, unknown>;
  execution_time_ms: number;
  source: 'cache' | 'compute' | 'api';
  cache_hit: boolean;
  cache_key: string;
  request_id: string;
  total_steps: number;
  error?: string;
}

export type { LLMLogEntry };

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs: number;
  private readonly enabled: boolean;

  constructor(maxLogs: number = 1000, enabled: boolean = true) {
    this.maxLogs = maxLogs;
    this.enabled = enabled;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(level: LogLevel, category: string, message: string, data: Record<string, unknown> = {}, requestId?: string): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      requestId,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 开发环境输出到控制台
    const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
    if (isDev) {
      const prefix = `[${entry.level}] [${entry.category}]`;
      const logFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
      logFn(`${prefix} ${message}`, data);
    }
  }

  debug(category: string, message: string, data: Record<string, unknown> = {}, requestId?: string): void {
    this.log('DEBUG', category, message, data, requestId);
  }

  info(category: string, message: string, data: Record<string, unknown> = {}, requestId?: string): void {
    this.log('INFO', category, message, data, requestId);
  }

  warn(category: string, message: string, data: Record<string, unknown> = {}, requestId?: string): void {
    this.log('WARN', category, message, data, requestId);
  }

  error(category: string, message: string, data: Record<string, unknown> = {}, requestId?: string): void {
    this.log('ERROR', category, message, data, requestId);
  }

  logDemoRequest(entry: DemoLogEntry): void {
    const level = entry.error ? 'ERROR' : 'INFO';
    this.log(level, 'DEMO_REQUEST', `Demo request: ${entry.algorithm_name}`, entry as unknown as Record<string, unknown>, entry.request_id);
  }

  /** 记录 LLM 调用日志（结构化格式） */
  logLLMCall(entry: LLMLogEntry): void {
    const level = entry.status === 'error' ? 'ERROR' : entry.status === 'timeout' ? 'WARN' : 'INFO';
    this.log(level, 'LLM_CALL', `LLM call: ${entry.model} for ${entry.algorithm_name}[${entry.step_index}]`, entry as unknown as Record<string, unknown>, entry.request_id);
  }

  newRequestId(): string {
    return this.generateRequestId();
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  clear(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
