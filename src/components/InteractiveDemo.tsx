import { useState, useEffect, useMemo } from 'react';
import { Lang } from '../i18n/translations';
import { ParameterControl } from './ParameterControl';
import {
  runKMeans,
  runLinearRegression,
  runDecisionTree,
  runSVM,
  generateKMeansData,
  generateLinearData,
  generateSVMData,
} from '../algorithms';
import { KMeansVisualizer } from './demos/KMeansVisualizer';
import { LinearRegressionVisualizer } from './demos/LinearRegressionVisualizer';
import { DecisionTreeVisualizer } from './demos/DecisionTreeVisualizer';
import { SVMVisualizer } from './demos/SVMVisualizer';

interface InteractiveDemoProps {
  algorithmId: string;
  lang: Lang;
}

/**
 * 交互式演示组件
 * 整合参数控制和实时可视化
 */
export function InteractiveDemo({ algorithmId, lang }: InteractiveDemoProps) {
  // 默认参数
  const getDefaultParams = () => {
    switch (algorithmId) {
      case 'kmeans':
        return { k: 3, maxIterations: 50, initialization: 'kmeans++' };
      case 'linear-regression':
        return { learningRate: 0.01, iterations: 100, regularization: 0 };
      case 'decision-tree':
        return { maxDepth: 3, minSamplesSplit: 2, criterion: 'gini' };
      case 'svm':
        return { C: 1, kernel: 'linear', iterations: 500 };
      default:
        return {};
    }
  };

  const [params, setParams] = useState<Record<string, any>>(getDefaultParams());
  const [data] = useState<any>(() => {
    // 生成固定数据集（使用种子确保一致性）
    switch (algorithmId) {
      case 'kmeans':
        return generateKMeansData(30, 3);
      case 'linear-regression':
        return generateLinearData(20, 1);
      case 'decision-tree':
        return [
          { weight: 150, color: 'red', label: 'apple' },
          { weight: 170, color: 'red', label: 'apple' },
          { weight: 140, color: 'green', label: 'apple' },
          { weight: 160, color: 'orange', label: 'orange' },
          { weight: 180, color: 'orange', label: 'orange' },
          { weight: 155, color: 'orange', label: 'orange' },
          { weight: 165, color: 'red', label: 'apple' },
          { weight: 175, color: 'orange', label: 'orange' },
        ];
      case 'svm':
        return generateSVMData(20);
      default:
        return [];
    }
  });

  // 运行算法
  const result = useMemo(() => {
    switch (algorithmId) {
      case 'kmeans':
        return runKMeans(data, params as any);
      case 'linear-regression':
        return runLinearRegression(data, params as any);
      case 'decision-tree':
        return runDecisionTree(data, params as any);
      case 'svm':
        return runSVM(data, params as any);
      default:
        return null;
    }
  }, [algorithmId, data, params]);

  // 重置参数
  const handleReset = () => {
    setParams(getDefaultParams());
  };

  // 渲染可视化
  const renderVisualization = () => {
    if (!result) return null;

    switch (algorithmId) {
      case 'kmeans': {
        const kmeansResult = result as any;
        const points = data.map((p: any, i: number) => ({
          ...p,
          cluster: kmeansResult.labels[i],
        }));
        return (
          <KMeansVisualizer
            visualizationData={{
              points,
              centers: kmeansResult.centers,
              converged: kmeansResult.converged,
            }}
            lang={lang}
          />
        );
      }
      case 'linear-regression': {
        const lrResult = result as any;
        const points = data.map((p: any) => ({
          ...p,
          predicted: lrResult.w * p.x + lrResult.b,
          residual: p.y - (lrResult.w * p.x + lrResult.b),
        }));
        return (
          <LinearRegressionVisualizer
            visualizationData={{
              points,
              weights: { w: lrResult.w, b: lrResult.b },
              loss: lrResult.finalLoss,
              learningRate: params.learningRate as number,
              iteration: params.iterations as number,
            }}
            lang={lang}
          />
        );
      }
      case 'decision-tree': {
        const dtResult = result as any;
        return (
          <DecisionTreeVisualizer
            visualizationData={{
              data,
              currentFeature: null,
              currentThreshold: null,
              leftData: [],
              rightData: [],
              treeStructure: { nodes: [], edges: [] },
              complete: true,
            }}
            lang={lang}
          />
        );
      }
      case 'svm': {
        const svmResult = result as any;
        return (
          <SVMVisualizer
            visualizationData={{
              points: data,
              supportVectors: svmResult.supportVectors,
              weights: svmResult.weights,
              margin: svmResult.margin,
              kernel: params.kernel as any,
              accuracy: svmResult.accuracy,
              complete: true,
            }}
            lang={lang}
          />
        );
      }
      default:
        return null;
    }
  };

  // 渲染性能指标
  const renderMetrics = () => {
    if (!result) return null;

    switch (algorithmId) {
      case 'kmeans': {
        const kmeansResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '迭代次数' : 'Iterations'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {kmeansResult.iterations}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '收敛' : 'Converged'}
              </div>
              <div
                className={`text-lg font-bold ${
                  kmeansResult.converged ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {kmeansResult.converged
                  ? lang === 'zh'
                    ? '是'
                    : 'Yes'
                  : lang === 'zh'
                  ? '否'
                  : 'No'}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">Inertia</div>
              <div className="text-lg font-bold text-purple-400">
                {kmeansResult.inertia.toFixed(2)}
              </div>
            </div>
          </div>
        );
      }
      case 'linear-regression': {
        const lrResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '最终损失' : 'Final Loss'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {lrResult.finalLoss.toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">R²</div>
              <div className="text-lg font-bold text-emerald-400">
                {lrResult.r2.toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '权重 w' : 'Weight w'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {lrResult.w.toFixed(3)}
              </div>
            </div>
          </div>
        );
      }
      case 'decision-tree': {
        const dtResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '树深度' : 'Depth'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {dtResult.depth}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '节点数' : 'Nodes'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {dtResult.totalNodes}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(dtResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        );
      }
      case 'svm': {
        const svmResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '间隔' : 'Margin'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {svmResult.margin.toFixed(3)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(svmResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '支持向量' : 'Support Vectors'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {svmResult.supportVectors.length}
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 参数控制 */}
      <ParameterControl
        algorithmId={algorithmId}
        params={params}
        onParamsChange={setParams}
        lang={lang}
      />

      {/* 性能指标 */}
      {renderMetrics()}

      {/* 可视化 */}
      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
        {renderVisualization()}
      </div>

      {/* 重置按钮 */}
      <button
        onClick={handleReset}
        className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
      >
        {lang === 'zh' ? '🔄 重置参数' : '🔄 Reset Parameters'}
      </button>
    </div>
  );
}
