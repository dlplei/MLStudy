/**
 * 决策树演示数据
 * 模拟决策树的构建过程，5个关键步骤
 */
import { DemoConfig } from '../types/demo';

// 基础数据：二分类问题（苹果 vs 橙子）
const baseData = [
  { weight: 150, color: 'red', label: 'apple' },
  { weight: 170, color: 'red', label: 'apple' },
  { weight: 140, color: 'green', label: 'apple' },
  { weight: 160, color: 'orange', label: 'orange' },
  { weight: 180, color: 'orange', label: 'orange' },
  { weight: 155, color: 'orange', label: 'orange' },
  { weight: 165, color: 'red', label: 'apple' },
  { weight: 175, color: 'orange', label: 'orange' },
];

export const decisionTreeDemoConfig: DemoConfig = {
  algorithmId: 'decision-tree',
  title: {
    zh: '决策树构建过程演示',
    en: 'Decision Tree Building Process Demo',
  },
  totalSteps: 5,
  snapshots: [
    {
      stepIndex: 0,
      title: { zh: '初始数据集', en: 'Initial Dataset' },
      description: {
        zh: '我们有8个水果样本，需要根据重量和颜色分类为苹果或橙子。决策树将从这个数据集开始构建。',
        en: 'We have 8 fruit samples that need to be classified as apple or orange based on weight and color. The decision tree will start building from this dataset.',
      },
      plainExplanation: {
        zh: '想象你有一堆水果，你要通过问问题的方式来区分苹果和橙子。决策树就是这样一个"问问题"的过程。',
        en: 'Imagine you have a pile of fruits and you need to distinguish apples from oranges by asking questions. A decision tree is exactly this "question-asking" process.',
      },
      actionLabel: { zh: '开始构建', en: 'Start Building' },
      visualizationData: {
        data: baseData,
        currentFeature: null,
        currentThreshold: null,
        leftData: [],
        rightData: [],
        treeStructure: {
          nodes: [{ id: 'root', type: 'root', samples: 8 }],
          edges: [],
        },
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 1,
      title: { zh: '选择最佳分裂特征', en: 'Select Best Split Feature' },
      description: {
        zh: '算法计算每个特征的信息增益，选择"颜色"作为最佳分裂特征。颜色能更好地区分苹果和橙子。',
        en: 'The algorithm calculates information gain for each feature and selects "color" as the best split feature. Color can better distinguish apples from oranges.',
      },
      plainExplanation: {
        zh: '我们先问："这个水果是什么颜色？" 因为颜色是最容易区分苹果和橙子的特征。',
        en: 'We first ask: "What color is this fruit?" Because color is the easiest feature to distinguish apples from oranges.',
      },
      actionLabel: { zh: '进行分裂', en: 'Perform Split' },
      visualizationData: {
        data: baseData,
        currentFeature: 'color',
        currentThreshold: 'orange',
        leftData: baseData.filter(d => d.color !== 'orange'),
        rightData: baseData.filter(d => d.color === 'orange'),
        treeStructure: {
          nodes: [
            { id: 'root', type: 'split', feature: 'color', threshold: 'orange', samples: 8 },
            { id: 'left', type: 'leaf', samples: 4, label: 'pending' },
            { id: 'right', type: 'leaf', samples: 4, label: 'pending' },
          ],
          edges: [
            { from: 'root', to: 'left', condition: '!= orange' },
            { from: 'root', to: 'right', condition: '= orange' },
          ],
        },
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 2,
      title: { zh: '第一次分裂结果', en: 'First Split Result' },
      description: {
        zh: '根据颜色分裂后，右边节点（橙色）全部是橙子，成为叶节点。左边节点（非橙色）还需要进一步分裂。',
        en: 'After splitting by color, the right node (orange) contains only oranges and becomes a leaf node. The left node (non-orange) needs further splitting.',
      },
      plainExplanation: {
        zh: '如果是橙色，那就是橙子！这个分支完成了。但红色的可能是苹果也可能是橙子，需要继续问问题。',
        en: 'If it\'s orange, it\'s an orange! This branch is done. But red ones could be apples or oranges, we need to ask more questions.',
      },
      actionLabel: { zh: '继续分裂', en: 'Continue Splitting' },
      visualizationData: {
        data: baseData,
        currentFeature: 'color',
        currentThreshold: 'orange',
        leftData: baseData.filter(d => d.color !== 'orange'),
        rightData: baseData.filter(d => d.color === 'orange'),
        treeStructure: {
          nodes: [
            { id: 'root', type: 'split', feature: 'color', threshold: 'orange', samples: 8 },
            { id: 'left', type: 'split', feature: 'weight', threshold: 160, samples: 4 },
            { id: 'right', type: 'leaf', samples: 4, label: 'orange' },
            { id: 'left_left', type: 'leaf', samples: 2, label: 'pending' },
            { id: 'left_right', type: 'leaf', samples: 2, label: 'pending' },
          ],
          edges: [
            { from: 'root', to: 'left', condition: '!= orange' },
            { from: 'root', to: 'right', condition: '= orange' },
            { from: 'left', to: 'left_left', condition: '< 160g' },
            { from: 'left', to: 'left_right', condition: '>= 160g' },
          ],
        },
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 3,
      title: { zh: '第二次分裂', en: 'Second Split' },
      description: {
        zh: '对左边的非橙色样本，选择"重量"作为分裂特征，以160g为阈值进行分裂。',
        en: 'For the left non-orange samples, select "weight" as the split feature and split with 160g as the threshold.',
      },
      plainExplanation: {
        zh: '对于不是橙色的水果，我们再问："它有多重？" 如果小于160克，可能是某种水果；如果大于等于160克，可能是另一种。',
        en: 'For fruits that are not orange, we ask again: "How heavy is it?" If less than 160g, it might be one type; if >= 160g, it might be another.',
      },
      actionLabel: { zh: '完成构建', en: 'Complete Building' },
      visualizationData: {
        data: baseData,
        currentFeature: 'weight',
        currentThreshold: 160,
        leftData: baseData.filter(d => d.color !== 'orange' && d.weight < 160),
        rightData: baseData.filter(d => d.color !== 'orange' && d.weight >= 160),
        treeStructure: {
          nodes: [
            { id: 'root', type: 'split', feature: 'color', threshold: 'orange', samples: 8 },
            { id: 'left', type: 'split', feature: 'weight', threshold: 160, samples: 4 },
            { id: 'right', type: 'leaf', samples: 4, label: 'orange' },
            { id: 'left_left', type: 'leaf', samples: 2, label: 'apple' },
            { id: 'left_right', type: 'leaf', samples: 2, label: 'apple' },
          ],
          edges: [
            { from: 'root', to: 'left', condition: '!= orange' },
            { from: 'root', to: 'right', condition: '= orange' },
            { from: 'left', to: 'left_left', condition: '< 160g' },
            { from: 'left', to: 'left_right', condition: '>= 160g' },
          ],
        },
      },
      stepMeta: {
        generationTimeMs: 0,
        source: 'compute',
        version: '1.0.0',
      },
    },
    {
      stepIndex: 4,
      title: { zh: '决策树构建完成', en: 'Decision Tree Complete' },
      description: {
        zh: '所有叶节点都是纯净的（只包含一种类别）。决策树构建完成，可以用来预测新样本的类别。',
        en: 'All leaf nodes are pure (contain only one class). The decision tree is complete and can be used to predict the class of new samples.',
      },
      plainExplanation: {
        zh: '完成了！现在你可以通过问两个问题来判断任何水果：1. 什么颜色？2. 如果不确定，有多重？这就是决策树的魅力！',
        en: 'Done! Now you can classify any fruit by asking two questions: 1. What color? 2. If unsure, how heavy? This is the magic of decision trees!',
      },
      actionLabel: { zh: '演示完成', en: 'Demo Complete' },
      visualizationData: {
        data: baseData,
        currentFeature: null,
        currentThreshold: null,
        leftData: [],
        rightData: [],
        treeStructure: {
          nodes: [
            { id: 'root', type: 'split', feature: 'color', threshold: 'orange', samples: 8 },
            { id: 'left', type: 'split', feature: 'weight', threshold: 160, samples: 4 },
            { id: 'right', type: 'leaf', samples: 4, label: 'orange' },
            { id: 'left_left', type: 'leaf', samples: 2, label: 'apple' },
            { id: 'left_right', type: 'leaf', samples: 2, label: 'apple' },
          ],
          edges: [
            { from: 'root', to: 'left', condition: '!= orange' },
            { from: 'root', to: 'right', condition: '= orange' },
            { from: 'left', to: 'left_left', condition: '< 160g' },
            { from: 'left', to: 'left_right', condition: '>= 160g' },
          ],
        },
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
