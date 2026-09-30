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

// ==================== 逻辑回归实现 ====================

export interface LogisticRegressionParams {
  learningRate: number;
  iterations: number;
  regularization: number;
}

export interface LogisticRegressionResult {
  weights: number[];
  bias: number;
  lossHistory: number[];
  finalLoss: number;
  accuracy: number;
  predictions: number[];
}

/**
 * 逻辑回归 - 梯度下降实现
 */
export function runLogisticRegression(
  points: Array<{ features: number[]; label: number }>,
  params: LogisticRegressionParams
): LogisticRegressionResult {
  const { learningRate, iterations, regularization } = params;
  const n = points.length;
  const numFeatures = points[0].features.length;

  let weights = new Array(numFeatures).fill(0);
  let bias = 0;
  const lossHistory: number[] = [];
  const predictions: number[] = [];

  // Sigmoid 函数
  const sigmoid = (z: number): number => {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  };

  for (let iter = 0; iter < iterations; iter++) {
    let dw = new Array(numFeatures).fill(0);
    let db = 0;
    let loss = 0;

    for (let i = 0; i < n; i++) {
      const x = points[i].features;
      const y = points[i].label;

      // 计算预测
      const z = weights.reduce((sum, w, j) => sum + w * x[j], 0) + bias;
      const prediction = sigmoid(z);

      // 计算损失（交叉熵）
      const epsilon = 1e-15;
      loss += -(y * Math.log(prediction + epsilon) + (1 - y) * Math.log(1 - prediction + epsilon));

      // 计算梯度
      const error = prediction - y;
      for (let j = 0; j < numFeatures; j++) {
        dw[j] += error * x[j];
      }
      db += error;
    }

    // 平均损失和梯度
    loss /= n;
    for (let j = 0; j < numFeatures; j++) {
      dw[j] = dw[j] / n + regularization * weights[j];
    }
    db /= n;

    lossHistory.push(loss);

    // 更新参数
    for (let j = 0; j < numFeatures; j++) {
      weights[j] -= learningRate * dw[j];
    }
    bias -= learningRate * db;
  }

  // 计算最终预测和准确率
  let correct = 0;
  for (let i = 0; i < n; i++) {
    const x = points[i].features;
    const z = weights.reduce((sum, w, j) => sum + w * x[j], 0) + bias;
    const prediction = sigmoid(z) >= 0.5 ? 1 : 0;
    predictions.push(prediction);
    if (prediction === points[i].label) {
      correct++;
    }
  }

  return {
    weights,
    bias,
    lossHistory,
    finalLoss: lossHistory[lossHistory.length - 1] || 0,
    accuracy: correct / n,
    predictions,
  };
}

export function generateLogisticData(n: number = 40) {
  const points: Array<{ features: number[]; label: number }> = [];
  for (let i = 0; i < n; i++) {
    if (i < n / 2) {
      points.push({
        features: [1 + Math.random() * 2, 1 + Math.random() * 2],
        label: 0,
      });
    } else {
      points.push({
        features: [4 + Math.random() * 2, 4 + Math.random() * 2],
        label: 1,
      });
    }
  }
  return points;
}

// ==================== KNN 实现 ====================

export interface KNNParams {
  k: number;
  distanceMetric: 'euclidean' | 'manhattan';
}

export interface KNNResult {
  predictions: number[];
  accuracy: number;
  distances: number[][];
}

/**
 * KNN 算法实现
 */
export function runKNN(
  trainPoints: Array<{ features: number[]; label: number }>,
  testPoints: Array<{ features: number[]; label: number }>,
  params: KNNParams
): KNNResult {
  const { k, distanceMetric } = params;
  const predictions: number[] = [];
  const distances: number[][] = [];

  // 距离计算函数
  const calculateDistance = (a: number[], b: number[]): number => {
    if (distanceMetric === 'manhattan') {
      return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0);
    } else {
      return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    }
  };

  let correct = 0;

  for (const testPoint of testPoints) {
    // 计算到所有训练点的距离
    const dists = trainPoints.map((trainPoint, idx) => ({
      distance: calculateDistance(testPoint.features, trainPoint.features),
      label: trainPoint.label,
      index: idx,
    }));

    // 排序并选择 K 个最近邻
    dists.sort((a, b) => a.distance - b.distance);
    const kNearest = dists.slice(0, k);

    distances.push(kNearest.map((d) => d.distance));

    // 投票决定类别
    const votes: Record<number, number> = {};
    for (const neighbor of kNearest) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    const prediction = parseInt(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]);
    predictions.push(prediction);

    if (prediction === testPoint.label) {
      correct++;
    }
  }

  return {
    predictions,
    accuracy: correct / testPoints.length,
    distances,
  };
}

