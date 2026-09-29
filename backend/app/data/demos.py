"""
演示数据定义
"""
from typing import Any, Dict, List


# ==================== 基础数据 ====================

BASE_CLUSTERS = [
    # Cluster 0: 左下区域
    [
        {'x': 1.5, 'y': 2.0}, {'x': 2.0, 'y': 3.5}, {'x': 3.0, 'y': 2.5},
        {'x': 2.5, 'y': 1.5}, {'x': 1.8, 'y': 3.0}, {'x': 3.2, 'y': 3.2},
        {'x': 2.2, 'y': 2.8}, {'x': 1.2, 'y': 2.5}, {'x': 2.8, 'y': 1.8},
        {'x': 3.5, 'y': 2.0},
    ],
    # Cluster 1: 右上区域
    [
        {'x': 6.0, 'y': 7.0}, {'x': 7.0, 'y': 8.0}, {'x': 6.5, 'y': 6.5},
        {'x': 7.5, 'y': 7.5}, {'x': 6.8, 'y': 8.5}, {'x': 7.2, 'y': 6.8},
        {'x': 6.2, 'y': 7.8}, {'x': 7.8, 'y': 7.2}, {'x': 6.5, 'y': 8.2},
        {'x': 7.0, 'y': 7.0},
    ],
    # Cluster 2: 右下区域
    [
        {'x': 8.0, 'y': 2.0}, {'x': 7.5, 'y': 3.0}, {'x': 8.5, 'y': 1.5},
        {'x': 9.0, 'y': 2.5}, {'x': 7.8, 'y': 2.8}, {'x': 8.2, 'y': 1.8},
        {'x': 8.8, 'y': 3.2}, {'x': 7.2, 'y': 2.2}, {'x': 8.5, 'y': 2.5},
        {'x': 9.2, 'y': 1.8},
    ],
]

BASE_LINEAR_DATA = [
    {'x': 1, 'y': 3.5}, {'x': 1.5, 'y': 4.8}, {'x': 2, 'y': 6.2},
    {'x': 2.5, 'y': 7.8}, {'x': 3, 'y': 9.1}, {'x': 3.5, 'y': 10.8},
    {'x': 4, 'y': 12.0}, {'x': 4.5, 'y': 13.5}, {'x': 5, 'y': 15.2},
    {'x': 5.5, 'y': 16.0}, {'x': 6, 'y': 17.8}, {'x': 6.5, 'y': 19.5},
    {'x': 7, 'y': 20.8}, {'x': 7.5, 'y': 22.5}, {'x': 8, 'y': 23.8},
]


# ==================== 数据生成函数 ====================

def generate_kmeans_points(step: int) -> List[Dict[str, Any]]:
    """生成 K-Means 数据点"""
    points = []
    for c in range(3):
        for pt in BASE_CLUSTERS[c]:
            points.append({
                'x': pt['x'],
                'y': pt['y'],
                'cluster': -1 if step <= 1 else c
            })
    return points


def generate_linear_points(step: int) -> List[Dict[str, Any]]:
    """生成线性回归数据点"""
    w = [0, 0.8, 1.8, 2.5, 2.9][step]
    b = [5, 3.2, 1.5, 0.8, 0.5][step]
    
    return [
        {
            'x': pt['x'],
            'y': pt['y'],
            'predicted': round(w * pt['x'] + b, 2),
            'residual': round(pt['y'] - (w * pt['x'] + b), 2)
        }
        for pt in BASE_LINEAR_DATA
    ]


# ==================== K-Means 演示配置 ====================

