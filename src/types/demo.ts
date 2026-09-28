/**
 * 算法演示数据结构定义
 * 所有演示算法都遵循此统一接口，确保前端消费数据时的稳定性
 */

// 演示步骤中的描述文本
export interface StepDescription {
  zh: string;
  en: string;
}

// 演示快照（某一时刻的状态）
export interface DemoSnapshot {
  stepIndex: number;
  title: StepDescription;
  description: StepDescription;
  // 不同算法有不同的数据字段，具体类型在消费时断言
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// 演示配置
export interface DemoConfig {
  algorithmId: string;
  title: StepDescription;
  totalSteps: number;
  snapshots: DemoSnapshot[];
}

// 演示状态
export interface DemoState {
  currentStep: number;
  isPlaying: boolean;
  isComplete: boolean;
  currentSnapshot: DemoSnapshot | null;
  error: string | null;
}

// 演示操作
export interface DemoActions {
  next: () => void;
  prev: () => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
  goToStep: (step: number) => void;
}

// ==================== 具体算法的数据类型 ====================

// K-Means 数据点
export interface KMeansPoint {
  x: number;
  y: number;
  cluster: number; // -1 表示未分配
}

// K-Means 快照数据
export interface KMeansSnapshotData {
  points: KMeansPoint[];
  centers: { x: number; y: number; id: number }[];
  converged: boolean;
}

// 线性回归数据点
export interface LinearRegressionPoint {
  x: number;
  y: number;
  predicted?: number;
  residual?: number;
}

// 线性回归快照数据
export interface LinearRegressionSnapshotData {
  points: LinearRegressionPoint[];
  weights: { w: number; b: number };
  loss: number;
  learningRate: number;
  iteration: number;
}

// 决策树快照数据
export interface DecisionTreeSnapshotData {
  splitFeature: string;
  splitThreshold: number;
  leftSamples: number;
  rightSamples: number;
  depth: number;
  nodes: TreeNode[];
}

export interface TreeNode {
  id: string;
  type: 'split' | 'leaf';
  feature?: string;
  threshold?: number;
  label?: string;
  samples: number;
  left?: string;
  right?: string;
}

// KNN 快照数据
export interface KNNSnapshotData {
  trainingPoints: { x: number; y: number; label: number }[];
  queryPoint: { x: number; y: number } | null;
  neighbors: { x: number; y: number; label: number; distance: number }[];
  prediction: number | null;
  k: number;
}

// 逻辑回归快照数据
export interface LogisticRegressionSnapshotData {
  points: { x: number; y: number; label: number; predicted?: number }[];
  weights: { w1: number; w2: number; b: number };
  decisionBoundary: { x1: number; y1: number; x2: number; y2: number }[];
  loss: number;
  accuracy: number;
  iteration: number;
}
