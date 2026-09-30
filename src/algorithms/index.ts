/**
 * 算法核心实现 - 纯前端版本
 * 用于交互式参数调节和对比学习
 */

// ==================== K-Means 实现 ====================

export interface KMeansParams {
  k: number;
  maxIterations: number;
  initialization: 'random' | 'kmeans++';
}

export interface KMeansResult {
  centers: Array<{ x: number; y: number }>;
  labels: number[];
  iterations: number;
  converged: boolean;
  inertia: number; // 所有点到其中心的距离平方和
}

/**
 * K-Means 算法实现
 */
export function runKMeans(
  points: Array<{ x: number; y: number }>,
  params: KMeansParams
): KMeansResult {
  const { k, maxIterations, initialization } = params;
  const n = points.length;

  // 初始化中心
  let centers: Array<{ x: number; y: number }>;
  if (initialization === 'kmeans++') {
    centers = kMeansPlusPlusInit(points, k);
  } else {
    centers = randomInit(points, k);
  }

  let labels = new Array(n).fill(-1);
  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;

    // 分配步骤：将每个点分配到最近的中心
    const newLabels = points.map((p) => {
      let minDist = Infinity;
      let label = 0;
      centers.forEach((c, idx) => {
        const dist = distance(p, c);
        if (dist < minDist) {
          minDist = dist;
          label = idx;
        }
      });
      return label;
    });

    // 检查是否收敛
    if (arraysEqual(labels, newLabels)) {
      converged = true;
      labels = newLabels;
      break;
    }
    labels = newLabels;

    // 更新步骤：重新计算中心
    const newCenters = centers.map((_, idx) => {
      const clusterPoints = points.filter((_, i) => labels[i] === idx);
      if (clusterPoints.length === 0) return centers[idx];
      return {
        x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
        y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
      };
    });
    centers = newCenters;
  }

  // 计算 inertia
  const inertia = points.reduce((sum, p, i) => {
    const center = centers[labels[i]];
    return sum + distance(p, center);
  }, 0);

  return { centers, labels, iterations, converged, inertia };
}

function randomInit(points: Array<{ x: number; y: number }>, k: number) {
  const indices = new Set<number>();
  while (indices.size < k) {
    indices.add(Math.floor(Math.random() * points.length));
  }
  return Array.from(indices).map((i) => ({ ...points[i] }));
}