KMEANS_DEMO_CONFIG = {
    'algorithmId': 'kmeans',
    'title': {'zh': 'K-Means 聚类过程演示', 'en': 'K-Means Clustering Process Demo'},
    'totalSteps': 5,
    'snapshots': [
        {
            'stepIndex': 0,
            'title': {'zh': '初始数据分布', 'en': 'Initial Data Distribution'},
            'description': {
                'zh': '这是我们的原始数据集，包含30个二维数据点。目标是将它们分为3个簇。',
                'en': 'This is our raw dataset with 30 2D data points. The goal is to partition them into 3 clusters.'
            },
            'plainExplanation': {
                'zh': '想象你有一堆混在一起的红蓝绿三种颜色的球，现在要把它们分成三堆。',
                'en': 'Imagine you have a bunch of red, blue, and green balls mixed together, and you need to sort them into three piles.'
            },
            'actionLabel': {'zh': '开始聚类', 'en': 'Start Clustering'},
            'visualizationData': {
                'points': generate_kmeans_points(0),
                'centers': [],
                'converged': False
            }
        },
        {
            'stepIndex': 1,
            'title': {'zh': '随机初始化聚类中心', 'en': 'Random Center Initialization'},
            'description': {
                'zh': '随机选择3个数据点作为初始聚类中心（★标记）。这些中心的位置将决定最终聚类结果。',
                'en': 'Randomly select 3 data points as initial cluster centers (★ marks). Their positions determine the final clustering result.'
            },
            'plainExplanation': {
                'zh': '我们先随便选三个球当"队长"，每个队长负责带领一队球。',
                'en': 'We randomly pick three balls as "team leaders", each responsible for leading a team.'
            },
            'actionLabel': {'zh': '分配样本', 'en': 'Assign Points'},
            'visualizationData': {
                'points': generate_kmeans_points(1),
                'centers': [{'x': 2, 'y': 3, 'id': 0}, {'x': 7, 'y': 7, 'id': 1}, {'x': 8, 'y': 2, 'id': 2}],
                'converged': False
            }
        },
        {
            'stepIndex': 2,
            'title': {'zh': '第1轮：分配样本到最近中心', 'en': 'Round 1: Assign Points to Nearest Center'},
            'description': {
                'zh': '计算每个数据点到3个中心的距离，将其分配给最近的中心。不同颜色表示不同簇。',
                'en': 'Calculate distance from each point to 3 centers, assign to nearest center. Different colors represent different clusters.'
            },
            'plainExplanation': {
                'zh': '现在每个球都去找离自己最近的队长，站到那个队伍里。',
                'en': 'Now each ball finds the nearest team leader and joins that team.'
            },
            'actionLabel': {'zh': '更新中心', 'en': 'Update Centers'},
            'visualizationData': {
                'points': generate_kmeans_points(2),
                'centers': [{'x': 2, 'y': 3, 'id': 0}, {'x': 7, 'y': 7, 'id': 1}, {'x': 8, 'y': 2, 'id': 2}],
                'converged': False
            }
        },
        {
            'stepIndex': 3,
            'title': {'zh': '第1轮：更新聚类中心', 'en': 'Round 1: Update Cluster Centers'},
            'description': {
                'zh': '重新计算每个簇的均值作为新的聚类中心。注意中心位置已经移动！',
                'en': 'Recalculate the mean of each cluster as new center. Notice the centers have moved!'
            },
            'plainExplanation': {
                'zh': '每个队长走到自己队伍的正中间，成为新的中心点。',
                'en': 'Each team leader moves to the exact center of their team.'
            },
            'actionLabel': {'zh': '继续迭代', 'en': 'Continue Iteration'},
            'visualizationData': {
                'points': generate_kmeans_points(2),
                'centers': [{'x': 2.5, 'y': 2.8, 'id': 0}, {'x': 6.5, 'y': 7.2, 'id': 1}, {'x': 7.8, 'y': 2.5, 'id': 2}],
                'converged': False
            }
        },
        {
            'stepIndex': 4,
            'title': {'zh': '收敛：聚类完成', 'en': 'Converged: Clustering Complete'},
            'description': {
                'zh': '经过多轮迭代，中心不再移动，算法收敛。每个数据点被稳定地分配到其最近的簇中。',
                'en': 'After multiple iterations, centers stop moving and the algorithm converges. Each point is stably assigned to its nearest cluster.'
            },
            'plainExplanation': {
                'zh': '队长们不再移动了，分类完成！每个球都找到了自己的队伍。',
                'en': 'The leaders stop moving. Classification complete! Every ball has found its team.'
            },
            'actionLabel': {'zh': '演示完成', 'en': 'Demo Complete'},
            'visualizationData': {
                'points': generate_kmeans_points(4),
                'centers': [{'x': 2.3, 'y': 2.7, 'id': 0}, {'x': 6.8, 'y': 7.5, 'id': 1}, {'x': 8.1, 'y': 2.2, 'id': 2}],
                'converged': True
            }
        }
    ]
}