// ==================== PCA 实现 ====================

export interface PCAParams {
  nComponents: number;
}

export interface PCAResult {
  components: number[][];
  explainedVariance: number[];
  transformedData: number[][];
  totalVarianceExplained: number;
}

/**
 * PCA 算法实现（简化版）
 */
export function runPCA(
  points: Array<{ features: number[] }>,
  params: PCAParams
): PCAResult {
  const { nComponents } = params;
  const n = points.length;
  const numFeatures = points[0].features.length;

  // 1. 中心化数据
  const means = new Array(numFeatures).fill(0);
  for (const point of points) {
    for (let i = 0; i < numFeatures; i++) {
      means[i] += point.features[i];
    }
  }
  for (let i = 0; i < numFeatures; i++) {
    means[i] /= n;
  }

  const centeredData = points.map((point) =>
    point.features.map((val, i) => val - means[i])
  );

  // 2. 计算协方差矩阵
  const covarianceMatrix: number[][] = Array(numFeatures)
    .fill(0)
    .map(() => Array(numFeatures).fill(0));

  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centeredData[k][i] * centeredData[k][j];
      }
      covarianceMatrix[i][j] = sum / (n - 1);
    }
  }

  // 3. 幂迭代法求特征向量（简化版）
  const components: number[][] = [];
  const explainedVariance: number[] = [];

  let currentMatrix = covarianceMatrix.map((row) => [...row]);

  for (let comp = 0; comp < nComponents; comp++) {
    // 幂迭代
    let vector = new Array(numFeatures).fill(1 / Math.sqrt(numFeatures));

    for (let iter = 0; iter < 100; iter++) {
      const newVector = new Array(numFeatures).fill(0);
      for (let i = 0; i < numFeatures; i++) {
        for (let j = 0; j < numFeatures; j++) {
          newVector[i] += currentMatrix[i][j] * vector[j];
        }
      }

      // 归一化
      const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
      vector = newVector.map((val) => val / norm);
    }

    // 计算特征值
    let eigenvalue = 0;
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        eigenvalue += vector[i] * currentMatrix[i][j] * vector[j];
      }
    }

    components.push(vector);
    explainedVariance.push(eigenvalue);

    // 从矩阵中移除这个成分
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        currentMatrix[i][j] -= eigenvalue * vector[i] * vector[j];
      }
    }
  }

  // 4. 投影数据
  const transformedData = centeredData.map((point) =>
    components.map((comp) =>
      point.reduce((sum, val, i) => sum + val * comp[i], 0)
    )
  );

  // 5. 计算解释方差比例
  const totalVariance = explainedVariance.reduce((sum, val) => sum + val, 0);
  const allVariance = covarianceMatrix.reduce(
    (sum, row, i) => sum + row[i],
    0
  );

  return {
    components,
    explainedVariance: explainedVariance.map((v) => v / allVariance),
    transformedData,
    totalVarianceExplained: totalVariance / allVariance,
  };
}

export function generatePCAData(n: number = 50, numFeatures: number = 3) {
  const points: Array<{ features: number[] }> = [];
  for (let i = 0; i < n; i++) {
    const features = [];
    for (let j = 0; j < numFeatures; j++) {
      features.push(Math.random() * 10);
    }
    points.push({ features });
  }
  return points;
}

// ==================== 随机森林实现（简化版） ====================

export interface RandomForestParams {
  nTrees: number;
  maxDepth: number;
  minSamplesSplit: number;
}

export interface RandomForestResult {
  predictions: number[];
  accuracy: number;
  featureImportance: number[];
}

/**
 * 随机森林算法实现（简化版）
 */