function kMeansPlusPlusInit(points: Array<{ x: number; y: number }>, k: number) {
  const centers: Array<{ x: number; y: number }> = [];
  // 随机选择第一个中心
  centers.push({ ...points[Math.floor(Math.random() * points.length)] });

  for (let i = 1; i < k; i++) {
    // 计算每个点到最近中心的距离
    const distances = points.map((p) => {
      const minDist = Math.min(...centers.map((c) => distance(p, c)));
      return minDist * minDist;
    });
    // 按距离平方概率选择下一个中心
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalDist;
    for (let j = 0; j < points.length; j++) {
      r -= distances[j];
      if (r <= 0) {
        centers.push({ ...points[j] });
        break;
      }
    }
  }
  return centers;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ==================== 线性回归实现 ====================

export interface LinearRegressionParams {
  learningRate: number;
  iterations: number;
  regularization: number; // L2 正则化系数
}

export interface LinearRegressionResult {
  w: number;
  b: number;
  lossHistory: number[];
  finalLoss: number;
  r2: number; // R² 分数
}

/**
 * 线性回归 - 梯度下降实现
 */
export function runLinearRegression(
  points: Array<{ x: number; y: number }>,
  params: LinearRegressionParams
): LinearRegressionResult {
  const { learningRate, iterations, regularization } = params;
  const n = points.length;

  let w = 0;
  let b = 0;
  const lossHistory: number[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    // 计算梯度
    let dw = 0;
    let db = 0;
    let loss = 0;

    for (const p of points) {
      const predicted = w * p.x + b;
      const error = predicted - p.y;
      dw += (2 / n) * error * p.x;
      db += (2 / n) * error;
      loss += error * error;
    }

    // 添加 L2 正则化
    dw += (2 * regularization * w) / n;
    loss /= n;
    loss += (regularization * w * w) / n;

    lossHistory.push(loss);

    // 更新参数
    w -= learningRate * dw;
    b -= learningRate * db;
  }

  // 计算 R²
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / n;
  const ssRes = points.reduce((sum, p) => {
    const predicted = w * p.x + b;
    return sum + (p.y - predicted) ** 2;
  }, 0);
  const ssTot = points.reduce((sum, p) => sum + (p.y - yMean) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  return {
    w,
    b,
    lossHistory,
    finalLoss: lossHistory[lossHistory.length - 1] || 0,
    r2,
  };
}

// ==================== 决策树实现 ====================

export interface DecisionTreeParams {
  maxDepth: number;
  minSamplesSplit: number;
  criterion: 'gini' | 'entropy';
}

export interface DecisionTreeNode {
  feature?: string;
  threshold?: number;
  label?: string;
  samples: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  isLeaf: boolean;
  impurity: number;
}

export interface DecisionTreeResult {
  root: DecisionTreeNode;
  depth: number;
  totalNodes: number;
  accuracy: number;
}

/**
 * 决策树实现（简化版，用于可视化）
 */
export function runDecisionTree(
  data: Array<{ weight: number; color: string; label: string }>,
  params: DecisionTreeParams
): DecisionTreeResult {
  const { maxDepth, minSamplesSplit, criterion } = params;

  function buildTree(
    data: Array<{ weight: number; color: string; label: string }>,
    depth: number
  ): DecisionTreeNode {
    const labels = data.map((d) => d.label);
    const uniqueLabels = [...new Set(labels)];

    // 纯节点或达到最大深度
    if (uniqueLabels.length === 1 || depth >= maxDepth || data.length < minSamplesSplit) {
      const labelCounts: Record<string, number> = {};
      labels.forEach((l) => (labelCounts[l] = (labelCounts[l] || 0) + 1));
      const majorityLabel = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0][0];
      return {
        label: majorityLabel,
        samples: data.length,
        isLeaf: true,
        impurity: calculateImpurity(labels, criterion),
      };
    }

    // 寻找最佳分裂
    let bestSplit: { feature: string; threshold: number; gain: number } | null = null;
    const currentImpurity = calculateImpurity(labels, criterion);

    // 尝试按颜色分裂
    const colorValues = [...new Set(data.map((d) => d.color))];
    for (const color of colorValues) {
      const left = data.filter((d) => d.color === color);
      const right = data.filter((d) => d.color !== color);
      if (left.length === 0 || right.length === 0) continue;

      const gain = calculateInfoGain(labels, left, right, criterion);
      if (!bestSplit || gain > bestSplit.gain) {
        bestSplit = { feature: 'color', threshold: 0, gain };
      }
    }

    // 尝试按重量分裂
    const weights = [...new Set(data.map((d) => d.weight))].sort((a, b) => a - b);
    for (let i = 0; i < weights.length - 1; i++) {
      const threshold = (weights[i] + weights[i + 1]) / 2;
      const left = data.filter((d) => d.weight < threshold);
      const right = data.filter((d) => d.weight >= threshold);
      if (left.length === 0 || right.length === 0) continue;

      const gain = calculateInfoGain(labels, left, right, criterion);
      if (!bestSplit || gain > bestSplit.gain) {
        bestSplit = { feature: 'weight', threshold, gain };
      }
    }

    if (!bestSplit) {
      const labelCounts: Record<string, number> = {};
      labels.forEach((l) => (labelCounts[l] = (labelCounts[l] || 0) + 1));
      const majorityLabel = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0][0];
      return {
        label: majorityLabel,
        samples: data.length,
        isLeaf: true,
        impurity: currentImpurity,
      };
    }

    // 分裂
    let leftData: typeof data;
    let rightData: typeof data;
    if (bestSplit.feature === 'color') {
      // 简化：选择第一个颜色值
      const colorValue = colorValues[0];
      leftData = data.filter((d) => d.color === colorValue);
      rightData = data.filter((d) => d.color !== colorValue);
    } else {
      leftData = data.filter((d) => d.weight < bestSplit.threshold);
      rightData = data.filter((d) => d.weight >= bestSplit.threshold);
    }

    return {
      feature: bestSplit.feature,
      threshold: bestSplit.feature === 'weight' ? bestSplit.threshold : undefined,
      samples: data.length,
      isLeaf: false,
      impurity: currentImpurity,
      left: buildTree(leftData, depth + 1),
      right: buildTree(rightData, depth + 1),
    };
  }

  const root = buildTree(data, 0);

  // 计算深度和节点数
  function getDepth(node: DecisionTreeNode): number {
    if (node.isLeaf) return 0;
    return 1 + Math.max(getDepth(node.left!), getDepth(node.right!));
  }

  function countNodes(node: DecisionTreeNode): number {
    if (node.isLeaf) return 1;
    return 1 + countNodes(node.left!) + countNodes(node.right!);
  }

  // 计算准确率
  function predict(node: DecisionTreeNode, sample: typeof data[0]): string {
    if (node.isLeaf) return node.label!;
    if (node.feature === 'color') {
      // 简化预测
      return sample.color === 'orange' ? 'orange' : predict(node.left!, sample);
    } else {
      return sample.weight < (node.threshold || 0)
        ? predict(node.left!, sample)
        : predict(node.right!, sample);
    }
  }

  const correct = data.filter((d) => predict(root, d) === d.label).length;
  const accuracy = correct / data.length;

  return {
    root,
    depth: getDepth(root),
    totalNodes: countNodes(root),
    accuracy,
  };
}

