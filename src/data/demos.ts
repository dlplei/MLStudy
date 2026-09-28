import { DemoConfig } from '../types/demo';

/**
 * K-Means 聚类演示数据
 * 模拟二维空间中的聚类过程，5个关键步骤
 */
export const kmeansDemoConfig: DemoConfig = {
  algorithmId: 'kmeans',
  title: { zh: 'K-Means 聚类过程演示', en: 'K-Means Clustering Process Demo' },
  totalSteps: 5,
  snapshots: [
    {
      stepIndex: 0,
      title: { zh: '初始数据分布', en: 'Initial Data Distribution' },
      description: {
        zh: '这是我们的原始数据集，包含30个二维数据点。目标是将它们分为3个簇。',
        en: 'This is our raw dataset with 30 2D data points. The goal is to partition them into 3 clusters.',
      },
      data: {
        points: generateKMeansPoints(0),
        centers: [],
        converged: false,
      },
    },
    {
      stepIndex: 1,
      title: { zh: '随机初始化聚类中心', en: 'Random Center Initialization' },
      description: {
        zh: '随机选择3个数据点作为初始聚类中心（★标记）。这些中心的位置将决定最终聚类结果。',
        en: 'Randomly select 3 data points as initial cluster centers (★ marks). Their positions determine the final clustering result.',
      },
      data: {
        points: generateKMeansPoints(1),
        centers: [
          { x: 2, y: 3, id: 0 },
          { x: 7, y: 7, id: 1 },
          { x: 8, y: 2, id: 2 },
        ],
        converged: false,
      },
    },
    {
      stepIndex: 2,
      title: { zh: '第1轮：分配样本到最近中心', en: 'Round 1: Assign Points to Nearest Center' },
      description: {
        zh: '计算每个数据点到3个中心的距离，将其分配给最近的中心。不同颜色表示不同簇。',
        en: 'Calculate distance from each point to 3 centers, assign to nearest center. Different colors represent different clusters.',
      },
      data: {
        points: generateKMeansPoints(2),
        centers: [
          { x: 2, y: 3, id: 0 },
          { x: 7, y: 7, id: 1 },
          { x: 8, y: 2, id: 2 },
        ],
        converged: false,
      },
    },
    {
      stepIndex: 3,
      title: { zh: '第1轮：更新聚类中心', en: 'Round 1: Update Cluster Centers' },
      description: {
        zh: '重新计算每个簇的均值作为新的聚类中心。注意中心位置已经移动！',
        en: 'Recalculate the mean of each cluster as new center. Notice the centers have moved!',
      },
      data: {
        points: generateKMeansPoints(2),
        centers: [
          { x: 2.5, y: 2.8, id: 0 },
          { x: 6.5, y: 7.2, id: 1 },
          { x: 7.8, y: 2.5, id: 2 },
        ],
        converged: false,
      },
    },
    {
      stepIndex: 4,
      title: { zh: '收敛：聚类完成', en: 'Converged: Clustering Complete' },
      description: {
        zh: '经过多轮迭代，中心不再移动，算法收敛。每个数据点被稳定地分配到其最近的簇中。',
        en: 'After multiple iterations, centers stop moving and the algorithm converges. Each point is stably assigned to its nearest cluster.',
      },
      data: {
        points: generateKMeansPoints(4),
        centers: [
          { x: 2.3, y: 2.7, id: 0 },
          { x: 6.8, y: 7.5, id: 1 },
          { x: 8.1, y: 2.2, id: 2 },
        ],
        converged: true,
      },
    },
  ],
};

/**
 * 线性回归演示数据
 * 模拟梯度下降拟合过程，5个关键步骤
 */
