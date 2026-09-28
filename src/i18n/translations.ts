export type Lang = 'zh' | 'en';

export const translations = {
  zh: {
    // Header
    title: '机器学习算法学习指南',
    subtitle: (count: number, catCount: number) =>
      `系统学习 ${count} 种常用机器学习算法，涵盖监督学习、无监督学习、集成学习、深度学习和强化学习五大类别`,
    
    // Filters
    all: '全部',
    searchPlaceholder: '搜索算法...',
    viewDetails: '查看详情 →',
    complexity: '复杂度',
    
    // Category Overview
    categoryOverview: '算法分类概览',
    
    // Learning Path
    learningPath: '推荐学习路径',
    steps: [
      { title: '基础入门', desc: '线性回归 → 逻辑回归 → 决策树' },
      { title: '经典算法', desc: 'SVM → KNN → 朴素贝叶斯' },
      { title: '集成方法', desc: '随机森林 → 梯度提升 → XGBoost' },
      { title: '深度学习', desc: 'MLP → CNN → RNN → Transformer' },
      { title: '高级主题', desc: 'GAN → 强化学习 → PPO' },
    ],
    
    // Modal
    intro: '简介',
    principle: '核心原理',
    formula: '核心公式',
    useCases: '应用场景',
    pros: '优点',
    cons: '缺点',
    timeComplexity: '时间复杂度',
    
    // Footer
    footer: (count: number, catCount: number) =>
      `机器学习算法学习指南 | 共收录 ${count} 种算法，涵盖 ${catCount} 大类别`,
    footerHint: '点击任意算法卡片查看详细原理、应用场景和优缺点分析',
    
    // Empty state
    noResults: '没有找到匹配的算法',
    
    // Language
    language: 'English',
  },
  en: {
    // Header
    title: 'Machine Learning Algorithms Guide',
    subtitle: (count: number, catCount: number) =>
      `Systematically learn ${count} common ML algorithms across 5 categories: Supervised, Unsupervised, Ensemble, Deep Learning, and Reinforcement Learning`,
    
    // Filters
    all: 'All',
    searchPlaceholder: 'Search algorithms...',
    viewDetails: 'Details →',
    complexity: 'Complexity',
    
    // Category Overview
    categoryOverview: 'Category Overview',
    
    // Learning Path
    learningPath: 'Recommended Learning Path',
    steps: [
      { title: 'Fundamentals', desc: 'Linear Regression → Logistic Regression → Decision Tree' },
      { title: 'Classic Algorithms', desc: 'SVM → KNN → Naive Bayes' },
      { title: 'Ensemble Methods', desc: 'Random Forest → Gradient Boosting → XGBoost' },
      { title: 'Deep Learning', desc: 'MLP → CNN → RNN → Transformer' },
      { title: 'Advanced Topics', desc: 'GAN → Reinforcement Learning → PPO' },
    ],
    
    // Modal
    intro: 'Introduction',
    principle: 'Core Principle',
    formula: 'Key Formula',
    useCases: 'Use Cases',
    pros: 'Pros',
    cons: 'Cons',
    timeComplexity: 'Time Complexity',
    
    // Footer
    footer: (count: number, catCount: number) =>
      `ML Algorithms Guide | ${count} algorithms across ${catCount} categories`,
    footerHint: 'Click any algorithm card to view detailed principles, use cases, and pros/cons analysis',
    
    // Empty state
    noResults: 'No matching algorithms found',
    
    // Language
    language: '中文',
  },
};