# ==================== 线性回归演示配置 ====================

LINEAR_REGRESSION_DEMO_CONFIG = {
    'algorithmId': 'linear-regression',
    'title': {'zh': '线性回归梯度下降演示', 'en': 'Linear Regression Gradient Descent Demo'},
    'totalSteps': 5,
    'snapshots': [
        {
            'stepIndex': 0,
            'title': {'zh': '初始数据与随机参数', 'en': 'Initial Data & Random Parameters'},
            'description': {
                'zh': '数据点已绘制。初始权重 w=0, b=5，拟合线为水平线。损失值很大。',
                'en': 'Data points plotted. Initial weights w=0, b=5, fit line is horizontal. Loss is very high.'
            },
            'plainExplanation': {
                'zh': '我们有一条水平的线，但它完全不符合数据的趋势。误差非常大。',
                'en': 'We have a horizontal line, but it doesn\'t match the data trend at all. The error is very large.'
            },
            'actionLabel': {'zh': '开始拟合', 'en': 'Start Fitting'},
            'visualizationData': {
                'points': generate_linear_points(0),
                'weights': {'w': 0, 'b': 5},
                'loss': 42.5,
                'learningRate': 0.01,
                'iteration': 0
            }
        },
        {
            'stepIndex': 1,
            'title': {'zh': '第10次迭代', 'en': 'Iteration 10'},
            'description': {
                'zh': '梯度下降开始工作。拟合线开始向数据趋势倾斜，损失值下降。',
                'en': 'Gradient descent starts working. The fit line begins to tilt toward data trend. Loss decreases.'
            },
            'plainExplanation': {
                'zh': '线开始倾斜了，正在慢慢靠近数据点的趋势方向。',
                'en': 'The line is starting to tilt, slowly approaching the trend of the data points.'
            },
            'actionLabel': {'zh': '继续迭代', 'en': 'Continue'},
            'visualizationData': {
                'points': generate_linear_points(1),
                'weights': {'w': 0.8, 'b': 3.2},
                'loss': 18.7,
                'learningRate': 0.01,
                'iteration': 10
            }
        },
        {
            'stepIndex': 2,
            'title': {'zh': '第50次迭代', 'en': 'Iteration 50'},
            'description': {
                'zh': '拟合线越来越接近数据趋势。注意残差（竖线）在缩短。',
                'en': 'The fit line is getting closer to the data trend. Notice the residuals (vertical lines) are shrinking.'
            },
            'plainExplanation': {
                'zh': '线越来越接近数据了，每个点到线的距离（误差）在变小。',
                'en': 'The line is getting closer to the data. The distance (error) from each point to the line is shrinking.'
            },
            'actionLabel': {'zh': '继续迭代', 'en': 'Continue'},
            'visualizationData': {
                'points': generate_linear_points(2),
                'weights': {'w': 1.8, 'b': 1.5},
                'loss': 6.3,
                'learningRate': 0.01,
                'iteration': 50
            }
        },
        {
            'stepIndex': 3,
            'title': {'zh': '第200次迭代', 'en': 'Iteration 200'},
            'description': {
                'zh': '拟合线已经很好地捕捉了数据的线性趋势。损失值继续下降。',
                'en': 'The fit line has captured the linear trend well. Loss continues to decrease.'
            },
            'plainExplanation': {
                'zh': '线已经很好地穿过了数据点的中间，误差很小了。',
                'en': 'The line now passes nicely through the middle of the data points. The error is very small.'
            },
            'actionLabel': {'zh': '继续迭代', 'en': 'Continue'},
            'visualizationData': {
                'points': generate_linear_points(3),
                'weights': {'w': 2.5, 'b': 0.8},
                'loss': 2.1,
                'learningRate': 0.01,
                'iteration': 200
            }
        },
        {
            'stepIndex': 4,
            'title': {'zh': '收敛：最优拟合', 'en': 'Converged: Optimal Fit'},
            'description': {
                'zh': '算法收敛！拟合线 y = 2.9x + 0.5 最小化了所有数据点的均方误差。',
                'en': 'Algorithm converged! The fit line y = 2.9x + 0.5 minimizes the mean squared error of all data points.'
            },
            'plainExplanation': {
                'zh': '完成了！这条线是所有可能的直线中，与数据点总体距离最小的一条。',
                'en': 'Done! This line has the smallest overall distance to all data points among all possible lines.'
            },
            'actionLabel': {'zh': '演示完成', 'en': 'Demo Complete'},
            'visualizationData': {
                'points': generate_linear_points(4),
                'weights': {'w': 2.9, 'b': 0.5},
                'loss': 0.8,
                'learningRate': 0.01,
                'iteration': 500
            }
        }
    ]
}


