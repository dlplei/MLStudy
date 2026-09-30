/**
 * 算法数学推导数据
 * 为每个算法提供详细的数学推导过程
 */

export interface DerivationStep {
  id: string;
  title: {
    zh: string;
    en: string;
  };
  formula: string; // LaTeX 公式
  explanation: {
    zh: string;
    en: string;
  };
}

export interface AlgorithmDerivation {
  algorithmId: string;
  title: {
    zh: string;
    en: string;
  };
  introduction: {
    zh: string;
    en: string;
  };
  steps: DerivationStep[];
}

export const derivations: AlgorithmDerivation[] = [
  // 线性回归
  {
    algorithmId: 'linear-regression',
    title: {
      zh: '线性回归的数学推导',
      en: 'Mathematical Derivation of Linear Regression'
    },
    introduction: {
      zh: '线性回归试图找到一条直线，使其尽可能接近所有数据点。我们通过最小化预测值与真实值之间的误差来实现这一目标。',
      en: 'Linear regression tries to find a line that fits all data points as closely as possible. We achieve this by minimizing the error between predicted and actual values.'
    },
    steps: [
      {
        id: '1',
        title: {
          zh: '1. 问题定义',
          en: '1. Problem Definition'
        },
        formula: 'y = wx + b',
        explanation: {
          zh: '我们的目标是找到最优的权重 w 和偏置 b，使得直线 y = wx + b 能够最好地拟合数据。这里 x 是输入特征，y 是预测输出。',
          en: 'Our goal is to find the optimal weight w and bias b so that the line y = wx + b best fits the data. Here x is the input feature and y is the predicted output.'
        }
      },
      {
        id: '2',
        title: {
          zh: '2. 损失函数（均方误差）',
          en: '2. Loss Function (Mean Squared Error)'
        },
        formula: 'L(w, b) = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - (wx_i + b))^2',
        explanation: {
          zh: '损失函数衡量预测值与真实值的差距。我们使用均方误差（MSE），即所有数据点上误差的平方的平均值。n 是数据点数量。',
          en: 'The loss function measures the gap between predicted and actual values. We use Mean Squared Error (MSE), which is the average of squared errors across all data points. n is the number of data points.'
        }
      },
      {
        id: '3',
        title: {
          zh: '3. 目标：最小化损失',
          en: '3. Objective: Minimize Loss'
        },
        formula: '\\min_{w, b} L(w, b)',
        explanation: {
          zh: '我们的目标是找到 w 和 b 的值，使得损失函数 L(w, b) 最小。这是一个优化问题。',
          en: 'Our goal is to find values of w and b that minimize the loss function L(w, b). This is an optimization problem.'
        }
      },
      {
        id: '4',
        title: {
          zh: '4. 求解方法一：正规方程（解析解）',
          en: '4. Solution Method 1: Normal Equation (Analytical Solution)'
        },
        formula: 'w = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_{i=1}^{n}(x_i - \\bar{x})^2}',
        explanation: {
          zh: '对于简单线性回归，我们可以通过求导并令导数为零，直接计算出最优的 w。这里 x̄ 和 ȳ 分别是 x 和 y 的均值。这个公式给出了精确解。',
          en: 'For simple linear regression, we can directly calculate the optimal w by taking derivatives and setting them to zero. Here x̄ and ȳ are the means of x and y respectively. This formula gives the exact solution.'
        }
      },
      {
        id: '5',
        title: {
          zh: '5. 求解方法二：梯度下降（迭代法）',
          en: '5. Solution Method 2: Gradient Descent (Iterative Method)'
        },
        formula: 'w := w - \\alpha \\frac{\\partial L}{\\partial w}, \\quad b := b - \\alpha \\frac{\\partial L}{\\partial b}',
        explanation: {
          zh: '当数据量大或特征多时，我们使用梯度下降法。通过不断沿着损失函数的反方向调整参数，逐步接近最优解。α 是学习率，控制每步的大小。',
          en: 'When data is large or there are many features, we use gradient descent. By continuously adjusting parameters in the opposite direction of the loss function gradient, we gradually approach the optimal solution. α is the learning rate, controlling the step size.'
        }
      },
      {
        id: '6',
        title: {
          zh: '6. 梯度计算',
          en: '6. Gradient Calculation'
        },
        formula: '\\frac{\\partial L}{\\partial w} = -\\frac{2}{n} \\sum_{i=1}^{n} x_i(y_i - wx_i - b)',
        explanation: {
          zh: '对 w 求偏导数，得到损失函数关于 w 的梯度。这个梯度告诉我们：在当前 w 值下，损失函数增加最快的方向。我们要反方向移动来减小损失。',
          en: 'Taking the partial derivative with respect to w gives us the gradient of the loss function. This gradient tells us the direction of fastest increase. We move in the opposite direction to reduce loss.'
        }
      }
    ]
  },

  // K-Means 聚类
  {
    algorithmId: 'kmeans',
    title: {
      zh: 'K-Means 聚类的数学推导',
      en: 'Mathematical Derivation of K-Means Clustering'
    },
    introduction: {
      zh: 'K-Means 的目标是将 n 个数据点分成 k 个簇，使得每个数据点到其所属簇中心的距离之和最小。',
      en: 'The goal of K-Means is to partition n data points into k clusters, minimizing the sum of distances from each point to its cluster center.'
    },
    steps: [
      {
        id: '1',
        title: {
          zh: '1. 问题定义',
          en: '1. Problem Definition'
        },
        formula: '\\min \\sum_{i=1}^{k} \\sum_{x \\in C_i} ||x - \\mu_i||^2',
        explanation: {
          zh: '目标是最小化所有数据点到其簇中心的距离平方和。Cᵢ 是第 i 个簇，μᵢ 是第 i 个簇的中心，||x - μᵢ||² 是欧氏距离的平方。',
          en: 'The objective is to minimize the sum of squared distances from all data points to their cluster centers. Cᵢ is the i-th cluster, μᵢ is the center of the i-th cluster, and ||x - μᵢ||² is the squared Euclidean distance.'
        }
      },
      {
        id: '2',
        title: {
          zh: '2. 簇中心定义',
          en: '2. Cluster Center Definition'
        },
        formula: '\\mu_i = \\frac{1}{|C_i|} \\sum_{x \\in C_i} x',
        explanation: {
          zh: '簇中心 μᵢ 是该簇中所有数据点的均值。|Cᵢ| 是簇 Cᵢ 中数据点的数量。这个公式确保中心点是簇内所有点的"重心"。',
          en: 'The cluster center μᵢ is the mean of all data points in that cluster. |Cᵢ| is the number of data points in cluster Cᵢ. This formula ensures the center is the "centroid" of all points in the cluster.'
        }
      },
      {
        id: '3',
        title: {
          zh: '3. 算法步骤：分配',
          en: '3. Algorithm Step: Assignment'
        },
        formula: 'C_i^{(t)} = \\{x : ||x - \\mu_i^{(t)}||^2 \\leq ||x - \\mu_j^{(t)}||^2, \\forall j\\}',
        explanation: {
          zh: '在分配步骤中，每个数据点被分配到距离最近的簇中心。对于每个点 x，我们计算它到所有 k 个中心的距离，选择距离最小的那个簇。',
          en: 'In the assignment step, each data point is assigned to the nearest cluster center. For each point x, we calculate its distance to all k centers and choose the cluster with the smallest distance.'
        }
      },
      {
        id: '4',
        title: {
          zh: '4. 算法步骤：更新',
          en: '4. Algorithm Step: Update'
        },
        formula: '\\mu_i^{(t+1)} = \\frac{1}{|C_i^{(t)}|} \\sum_{x \\in C_i^{(t)}} x',
        explanation: {
          zh: '在更新步骤中，重新计算每个簇的中心。新的中心是该簇中所有点的均值。这一步确保中心点移动到簇的"重心"位置。',
          en: 'In the update step, we recalculate the center of each cluster. The new center is the mean of all points in that cluster. This step ensures the center moves to the "centroid" position of the cluster.'
        }
      },
      {
        id: '5',
        title: {
          zh: '5. 收敛条件',
          en: '5. Convergence Condition'
        },
        formula: '||\\mu_i^{(t+1)} - \\mu_i^{(t)}|| < \\epsilon',
        explanation: {
          zh: '当簇中心不再变化（或变化小于阈值 ε）时，算法收敛。理论上，K-Means 保证在有限步内收敛，因为每次迭代都会减小目标函数。',
          en: 'The algorithm converges when cluster centers no longer change (or change is less than threshold ε). Theoretically, K-Means is guaranteed to converge in finite steps because each iteration reduces the objective function.'
        }
      },
      {
        id: '6',
        title: {
          zh: '6. 目标函数单调递减',
          en: '6. Monotonically Decreasing Objective'
        },
        formula: 'J^{(t+1)} \\leq J^{(t)}',
        explanation: {
          zh: '每次迭代后，目标函数 J（所有点到中心的距离平方和）都会减小或保持不变。这保证了算法最终会收敛到一个局部最优解。',
          en: 'After each iteration, the objective function J (sum of squared distances from all points to centers) decreases or stays the same. This guarantees the algorithm will eventually converge to a local optimum.'
        }
      }
    ]
  }
];

/**
 * 根据算法ID获取推导数据
 */
export function getDerivation(algorithmId: string): AlgorithmDerivation | undefined {
  return derivations.find(d => d.algorithmId === algorithmId);
}

/**
 * 检查算法是否有推导数据
 */
export function hasDerivation(algorithmId: string): boolean {
  return derivations.some(d => d.algorithmId === algorithmId);
}