export function runRandomForest(
  trainPoints: Array<{ features: number[]; label: number }>,
  testPoints: Array<{ features: number[]; label: number }>,
  params: RandomForestParams
): RandomForestResult {
  const { nTrees, maxDepth, minSamplesSplit } = params;
  const predictions: number[] = [];
  
  // 安全检查：确保数据不为空
  if (trainPoints.length === 0 || testPoints.length === 0) {
    return {
      predictions: [],
      accuracy: 0,
      featureImportance: [],
    };
  }
  
  const numFeatures = trainPoints[0].features.length;
  const featureImportance = new Array(numFeatures).fill(0);

  // 构建多棵决策树
  const trees: Array<{ feature: number; threshold: number; left: any; right: any; label?: number }> = [];

  for (let t = 0; t < nTrees; t++) {
    // Bootstrap 采样
    const sample = [];
    for (let i = 0; i < trainPoints.length; i++) {
      sample.push(trainPoints[Math.floor(Math.random() * trainPoints.length)]);
    }

    // 构建决策树（简化版）
    const buildTree = (
      data: Array<{ features: number[]; label: number }>,
      depth: number
    ): any => {
      const labels = data.map((d) => d.label);
      const uniqueLabels = [...new Set(labels)];

      if (uniqueLabels.length === 1 || depth >= maxDepth || data.length < minSamplesSplit) {
        const labelCounts: Record<number, number> = {};
        labels.forEach((l) => (labelCounts[l] = (labelCounts[l] || 0) + 1));
        const majorityLabel = parseInt(
          Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0][0]
        );
        return { label: majorityLabel };
      }

      // 随机选择特征子集
      const featureSubset: number[] = [];
      const numFeaturesToSelect = Math.ceil(Math.sqrt(numFeatures));
      while (featureSubset.length < numFeaturesToSelect) {
        const f = Math.floor(Math.random() * numFeatures);
        if (!featureSubset.includes(f)) {
          featureSubset.push(f);
        }
      }

      // 寻找最佳分裂
      let bestSplit: { feature: number; threshold: number; gain: number } | null = null;

      for (const featureIdx of featureSubset) {
        const values = data.map((d) => d.features[featureIdx]);
        const sortedValues = [...new Set(values)].sort((a, b) => a - b);

        for (let i = 0; i < sortedValues.length - 1; i++) {
          const threshold = (sortedValues[i] + sortedValues[i + 1]) / 2;
          const left = data.filter((d) => d.features[featureIdx] < threshold);
          const right = data.filter((d) => d.features[featureIdx] >= threshold);

          if (left.length === 0 || right.length === 0) continue;

          // 计算信息增益（简化版）
          const gain = left.length * right.length;

          if (!bestSplit || gain > bestSplit.gain) {
            bestSplit = { feature: featureIdx, threshold, gain };
          }
        }
      }

      if (!bestSplit) {
        const labelCounts: Record<number, number> = {};
        labels.forEach((l) => (labelCounts[l] = (labelCounts[l] || 0) + 1));
        const majorityLabel = parseInt(
          Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0][0]
        );
        return { label: majorityLabel };
      }

      // 记录特征重要性
      featureImportance[bestSplit.feature] += bestSplit.gain;

      const left = data.filter((d) => d.features[bestSplit!.feature] < bestSplit!.threshold);
      const right = data.filter((d) => d.features[bestSplit!.feature] >= bestSplit!.threshold);

      return {
        feature: bestSplit.feature,
        threshold: bestSplit.threshold,
        left: buildTree(left, depth + 1),
        right: buildTree(right, depth + 1),
      };
    };

    trees.push(buildTree(sample, 0));
  }

  // 预测
  let correct = 0;
  for (const testPoint of testPoints) {
    const votes: Record<number, number> = {};

    for (const tree of trees) {
      let node = tree;
      while (node.label === undefined) {
        if (testPoint.features[node.feature] < node.threshold) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
      votes[node.label] = (votes[node.label] || 0) + 1;
    }

    const prediction = parseInt(
      Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]
    );
    predictions.push(prediction);

    if (prediction === testPoint.label) {
      correct++;
    }
  }

  // 归一化特征重要性
  const totalImportance = featureImportance.reduce((sum, val) => sum + val, 0);
  const normalizedImportance = featureImportance.map(
    (val) => val / totalImportance
  );

  return {
    predictions,
    accuracy: correct / testPoints.length,
    featureImportance: normalizedImportance,
  };
}