function calculateImpurity(labels: string[], criterion: 'gini' | 'entropy'): number {
  const counts: Record<string, number> = {};
  labels.forEach((l) => (counts[l] = (counts[l] || 0) + 1));
  const n = labels.length;

  if (criterion === 'gini') {
    return 1 - Object.values(counts).reduce((sum, c) => sum + (c / n) ** 2, 0);
  } else {
    return -Object.values(counts).reduce((sum, c) => {
      const p = c / n;
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
  }
}

function calculateInfoGain(
  parentLabels: string[],
  left: Array<{ label: string }>,
  right: Array<{ label: string }>,
  criterion: 'gini' | 'entropy'
): number {
  const n = parentLabels.length;
  const parentImpurity = calculateImpurity(parentLabels, criterion);
  const leftImpurity = calculateImpurity(left.map((d) => d.label), criterion);
  const rightImpurity = calculateImpurity(right.map((d) => d.label), criterion);

  const weightedImpurity = (left.length / n) * leftImpurity + (right.length / n) * rightImpurity;
  return parentImpurity - weightedImpurity;
}

// ==================== SVM 实现（简化版） ====================

export interface SVMParams {
  C: number; // 正则化参数
  kernel: 'linear' | 'rbf';
  gamma: number; // RBF 核参数
  iterations: number;
}

export interface SVMResult {
  weights: { w1: number; w2: number; b: number };
  supportVectors: Array<{ x: number; y: number; label: number }>;
  accuracy: number;
  margin: number;
}

/**
 * SVM 简化实现（用于可视化）
 */
export function runSVM(
  points: Array<{ x: number; y: number; label: number }>,
  params: SVMParams
): SVMResult {
  const { C, iterations } = params;
  const n = points.length;

  // 简化的梯度下降 SVM
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  const learningRate = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    for (const p of points) {
      const y = p.label === 1 ? 1 : -1;
      const margin = y * (w1 * p.x + w2 * p.y + b);

      if (margin >= 1) {
        // 正确分类，只更新正则化项
        w1 -= learningRate * (2 * C * w1);
        w2 -= learningRate * (2 * C * w2);
      } else {
        // 错误分类，更新所有项
        w1 -= learningRate * (2 * C * w1 - y * p.x);
        w2 -= learningRate * (2 * C * w2 - y * p.y);
        b -= learningRate * (-y);
      }
    }
  }

  // 找支持向量（距离边界最近的点）
  const margins = points.map((p) => {
    const y = p.label === 1 ? 1 : -1;
    return {
      ...p,
      margin: y * (w1 * p.x + w2 * p.y + b),
    };
  });

  const sortedMargins = [...margins].sort((a, b) => a.margin - b.margin);
  const supportVectors = sortedMargins.slice(0, Math.min(4, n)).map((p) => ({
    x: p.x,
    y: p.y,
    label: p.label,
  }));

  // 计算准确率
  let correct = 0;
  for (const p of points) {
    const prediction = w1 * p.x + w2 * p.y + b;
    const predictedLabel = prediction >= 0 ? 1 : 0;
    if (predictedLabel === p.label) correct++;
  }
  const accuracy = correct / n;

  // 计算间隔
  const margin = 2 / Math.sqrt(w1 * w1 + w2 * w2);

  return {
    weights: { w1, w2, b },
    supportVectors,
    accuracy,
    margin: isFinite(margin) ? margin : 0,
  };
}

// ==================== 示例数据生成 ====================

export function generateKMeansData(n: number = 30, clusters: number = 3) {
  const points: Array<{ x: number; y: number }> = [];
  const centers = [
    { x: 2, y: 2 },
    { x: 7, y: 7 },
    { x: 8, y: 2 },
    { x: 2, y: 8 },
    { x: 5, y: 5 },
  ];

  for (let i = 0; i < n; i++) {
    const clusterIdx = i % clusters;
    const center = centers[clusterIdx];
    points.push({
      x: center.x + (Math.random() - 0.5) * 2,
      y: center.y + (Math.random() - 0.5) * 2,
    });
  }
  return points;
}

export function generateLinearData(n: number = 20, noise: number = 1) {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const x = (i / n) * 10;
    const y = 2.5 * x + 1 + (Math.random() - 0.5) * noise * 2;
    points.push({ x, y });
  }
  return points;
}

export function generateSVMData(n: number = 20) {
  const points: Array<{ x: number; y: number; label: number }> = [];
  for (let i = 0; i < n; i++) {
    if (i < n / 2) {
      points.push({
        x: 1 + Math.random() * 3,
        y: 1 + Math.random() * 3,
        label: 0,
      });
    } else {
      points.push({
        x: 5 + Math.random() * 3,
        y: 5 + Math.random() * 3,
        label: 1,
      });
    }
  }
  return points;
}