export const linearRegressionDemoConfig: DemoConfig = {
  algorithmId: 'linear-regression',
  title: { zh: '线性回归梯度下降演示', en: 'Linear Regression Gradient Descent Demo' },
  totalSteps: 5,
  snapshots: [
    {
      stepIndex: 0,
      title: { zh: '初始数据与随机参数', en: 'Initial Data & Random Parameters' },
      description: {
        zh: '数据点已绘制。初始权重 w=0, b=5，拟合线为水平线。损失值很大。',
        en: 'Data points plotted. Initial weights w=0, b=5, fit line is horizontal. Loss is very high.',
      },
      data: {
        points: generateLinearPoints(0),
        weights: { w: 0, b: 5 },
        loss: 42.5,
        learningRate: 0.01,
        iteration: 0,
      },
    },
    {
      stepIndex: 1,
      title: { zh: '第10次迭代', en: 'Iteration 10' },
      description: {
        zh: '梯度下降开始工作。拟合线开始向数据趋势倾斜，损失值下降。',
        en: 'Gradient descent starts working. The fit line begins to tilt toward data trend. Loss decreases.',
      },
      data: {
        points: generateLinearPoints(1),
        weights: { w: 0.8, b: 3.2 },
        loss: 18.7,
        learningRate: 0.01,
        iteration: 10,
      },
    },
    {
      stepIndex: 2,
      title: { zh: '第50次迭代', en: 'Iteration 50' },
      description: {
        zh: '拟合线越来越接近数据趋势。注意残差（竖线）在缩短。',
        en: 'The fit line is getting closer to the data trend. Notice the residuals (vertical lines) are shrinking.',
      },
      data: {
        points: generateLinearPoints(2),
        weights: { w: 1.8, b: 1.5 },
        loss: 6.3,
        learningRate: 0.01,
        iteration: 50,
      },
    },
    {
      stepIndex: 3,
      title: { zh: '第200次迭代', en: 'Iteration 200' },
      description: {
        zh: '拟合线已经很好地捕捉了数据的线性趋势。损失值继续下降。',
        en: 'The fit line has captured the linear trend well. Loss continues to decrease.',
      },
      data: {
        points: generateLinearPoints(3),
        weights: { w: 2.5, b: 0.8 },
        loss: 2.1,
        learningRate: 0.01,
        iteration: 200,
      },
    },
    {
      stepIndex: 4,
      title: { zh: '收敛：最优拟合', en: 'Converged: Optimal Fit' },
      description: {
        zh: '算法收敛！拟合线 y = 2.9x + 0.5 最小化了所有数据点的均方误差。',
        en: 'Algorithm converged! The fit line y = 2.9x + 0.5 minimizes the mean squared error of all data points.',
      },
      data: {
        points: generateLinearPoints(4),
        weights: { w: 2.9, b: 0.5 },
        loss: 0.8,
        learningRate: 0.01,
        iteration: 500,
      },
    },
  ],
};

// ==================== 数据生成函数 ====================

// 基础数据点（3个簇）
const baseClusters = [
  // Cluster 0: 左下区域
  [
    { x: 1.5, y: 2.0 }, { x: 2.0, y: 3.5 }, { x: 3.0, y: 2.5 },
    { x: 2.5, y: 1.5 }, { x: 1.8, y: 3.0 }, { x: 3.2, y: 3.2 },
    { x: 2.2, y: 2.8 }, { x: 1.2, y: 2.5 }, { x: 2.8, y: 1.8 },
    { x: 3.5, y: 2.0 },
  ],
  // Cluster 1: 右上区域
  [
    { x: 6.0, y: 7.0 }, { x: 7.0, y: 8.0 }, { x: 6.5, y: 6.5 },
    { x: 7.5, y: 7.5 }, { x: 6.8, y: 8.5 }, { x: 7.2, y: 6.8 },
    { x: 6.2, y: 7.8 }, { x: 7.8, y: 7.2 }, { x: 6.5, y: 8.2 },
    { x: 7.0, y: 7.0 },
  ],
  // Cluster 2: 右下区域
  [
    { x: 8.0, y: 2.0 }, { x: 7.5, y: 3.0 }, { x: 8.5, y: 1.5 },
    { x: 9.0, y: 2.5 }, { x: 7.8, y: 2.8 }, { x: 8.2, y: 1.8 },
    { x: 8.8, y: 3.2 }, { x: 7.2, y: 2.2 }, { x: 8.5, y: 2.5 },
    { x: 9.2, y: 1.8 },
  ],
];

function generateKMeansPoints(step: number) {
  const points = [];

  for (let c = 0; c < 3; c++) {
    for (const pt of baseClusters[c]) {
      if (step <= 1) {
        // 未分配
        points.push({ x: pt.x, y: pt.y, cluster: -1 });
      } else {
        // 已分配
        points.push({ x: pt.x, y: pt.y, cluster: c });
      }
    }
  }

  return points;
}

// 线性回归基础数据
const baseLinearData = [
  { x: 1, y: 3.5 }, { x: 1.5, y: 4.8 }, { x: 2, y: 6.2 },
  { x: 2.5, y: 7.8 }, { x: 3, y: 9.1 }, { x: 3.5, y: 10.8 },
  { x: 4, y: 12.0 }, { x: 4.5, y: 13.5 }, { x: 5, y: 15.2 },
  { x: 5.5, y: 16.0 }, { x: 6, y: 17.8 }, { x: 6.5, y: 19.5 },
  { x: 7, y: 20.8 }, { x: 7.5, y: 22.5 }, { x: 8, y: 23.8 },
];

function generateLinearPoints(step: number) {
  const w = [0, 0.8, 1.8, 2.5, 2.9][step];
  const b = [5, 3.2, 1.5, 0.8, 0.5][step];

  return baseLinearData.map((pt) => {
    const predicted = w * pt.x + b;
    return {
      x: pt.x,
      y: pt.y,
      predicted: Math.round(predicted * 100) / 100,
      residual: Math.round((pt.y - predicted) * 100) / 100,
    };
  });
}