# ==================== 决策树演示配置 ====================

DECISION_TREE_BASE_DATA = [
    {'weight': 150, 'color': 'red', 'label': 'apple'},
    {'weight': 170, 'color': 'red', 'label': 'apple'},
    {'weight': 140, 'color': 'green', 'label': 'apple'},
    {'weight': 160, 'color': 'orange', 'label': 'orange'},
    {'weight': 180, 'color': 'orange', 'label': 'orange'},
    {'weight': 155, 'color': 'orange', 'label': 'orange'},
    {'weight': 165, 'color': 'red', 'label': 'apple'},
    {'weight': 175, 'color': 'orange', 'label': 'orange'},
]


DECISION_TREE_DEMO_CONFIG = {
    'algorithmId': 'decision-tree',
    'title': {
        'zh': '决策树构建过程演示',
        'en': 'Decision Tree Building Process Demo',
    },
    'totalSteps': 5,
    'snapshots': [
        {
            'stepIndex': 0,
            'title': {'zh': '初始数据集', 'en': 'Initial Dataset'},
            'description': {
                'zh': '我们有8个水果样本，需要根据重量和颜色分类为苹果或橙子。决策树将从这个数据集开始构建。',
                'en': 'We have 8 fruit samples that need to be classified as apple or orange based on weight and color. The decision tree will start building from this dataset.',
            },
            'plainExplanation': {
                'zh': '想象你有一堆水果，你要通过问问题的方式来区分苹果和橙子。决策树就是这样一个"问问题"的过程。',
                'en': 'Imagine you have a pile of fruits and you need to distinguish apples from oranges by asking questions. A decision tree is exactly this "question-asking" process.',
            },
            'actionLabel': {'zh': '开始构建', 'en': 'Start Building'},
            'visualizationData': {
                'data': DECISION_TREE_BASE_DATA,
                'currentFeature': None,
                'currentThreshold': None,
                'leftData': [],
                'rightData': [],
                'treeStructure': {
                    'nodes': [{'id': 'root', 'type': 'root', 'samples': 8}],
                    'edges': [],
                },
            },
        },
        {
            'stepIndex': 1,
            'title': {'zh': '选择最佳分裂特征', 'en': 'Select Best Split Feature'},
            'description': {
                'zh': '算法计算每个特征的信息增益，选择"颜色"作为最佳分裂特征。颜色能更好地区分苹果和橙子。',
                'en': 'The algorithm calculates information gain for each feature and selects "color" as the best split feature. Color can better distinguish apples from oranges.',
            },
            'plainExplanation': {
                'zh': '我们先问："这个水果是什么颜色？" 因为颜色是最容易区分苹果和橙子的特征。',
                'en': 'We first ask: "What color is this fruit?" Because color is the easiest feature to distinguish apples from oranges.',
            },
            'actionLabel': {'zh': '进行分裂', 'en': 'Perform Split'},
            'visualizationData': {
                'data': DECISION_TREE_BASE_DATA,
                'currentFeature': 'color',
                'currentThreshold': 'orange',
                'leftData': [d for d in DECISION_TREE_BASE_DATA if d['color'] != 'orange'],
                'rightData': [d for d in DECISION_TREE_BASE_DATA if d['color'] == 'orange'],
                'treeStructure': {
                    'nodes': [
                        {'id': 'root', 'type': 'split', 'feature': 'color', 'threshold': 'orange', 'samples': 8},
                        {'id': 'left', 'type': 'leaf', 'samples': 4, 'label': 'pending'},
                        {'id': 'right', 'type': 'leaf', 'samples': 4, 'label': 'pending'},
                    ],
                    'edges': [
                        {'from': 'root', 'to': 'left', 'condition': '!= orange'},
                        {'from': 'root', 'to': 'right', 'condition': '= orange'},
                    ],
                },
            },
        },
        {
            'stepIndex': 2,
            'title': {'zh': '第一次分裂结果', 'en': 'First Split Result'},
            'description': {
                'zh': '根据颜色分裂后，右边节点（橙色）全部是橙子，成为叶节点。左边节点（非橙色）还需要进一步分裂。',
                'en': 'After splitting by color, the right node (orange) contains only oranges and becomes a leaf node. The left node (non-orange) needs further splitting.',
            },
            'plainExplanation': {
                'zh': '如果是橙色，那就是橙子！这个分支完成了。但红色的可能是苹果也可能是橙子，需要继续问问题。',
                'en': 'If it\'s orange, it\'s an orange! This branch is done. But red ones could be apples or oranges, we need to ask more questions.',
            },
            'actionLabel': {'zh': '继续分裂', 'en': 'Continue Splitting'},
            'visualizationData': {
                'data': DECISION_TREE_BASE_DATA,
                'currentFeature': 'color',
                'currentThreshold': 'orange',
                'leftData': [d for d in DECISION_TREE_BASE_DATA if d['color'] != 'orange'],
                'rightData': [d for d in DECISION_TREE_BASE_DATA if d['color'] == 'orange'],
                'treeStructure': {
                    'nodes': [
                        {'id': 'root', 'type': 'split', 'feature': 'color', 'threshold': 'orange', 'samples': 8},
                        {'id': 'left', 'type': 'split', 'feature': 'weight', 'threshold': 160, 'samples': 4},
                        {'id': 'right', 'type': 'leaf', 'samples': 4, 'label': 'orange'},
                        {'id': 'left_left', 'type': 'leaf', 'samples': 2, 'label': 'pending'},
                        {'id': 'left_right', 'type': 'leaf', 'samples': 2, 'label': 'pending'},
                    ],
                    'edges': [
                        {'from': 'root', 'to': 'left', 'condition': '!= orange'},
                        {'from': 'root', 'to': 'right', 'condition': '= orange'},
                        {'from': 'left', 'to': 'left_left', 'condition': '< 160g'},
                        {'from': 'left', 'to': 'left_right', 'condition': '>= 160g'},
                    ],
                },
            },
        },
        {
            'stepIndex': 3,
            'title': {'zh': '第二次分裂', 'en': 'Second Split'},
            'description': {
                'zh': '对左边的非橙色样本，选择"重量"作为分裂特征，以160g为阈值进行分裂。',
                'en': 'For the left non-orange samples, select "weight" as the split feature and split with 160g as the threshold.',
            },
            'plainExplanation': {
                'zh': '对于不是橙色的水果，我们再问："它有多重？" 如果小于160克，可能是某种水果；如果大于等于160克，可能是另一种。',
                'en': 'For fruits that are not orange, we ask again: "How heavy is it?" If less than 160g, it might be one type; if >= 160g, it might be another.',
            },
            'actionLabel': {'zh': '完成构建', 'en': 'Complete Building'},
            'visualizationData': {
                'data': DECISION_TREE_BASE_DATA,
                'currentFeature': 'weight',
                'currentThreshold': 160,
                'leftData': [d for d in DECISION_TREE_BASE_DATA if d['color'] != 'orange' and d['weight'] < 160],
                'rightData': [d for d in DECISION_TREE_BASE_DATA if d['color'] != 'orange' and d['weight'] >= 160],
                'treeStructure': {
                    'nodes': [
                        {'id': 'root', 'type': 'split', 'feature': 'color', 'threshold': 'orange', 'samples': 8},
                        {'id': 'left', 'type': 'split', 'feature': 'weight', 'threshold': 160, 'samples': 4},
                        {'id': 'right', 'type': 'leaf', 'samples': 4, 'label': 'orange'},
                        {'id': 'left_left', 'type': 'leaf', 'samples': 2, 'label': 'apple'},
                        {'id': 'left_right', 'type': 'leaf', 'samples': 2, 'label': 'apple'},
                    ],
                    'edges': [
                        {'from': 'root', 'to': 'left', 'condition': '!= orange'},
                        {'from': 'root', 'to': 'right', 'condition': '= orange'},
                        {'from': 'left', 'to': 'left_left', 'condition': '< 160g'},
                        {'from': 'left', 'to': 'left_right', 'condition': '>= 160g'},
                    ],
                },
            },
        },
        {
            'stepIndex': 4,
            'title': {'zh': '决策树构建完成', 'en': 'Decision Tree Complete'},
            'description': {
                'zh': '所有叶节点都是纯净的（只包含一种类别）。决策树构建完成，可以用来预测新样本的类别。',
                'en': 'All leaf nodes are pure (contain only one class). The decision tree is complete and can be used to predict the class of new samples.',
            },
            'plainExplanation': {
                'zh': '完成了！现在你可以通过问两个问题来判断任何水果：1. 什么颜色？2. 如果不确定，有多重？这就是决策树的魅力！',
                'en': 'Done! Now you can classify any fruit by asking two questions: 1. What color? 2. If unsure, how heavy? This is the magic of decision trees!',
            },
            'actionLabel': {'zh': '演示完成', 'en': 'Demo Complete'},
            'visualizationData': {
                'data': DECISION_TREE_BASE_DATA,
                'currentFeature': None,
                'currentThreshold': None,
                'leftData': [],
                'rightData': [],
                'treeStructure': {
                    'nodes': [
                        {'id': 'root', 'type': 'split', 'feature': 'color', 'threshold': 'orange', 'samples': 8},
                        {'id': 'left', 'type': 'split', 'feature': 'weight', 'threshold': 160, 'samples': 4},
                        {'id': 'right', 'type': 'leaf', 'samples': 4, 'label': 'orange'},
                        {'id': 'left_left', 'type': 'leaf', 'samples': 2, 'label': 'apple'},
                        {'id': 'left_right', 'type': 'leaf', 'samples': 2, 'label': 'apple'},
                    ],
                    'edges': [
                        {'from': 'root', 'to': 'left', 'condition': '!= orange'},
                        {'from': 'root', 'to': 'right', 'condition': '= orange'},
                        {'from': 'left', 'to': 'left_left', 'condition': '< 160g'},
                        {'from': 'left', 'to': 'left_right', 'condition': '>= 160g'},
                    ],
                },
                'complete': True,
            },
        },
    ],
}