// ==================== MLP 实现（简化版） ====================

export interface MLPParams {
  hiddenLayers: number[];
  learningRate: number;
  iterations: number;
}

export interface MLPResult {
  lossHistory: number[];
  finalLoss: number;
  accuracy: number;
  predictions: number[];
}

/**
 * MLP 算法实现（简化版）
 */
export function runMLP(
  trainPoints: Array<{ features: number[]; label: number }>,
  params: MLPParams
): MLPResult {
  const { hiddenLayers, learningRate, iterations } = params;
  const n = trainPoints.length;
  const inputSize = trainPoints[0].features.length;
  const outputSize = 2; // 二分类

  // 初始化网络
  const layers = [inputSize, ...hiddenLayers, outputSize];
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let i = 0; i < layers.length - 1; i++) {
    weights.push(
      Array(layers[i + 1])
        .fill(0)
        .map(() =>
          Array(layers[i])
            .fill(0)
            .map(() => (Math.random() - 0.5) * 0.5)
        )
    );
    biases.push(Array(layers[i + 1]).fill(0).map(() => (Math.random() - 0.5) * 0.5));
  }

  // 激活函数
  const sigmoid = (z: number): number => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  const sigmoidDerivative = (z: number): number => z * (1 - z);

  const lossHistory: number[] = [];

  // 训练
  for (let iter = 0; iter < iterations; iter++) {
    let totalLoss = 0;

    for (const point of trainPoints) {
      // 前向传播
      const activations: number[][] = [point.features];
      const zs: number[][] = [];

      for (let l = 0; l < layers.length - 1; l++) {
        const z: number[] = [];
        const a: number[] = [];

        for (let j = 0; j < layers[l + 1]; j++) {
          let sum = biases[l][j];
          for (let k = 0; k < layers[l]; k++) {
            sum += weights[l][j][k] * activations[l][k];
          }
          z.push(sum);
          a.push(sigmoid(sum));
        }

        zs.push(z);
        activations.push(a);
      }

      // 计算损失
      const output = activations[activations.length - 1];
      const target = point.label === 1 ? [0, 1] : [1, 0];
      const loss = output.reduce(
        (sum, val, i) => sum - (target[i] * Math.log(val + 1e-15) + (1 - target[i]) * Math.log(1 - val + 1e-15)),
        0
      );
      totalLoss += loss;

      // 反向传播（简化版）
      const deltas: number[][] = [output.map((val, i) => (val - target[i]) * sigmoidDerivative(val))];

      for (let l = layers.length - 2; l > 0; l--) {
        const delta: number[] = [];
        for (let j = 0; j < layers[l]; j++) {
          let sum = 0;
          for (let k = 0; k < layers[l + 1]; k++) {
            sum += weights[l][k][j] * deltas[0][k];
          }
          delta.push(sum * sigmoidDerivative(activations[l][j]));
        }
        deltas.unshift(delta);
      }

      // 更新权重和偏置
      for (let l = 0; l < layers.length - 1; l++) {
        for (let j = 0; j < layers[l + 1]; j++) {
          for (let k = 0; k < layers[l]; k++) {
            weights[l][j][k] -= learningRate * deltas[l][j] * activations[l][k];
          }
          biases[l][j] -= learningRate * deltas[l][j];
        }
      }
    }

    lossHistory.push(totalLoss / n);
  }

  // 预测
  const predictions: number[] = [];
  let correct = 0;

  for (const point of trainPoints) {
    const activations: number[][] = [point.features];

    for (let l = 0; l < layers.length - 1; l++) {
      const a: number[] = [];
      for (let j = 0; j < layers[l + 1]; j++) {
        let sum = biases[l][j];
        for (let k = 0; k < layers[l]; k++) {
          sum += weights[l][j][k] * activations[l][k];
        }
        a.push(sigmoid(sum));
      }
      activations.push(a);
    }

    const output = activations[activations.length - 1];
    const prediction = output[1] > output[0] ? 1 : 0;
    predictions.push(prediction);

    if (prediction === point.label) {
      correct++;
    }
  }

  return {
    lossHistory,
    finalLoss: lossHistory[lossHistory.length - 1] || 0,
    accuracy: correct / n,
    predictions,
  };
}
