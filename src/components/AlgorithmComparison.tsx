import { useState } from 'react';
import { Lang } from '../i18n/translations';
import { InteractiveDemo } from './InteractiveDemo';

interface AlgorithmComparisonProps {
  lang: Lang;
}

/**
 * 算法对比组件
 * 左右分屏展示不同算法或不同参数的效果
 */
export function AlgorithmComparison({ lang }: AlgorithmComparisonProps) {
  const [comparisonMode, setComparisonMode] = useState<'algorithm' | 'parameter'>('algorithm');
  const [leftAlgo, setLeftAlgo] = useState('kmeans');
  const [rightAlgo, setRightAlgo] = useState('linear-regression');

  const algorithms = [
    { id: 'kmeans', name: lang === 'zh' ? 'K-Means 聚类' : 'K-Means Clustering' },
    { id: 'linear-regression', name: lang === 'zh' ? '线性回归' : 'Linear Regression' },
    { id: 'decision-tree', name: lang === 'zh' ? '决策树' : 'Decision Tree' },
    { id: 'svm', name: lang === 'zh' ? '支持向量机' : 'SVM' },
  ];

  return (
    <div className="space-y-4">
      {/* 对比模式选择 */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>🔄</span>
          {lang === 'zh' ? '对比模式' : 'Comparison Mode'}
        </h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setComparisonMode('algorithm')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode === 'algorithm'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {lang === 'zh' ? '算法对比' : 'Algorithm Comparison'}
          </button>
          <button
            onClick={() => setComparisonMode('parameter')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode === 'parameter'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {lang === 'zh' ? '参数对比' : 'Parameter Comparison'}
          </button>
        </div>

        {comparisonMode === 'algorithm' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                {lang === 'zh' ? '左侧算法' : 'Left Algorithm'}
              </label>
              <select
                value={leftAlgo}
                onChange={(e) => setLeftAlgo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {algorithms.map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                {lang === 'zh' ? '右侧算法' : 'Right Algorithm'}
              </label>
              <select
                value={rightAlgo}
                onChange={(e) => setRightAlgo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {algorithms.map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {comparisonMode === 'parameter' && (
          <div className="text-sm text-slate-400 text-center py-4">
            {lang === 'zh'
              ? '选择同一算法，调整不同参数进行对比（即将推出）'
              : 'Select the same algorithm with different parameters for comparison (Coming Soon)'}
          </div>
        )}
      </div>

      {/* 对比区域 */}
      {comparisonMode === 'algorithm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧 */}
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {lang === 'zh' ? '左侧' : 'Left'}
              </h4>
              <span className="text-xs text-slate-500">
                {algorithms.find((a) => a.id === leftAlgo)?.name}
              </span>
            </div>
            <InteractiveDemo algorithmId={leftAlgo} lang={lang} />
          </div>

          {/* 右侧 */}
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {lang === 'zh' ? '右侧' : 'Right'}
              </h4>
              <span className="text-xs text-slate-500">
                {algorithms.find((a) => a.id === rightAlgo)?.name}
              </span>
            </div>
            <InteractiveDemo algorithmId={rightAlgo} lang={lang} />
          </div>
        </div>
      )}

      {comparisonMode === 'parameter' && (
        <div className="bg-slate-900/40 rounded-xl p-8 border border-slate-700/50 text-center">
          <span className="text-4xl mb-3 block">🚧</span>
          <p className="text-slate-400">
            {lang === 'zh'
              ? '参数对比功能即将推出...'
              : 'Parameter comparison feature coming soon...'}
          </p>
        </div>
      )}
    </div>
  );
}
