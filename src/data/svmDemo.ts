/**
 * SVM（支持向量机）演示数据
 * 模拟 SVM 的分类过程，5个关键步骤
 */
import { DemoConfig } from '../types/demo';

// 基础数据：二分类问题（两类点）
const basePoints = [
  // 类别 0（蓝色）
  { x: 1, y: 2, label: 0 },
  { x: 2, y: 1, label: 0 },
  { x: 1.5, y: 1.5, label: 0 },
  { x: 2.5, y: 2, label: 0 },
  { x: 1, y: 3, label: 0 },
  // 类别 1（红色）
  { x: 6, y: 6, label: 1 },
  { x: 7, y: 7, label: 1 },
  { x: 6.5, y: 6.5, label: 1 },
  { x: 7.5, y: 6, label: 1 },
  { x: 6, y: 7, label: 1 },
];

export const svmDemoConfig: DemoConfig = {
  algorithmId: 'svm',
  title: {
    zh: '支持向量机分类演示',
    en: 'Support Vector Machine Classification Demo',
  },
  totalSteps: 5,
  snapshots: [
    {
      stepIndex: 0,
      title: { zh: '初始数据分布', en: 'Initial Data Distribution' },
      description: {
        zh: '我们有10个二维数据点，分为两类（蓝色和红色）。目标是找到一个最优的决策边界将它们分开。',
        en: 'We have 10 2D data points divided into two classes (blue and red). The goal is to find an optimal decision boundary to separate them.',
      },
      plainExplanation: {
        zh: '想象地上有两堆不同颜色的球，你要放一根棍子把它们分开。SVM 就是找那根"最佳"的棍子。',
        en: 'Imagine two piles of different colored balls on the ground, and you need to place a stick to separate them. SVM finds that "best" stick.',
      },
      actionLabel: { zh: '开始训练', en: 'Start Training' },
      visualizationData: {
        points: basePoints,
        supportVectors: [],
        weights: { w1: 0, w2: 0, b: 0 },
        margin: 0,
        kernel: 'linear',
        accuracy: 0,
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 1,
      title: { zh: '初始化超平面', en: 'Initialize Hyperplane' },
      description: {
        zh: 'SVM 开始寻找最优超平面（决策边界）。初始超平面是随机选择的，还不能正确分类所有点。',
        en: 'SVM starts searching for the optimal hyperplane (decision boundary). The initial hyperplane is randomly selected and cannot correctly classify all points yet.',
      },
      plainExplanation: {
        zh: '我们先随便放一根棍子，看看效果如何。这根棍子就是"超平面"，它把空间分成两半。',
        en: 'We first place a stick randomly to see how it works. This stick is the "hyperplane" that divides the space in half.',
      },
      actionLabel: { zh: '优化边界', en: 'Optimize Boundary' },
      visualizationData: {
        points: basePoints,
        supportVectors: [],
        weights: { w1: 1, w2: -1, b: 0 },
        margin: 0,
        kernel: 'linear',
        accuracy: 0.6,
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 2,
      title: { zh: '最大化间隔', en: 'Maximize Margin' },
      description: {
        zh: 'SVM 的核心思想：不仅要正确分类，还要让决策边界离最近的点尽可能远。这个距离就是"间隔"。',
        en: 'The core idea of SVM: not only classify correctly, but also make the decision boundary as far as possible from the nearest points. This distance is the "margin".',
      },
      plainExplanation: {
        zh: '我们不仅要分开两堆球，还要让棍子离两边的球都尽可能远。这样分类才更稳定、更可靠。',
        en: 'We not only need to separate the two piles of balls, but also keep the stick as far as possible from the balls on both sides. This makes classification more stable and reliable.',
      },
      actionLabel: { zh: '寻找支持向量', en: 'Find Support Vectors' },
      visualizationData: {
        points: basePoints,
        supportVectors: [
          { x: 2.5, y: 2, label: 0, isSupportVector: true },
          { x: 6, y: 6, label: 1, isSupportVector: true },
        ],
        weights: { w1: 1, w2: 1, b: -4 },
        margin: 2.5,
        kernel: 'linear',
        accuracy: 0.8,
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 3,
      title: { zh: '识别支持向量', en: 'Identify Support Vectors' },
      description: {
        zh: '支持向量是离决策边界最近的点，它们决定了边界的位置。只有这些点对模型有影响。',
        en: 'Support vectors are the points closest to the decision boundary, and they determine the position of the boundary. Only these points affect the model.',
      },
      plainExplanation: {
        zh: '注意那些离棍子最近的球（用大圆圈标记），它们就是"支持向量"。它们"支持"着棍子的位置，其他球不影响棍子怎么放。',
        en: 'Notice the balls closest to the stick (marked with large circles), they are the "support vectors". They "support" the position of the stick, while other balls don\'t affect how the stick is placed.',
      },
      actionLabel: { zh: '完成训练', en: 'Complete Training' },
      visualizationData: {
        points: basePoints,
        supportVectors: [
          { x: 2.5, y: 2, label: 0, isSupportVector: true },
          { x: 1.5, y: 1.5, label: 0, isSupportVector: true },
          { x: 6, y: 6, label: 1, isSupportVector: true },
          { x: 6.5, y: 6.5, label: 1, isSupportVector: true },
        ],
        weights: { w1: 1, w2: 1, b: -4 },
        margin: 3.5,
        kernel: 'linear',
        accuracy: 1.0,
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 4,
      title: { zh: '最优分类器完成', en: 'Optimal Classifier Complete' },
      description: {
        zh: 'SVM 找到了最优超平面，最大化了间隔。所有点都被正确分类，模型训练完成。',
        en: 'SVM has found the optimal hyperplane, maximizing the margin. All points are correctly classified, and the model training is complete.',
      },
      plainExplanation: {
        zh: '完成了！这根棍子不仅分开了两堆球，而且离两边的球都最远。这就是 SVM 找到的"最佳"分类方式！',
        en: 'Done! This stick not only separates the two piles of balls, but is also farthest from the balls on both sides. This is the "best" classification method found by SVM!',
      },
      actionLabel: { zh: '演示完成', en: 'Demo Complete' },
      visualizationData: {
        points: basePoints,
        supportVectors: [
          { x: 2.5, y: 2, label: 0, isSupportVector: true },
          { x: 1.5, y: 1.5, label: 0, isSupportVector: true },
          { x: 6, y: 6, label: 1, isSupportVector: true },
          { x: 6.5, y: 6.5, label: 1, isSupportVector: true },
        ],
        weights: { w1: 1, w2: 1, b: -4 },
        margin: 3.5,
        kernel: 'linear',
        accuracy: 1.0,
        complete: true,
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
  ],
};