# ==================== SVM 演示配置 ====================

SVM_BASE_POINTS = [
    # 类别 0（蓝色）
    {'x': 1, 'y': 2, 'label': 0},
    {'x': 2, 'y': 1, 'label': 0},
    {'x': 1.5, 'y': 1.5, 'label': 0},
    {'x': 2.5, 'y': 2, 'label': 0},
    {'x': 1, 'y': 3, 'label': 0},
    # 类别 1（红色）
    {'x': 6, 'y': 6, 'label': 1},
    {'x': 7, 'y': 7, 'label': 1},
    {'x': 6.5, 'y': 6.5, 'label': 1},
    {'x': 7.5, 'y': 6, 'label': 1},
    {'x': 6, 'y': 7, 'label': 1},
]


SVM_DEMO_CONFIG = {
    'algorithmId': 'svm',
    'title': {
        'zh': '支持向量机分类演示',
        'en': 'Support Vector Machine Classification Demo',
    },
    'totalSteps': 5,
    'snapshots': [
        {
            'stepIndex': 0,
            'title': {'zh': '初始数据分布', 'en': 'Initial Data Distribution'},
            'description': {
                'zh': '我们有10个二维数据点，分为两类（蓝色和红色）。目标是找到一个最优的决策边界将它们分开。',
                'en': 'We have 10 2D data points divided into two classes (blue and red). The goal is to find an optimal decision boundary to separate them.',
            },
            'plainExplanation': {
                'zh': '想象地上有两堆不同颜色的球，你要放一根棍子把它们分开。SVM 就是找那根"最佳"的棍子。',
                'en': 'Imagine two piles of different colored balls on the ground, and you need to place a stick to separate them. SVM finds that "best" stick.',
            },
            'actionLabel': {'zh': '开始训练', 'en': 'Start Training'},
            'visualizationData': {
                'points': SVM_BASE_POINTS,
                'supportVectors': [],
                'weights': {'w1': 0, 'w2': 0, 'b': 0},
                'margin': 0,
                'kernel': 'linear',
                'accuracy': 0,
            },
        },
        {
            'stepIndex': 1,
            'title': {'zh': '初始化超平面', 'en': 'Initialize Hyperplane'},
            'description': {
                'zh': 'SVM 开始寻找最优超平面（决策边界）。初始超平面是随机选择的，还不能正确分类所有点。',
                'en': 'SVM starts searching for the optimal hyperplane (decision boundary). The initial hyperplane is randomly selected and cannot correctly classify all points yet.',
            },
            'plainExplanation': {
                'zh': '我们先随便放一根棍子，看看效果如何。这根棍子就是"超平面"，它把空间分成两半。',
                'en': 'We first place a stick randomly to see how it works. This stick is the "hyperplane" that divides the space in half.',
            },
            'actionLabel': {'zh': '优化边界', 'en': 'Optimize Boundary'},
            'visualizationData': {
                'points': SVM_BASE_POINTS,
                'supportVectors': [],
                'weights': {'w1': 1, 'w2': -1, 'b': 0},
                'margin': 0,
                'kernel': 'linear',
                'accuracy': 0.6,
            },
        },
        {
            'stepIndex': 2,
            'title': {'zh': '最大化间隔', 'en': 'Maximize Margin'},
            'description': {
                'zh': 'SVM 的核心思想：不仅要正确分类，还要让决策边界离最近的点尽可能远。这个距离就是"间隔"。',
                'en': 'The core idea of SVM: not only classify correctly, but also make the decision boundary as far as possible from the nearest points. This distance is the "margin".',
            },
            'plainExplanation': {
                'zh': '我们不仅要分开两堆球，还要让棍子离两边的球都尽可能远。这样分类才更稳定、更可靠。',
                'en': 'We not only need to separate the two piles of balls, but also keep the stick as far as possible from the balls on both sides. This makes classification more stable and reliable.',
            },
            'actionLabel': {'zh': '寻找支持向量', 'en': 'Find Support Vectors'},
            'visualizationData': {
                'points': SVM_BASE_POINTS,
                'supportVectors': [
                    {'x': 2.5, 'y': 2, 'label': 0, 'isSupportVector': True},
                    {'x': 6, 'y': 6, 'label': 1, 'isSupportVector': True},
                ],
                'weights': {'w1': 1, 'w2': 1, 'b': -4},
                'margin': 2.5,
                'kernel': 'linear',
                'accuracy': 0.8,
            },
        },
        {
            'stepIndex': 3,
            'title': {'zh': '识别支持向量', 'en': 'Identify Support Vectors'},
            'description': {
                'zh': '支持向量是离决策边界最近的点，它们决定了边界的位置。只有这些点对模型有影响。',
                'en': 'Support vectors are the points closest to the decision boundary, and they determine the position of the boundary. Only these points affect the model.',
            },
            'plainExplanation': {
                'zh': '注意那些离棍子最近的球（用大圆圈标记），它们就是"支持向量"。它们"支持"着棍子的位置，其他球不影响棍子怎么放。',
                'en': 'Notice the balls closest to the stick (marked with large circles), they are the "support vectors". They "support" the position of the stick, while other balls don\'t affect how the stick is placed.',
            },
            'actionLabel': {'zh': '完成训练', 'en': 'Complete Training'},
            'visualizationData': {
                'points': SVM_BASE_POINTS,
                'supportVectors': [
                    {'x': 2.5, 'y': 2, 'label': 0, 'isSupportVector': True},
                    {'x': 1.5, 'y': 1.5, 'label': 0, 'isSupportVector': True},
                    {'x': 6, 'y': 6, 'label': 1, 'isSupportVector': True},
                    {'x': 6.5, 'y': 6.5, 'label': 1, 'isSupportVector': True},
                ],
                'weights': {'w1': 1, 'w2': 1, 'b': -4},
                'margin': 3.5,
                'kernel': 'linear',
                'accuracy': 1.0,
            },
        },
        {
            'stepIndex': 4,
            'title': {'zh': '最优分类器完成', 'en': 'Optimal Classifier Complete'},
            'description': {
                'zh': 'SVM 找到了最优超平面，最大化了间隔。所有点都被正确分类，模型训练完成。',
                'en': 'SVM has found the optimal hyperplane, maximizing the margin. All points are correctly classified, and the model training is complete.',
            },
            'plainExplanation': {
                'zh': '完成了！这根棍子不仅分开了两堆球，而且离两边的球都最远。这就是 SVM 找到的"最佳"分类方式！',
                'en': 'Done! This stick not only separates the two piles of balls, but is also farthest from the balls on both sides. This is the "best" classification method found by SVM!',
            },
            'actionLabel': {'zh': '演示完成', 'en': 'Demo Complete'},
            'visualizationData': {
                'points': SVM_BASE_POINTS,
                'supportVectors': [
                    {'x': 2.5, 'y': 2, 'label': 0, 'isSupportVector': True},
                    {'x': 1.5, 'y': 1.5, 'label': 0, 'isSupportVector': True},
                    {'x': 6, 'y': 6, 'label': 1, 'isSupportVector': True},
                    {'x': 6.5, 'y': 6.5, 'label': 1, 'isSupportVector': True},
                ],
                'weights': {'w1': 1, 'w2': 1, 'b': -4},
                'margin': 3.5,
                'kernel': 'linear',
                'accuracy': 1.0,
                'complete': True,
            },
        },
    ],
}


# 本地数据源注册表
LOCAL_DATA_SOURCE = {
    'kmeans': KMEANS_DEMO_CONFIG,
    'linear-regression': LINEAR_REGRESSION_DEMO_CONFIG,
    'decision-tree': DECISION_TREE_DEMO_CONFIG,
    'svm': SVM_DEMO_CONFIG,
}
