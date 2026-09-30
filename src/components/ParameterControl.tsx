import { useState } from 'react';
import { Lang } from '../i18n/translations';

interface ParameterControlProps {
  algorithmId: string;
  params: Record<string, number | string>;
  onParamsChange: (params: Record<string, number | string>) => void;
  lang: Lang;
}

/**
 * 参数控制面板组件
 * 根据不同算法显示不同的参数滑块
 */
export function ParameterControl({
  algorithmId,
  params,
  onParamsChange,
  lang,
}: ParameterControlProps) {
  const handleChange = (key: string, value: number | string) => {
    onParamsChange({ ...params, [key]: value });
  };

  const getParamConfig = () => {
    switch (algorithmId) {
      case 'kmeans':
        return [
          {
            key: 'k',
            label: lang === 'zh' ? '聚类数 K' : 'Number of Clusters K',
            min: 2,
            max: 6,
            step: 1,
            type: 'number' as const,
          },
          {
            key: 'maxIterations',
            label: lang === 'zh' ? '最大迭代次数' : 'Max Iterations',
            min: 10,
            max: 100,
            step: 10,
            type: 'number' as const,
          },
          {
            key: 'initialization',
            label: lang === 'zh' ? '初始化方式' : 'Initialization',
            options: [
              { value: 'random', label: lang === 'zh' ? '随机' : 'Random' },
              { value: 'kmeans++', label: 'K-Means++' },
            ],
            type: 'select' as const,
          },
        ];
      case 'linear-regression':
        return [
          {
            key: 'learningRate',
            label: lang === 'zh' ? '学习率' : 'Learning Rate',
            min: 0.001,
            max: 0.1,
            step: 0.001,
            type: 'number' as const,
          },
          {
            key: 'iterations',
            label: lang === 'zh' ? '迭代次数' : 'Iterations',
            min: 10,
            max: 500,
            step: 10,
            type: 'number' as const,
          },
          {
            key: 'regularization',
            label: lang === 'zh' ? '正则化系数' : 'Regularization',
            min: 0,
            max: 1,
            step: 0.01,
            type: 'number' as const,
          },
        ];
      case 'decision-tree':
        return [
          {
            key: 'maxDepth',
            label: lang === 'zh' ? '最大深度' : 'Max Depth',
            min: 1,
            max: 5,
            step: 1,
            type: 'number' as const,
          },
          {
            key: 'minSamplesSplit',
            label: lang === 'zh' ? '最小分裂样本数' : 'Min Samples Split',
            min: 2,
            max: 10,
            step: 1,
            type: 'number' as const,
          },
          {
            key: 'criterion',
            label: lang === 'zh' ? '分裂准则' : 'Criterion',
            options: [
              { value: 'gini', label: 'Gini' },
              { value: 'entropy', label: lang === 'zh' ? '信息熵' : 'Entropy' },
            ],
            type: 'select' as const,
          },
        ];
      case 'svm':
        return [
          {
            key: 'C',
            label: lang === 'zh' ? '正则化参数 C' : 'Regularization C',
            min: 0.1,
            max: 10,
            step: 0.1,
            type: 'number' as const,
          },
          {
            key: 'kernel',
            label: lang === 'zh' ? '核函数' : 'Kernel',
            options: [
              { value: 'linear', label: lang === 'zh' ? '线性' : 'Linear' },
              { value: 'rbf', label: 'RBF' },
            ],
            type: 'select' as const,
          },
          {
            key: 'iterations',
            label: lang === 'zh' ? '迭代次数' : 'Iterations',
            min: 100,
            max: 1000,
            step: 100,
            type: 'number' as const,
          },
        ];
      default:
        return [];
    }
  };

  const paramConfigs = getParamConfig();

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <span>⚙️</span>
        {lang === 'zh' ? '参数调节' : 'Parameter Control'}
      </h3>

      <div className="space-y-4">
        {paramConfigs.map((config) => (
          <div key={config.key}>
            <label className="block text-xs text-slate-400 mb-1.5">
              {config.label}
            </label>

            {config.type === 'number' && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={params[config.key] as number}
                  onChange={(e) => handleChange(config.key, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-sm font-mono text-indigo-400 min-w-[60px] text-right">
                  {typeof params[config.key] === 'number'
                    ? (params[config.key] as number).toFixed(
                        config.step < 1 ? 3 : 0
                      )
                    : params[config.key]}
                </span>
              </div>
            )}

            {config.type === 'select' && (
              <select
                value={params[config.key] as string}
                onChange={(e) => handleChange(config.key, e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {config.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
