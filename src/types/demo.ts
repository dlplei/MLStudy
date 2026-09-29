/**
 * 算法演示数据结构定义 (Data Contract v2)
 * 
 * 统一的数据契约，确保无论数据来自本地 JSON 还是后端 API，
 * 前端消费的数据结构绝对稳定。
 * 
 * Phase 2 更新：
 * - 新增 plainExplanation: 面向非技术人员的通俗解说词
 * - 新增 actionLabel: 按钮文案（如"继续迭代"）
 * - 新增 visualizationData: 图表渲染所需的核心数据
 * - 新增 metadata: 步骤元信息（耗时、来源等）
 */

// ==================== 基础类型 ====================

export interface StepDescription {
  zh: string;
  en: string;
}

/** 步骤元信息 - 用于日志追踪和调试 */
export interface StepMetadata {
  /** 数据生成耗时（毫秒） */
  generationTimeMs: number;
  /** 数据来源：'cache' | 'compute' | 'api' */
  source: 'cache' | 'compute' | 'api';
  /** 缓存命中时的缓存 Key */
  cacheKey?: string;
  /** 数据版本号 */
  version: string;
  /** 通俗解说词来源 */
  explanationSource?: 'preset' | 'llm' | 'fallback';
  /** LLM 生成耗时（毫秒） */
  llmGenerationTimeMs?: number;
  /** LLM 模型名称 */
  llmModel?: string;
}

/** LLM 请求配置 */
export interface LLMRequestConfig {
  /** 模型名称 */
  model: string;
  /** 提示词 */
  prompt: string;
  /** 语言 */
  language: 'zh' | 'en';
  /** 最大 token 数 */
  maxTokens?: number;
  /** 温度参数 */
  temperature?: number;
  /** 超时时间（毫秒） */
  timeoutMs?: number;
}

/** LLM 响应 */
export interface LLMResponse {
  /** 响应状态 */
  status: 'success' | 'error' | 'timeout';
  /** 生成的文本 */
  text?: string;
  /** 错误信息 */
  error?: string;
  /** 响应耗时（毫秒） */
  responseTimeMs: number;
  /** 使用的 token 数 */
  tokensUsed?: number;
  /** 请求 ID */
  requestId: string;
}

/** LLM 日志条目 */
export interface LLMLogEntry {
  /** 请求 ID */
  request_id: string;
  /** 模型名称 */
  model: string;
  /** 算法名称 */
  algorithm_name: string;
  /** 步骤索引 */
  step_index: number;
  /** 语言 */
  language: 'zh' | 'en';
  /** 执行耗时（毫秒） */
  execution_time_ms: number;
  /** 状态 */
  status: 'success' | 'error' | 'timeout';
  /** 使用的 token 数 */
  tokens_used?: number;
  /** 错误信息 */
  error?: string;
  /** 提示词长度 */
  prompt_length: number;
  /** 响应长度 */
  response_length?: number;
}

// ==================== 核心数据契约 ====================

/**
 * 演示快照 - 某一时刻的完整状态
 * 这是前端消费的核心数据结构，必须保持稳定
 */
export interface DemoSnapshot {
  /** 当前步骤索引（从0开始） */
  stepIndex: number;
  /** 步骤标题 */
  title: StepDescription;
  /** 技术性描述（面向开发者/学习者） */
  description: StepDescription;
  /** 通俗解说词（面向非技术人员，Phase 3 将由 LLM 生成） */
  plainExplanation: StepDescription;
  /** 按钮文案 */
  actionLabel: StepDescription;
  /** 图表渲染所需的核心数据 */
  visualizationData: Record<string, unknown>;
  /** 步骤元信息 */
  stepMeta: StepMetadata;
}

/**
 * 演示配置 - 一个算法的完整演示定义
 */
export interface DemoConfig {
  /** 算法唯一标识 */
  algorithmId: string;
  /** 演示标题 */
  title: StepDescription;
  /** 总步骤数 */
  totalSteps: number;
  /** 所有步骤的快照数据 */
  snapshots: DemoSnapshot[];
  /** 演示参数（用于缓存 Key 生成） */
  params?: Record<string, unknown>;
}

// ==================== 演示状态 ====================

export interface DemoState {
  currentStep: number;
  isPlaying: boolean;
  isComplete: boolean;
  isLoading: boolean;
  currentSnapshot: DemoSnapshot | null;
  error: string | null;
  /** 是否处于降级模式 */
  isDegraded: boolean;
  /** 是否正在生成 AI 解说词 */
  isGeneratingExplanation?: boolean;
}

export interface DemoActions {
  next: () => void;
  prev: () => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
  goToStep: (step: number) => void;
}

// ==================== API 响应契约 ====================

/**
 * 模拟后端 API 的统一响应格式
 * 未来接入真实后端时，前端无需修改消费逻辑
 */
export interface DemoApiResponse<T = DemoConfig> {
  /** 响应状态码 */
  status: 'success' | 'error' | 'timeout';
  /** 响应数据 */
  result: T | null;
  /** 错误信息 */
  error?: string;
  /** 响应耗时 */
  responseTimeMs: number;
  /** 是否命中缓存 */
  cached: boolean;
  /** 请求追踪 ID */
  requestId: string;
}

// ==================== 具体算法的数据类型 ====================

// K-Means
export interface KMeansPoint {
  x: number;
  y: number;
  cluster: number;
}

export interface KMeansVisualizationData {
  points: KMeansPoint[];
  centers: { x: number; y: number; id: number }[];
  converged: boolean;
}

// 线性回归
export interface LinearRegressionPoint {
  x: number;
  y: number;
  predicted?: number;
  residual?: number;
}

export interface LinearRegressionVisualizationData {
  points: LinearRegressionPoint[];
  weights: { w: number; b: number };
  loss: number;
  learningRate: number;
  iteration: number;
}

// 决策树
export interface TreeNode {
  id: string;
  type: 'root' | 'split' | 'leaf';
  feature?: string;
  threshold?: string | number;
  label?: string;
  samples: number;
  left?: string;
  right?: string;
}

export interface TreeEdge {
  from: string;
  to: string;
  condition: string;
}

export interface DecisionTreeVisualizationData {
  data: Array<{ weight: number; color: string; label: string }>;
  currentFeature: string | null;
  currentThreshold: string | number | null;
  leftData: Array<{ weight: number; color: string; label: string }>;
  rightData: Array<{ weight: number; color: string; label: string }>;
  treeStructure: {
    nodes: TreeNode[];
    edges: TreeEdge[];
  };
  complete?: boolean;
}

// KNN（预留）
export interface KNNVisualizationData {
  trainingPoints: { x: number; y: number; label: number }[];
  queryPoint: { x: number; y: number } | null;
  neighbors: { x: number; y: number; label: number; distance: number }[];
  prediction: number | null;
  k: number;
}

// 逻辑回归（预留）
export interface LogisticRegressionVisualizationData {
  points: { x: number; y: number; label: number; predicted?: number }[];
  weights: { w1: number; w2: number; b: number };
  decisionBoundary: { x1: number; y1: number; x2: number; y2: number }[];
  loss: number;
  accuracy: number;
  iteration: number;
}

// SVM（支持向量机）
export interface SVMPoint {
  x: number;
  y: number;
  label: number; // -1 或 1
  isSupportVector?: boolean;
}

export interface SVMVisualizationData {
  points: SVMPoint[];
  supportVectors: SVMPoint[];
  weights: { w1: number; w2: number; b: number };
  margin: number;
  kernel: 'linear' | 'rbf' | 'poly';
  accuracy: number;
  complete?: boolean;
}
