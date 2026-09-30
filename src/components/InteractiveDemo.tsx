import { useState, useEffect, useMemo } from 'react';
import { Lang } from '../i18n/translations';
import { ParameterControl } from './ParameterControl';
import {
  runKMeans,
  runLinearRegression,
  runDecisionTree,
  runSVM,
  runLogisticRegression,
  runKNN,
  runPCA,
  runRandomForest,
  runMLP,
  generateKMeansData,
  generateLinearData,
  generateSVMData,
  generateLogisticData,
  generatePCAData,
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
      case 'logistic-regression':
        return { learningRate: 0.01, iterations: 100, regularization: 0 };
      case 'knn':
        return { k: 3, distanceMetric: 'euclidean' };
      case 'pca':
        return { nComponents: 2 };
      case 'random-forest':
        return { nTrees: 10, maxDepth: 5, minSamplesSplit: 2 };
      case 'mlp':
        return { hiddenLayers: '4,4', learningRate: 0.01, iterations: 100 };
      default:
        return {};
    }
  };

  const [params, setParams] = useState<Record<string, any>>(getDefaultParams());
  
  // 使用 useMemo 根据 algorithmId 生成数据，确保算法切换时数据正确更新
  const data = useMemo<any>(() => {
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
      case 'logistic-regression':
        return generateLogisticData(40);
      case 'knn':
        return generateLogisticData(40);
      case 'pca':
        return generatePCAData(50, 3);
      case 'random-forest':
        return generateLogisticData(40);
      case 'mlp':
        return generateLogisticData(40);
      default:
        return [];
    }
  }, [algorithmId]);

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
      case 'logistic-regression':
        return runLogisticRegression(data, params as any);
      case 'knn': {
        const trainData = data.slice(0, Math.floor(data.length * 0.7));
        const testData = data.slice(Math.floor(data.length * 0.7));
        return runKNN(trainData, testData, params as any);
      }
      case 'pca':
        return runPCA(data, params as any);
      case 'random-forest': {
        const trainData = data.slice(0, Math.floor(data.length * 0.7));
        const testData = data.slice(Math.floor(data.length * 0.7));
        return runRandomForest(trainData, testData, params as any);
      }
      case 'mlp': {
        const mlpParams = {
          ...params,
          hiddenLayers: (params.hiddenLayers as string).split(',').map(Number)
        };
        return runMLP(data, mlpParams as any);
      }
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
      case 'logistic-regression': {
        const lrResult = result as any;
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '决策边界' : 'Decision Boundary'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {lang === 'zh' 
                  ? '逻辑回归学习一个线性决策边界来区分两个类别。'
                  : 'Logistic regression learns a linear decision boundary to separate two classes.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '权重' : 'Weights'}
                  </div>
                  <div className="text-sm font-mono text-indigo-400 mt-1">
                    {lrResult.weights.map((w: number, i: number) => (
                      <div key={i}>w{i + 1}: {w.toFixed(3)}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '偏置' : 'Bias'}
                  </div>
                  <div className="text-sm font-mono text-indigo-400 mt-1">
                    b: {lrResult.bias.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '损失曲线' : 'Loss Curve'}
              </h4>
              <div className="h-32 flex items-end gap-1">
                {lrResult.lossHistory.slice(-20).map((loss: number, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                    style={{
                      height: `${Math.min(100, (loss / Math.max(...lrResult.lossHistory)) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'knn': {
        const knnResult = result as any;
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? 'KNN 预测结果' : 'KNN Predictions'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {lang === 'zh'
                  ? `使用 ${params.k} 个最近邻进行投票决策。`
                  : `Using ${params.k} nearest neighbors for voting.`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '训练样本' : 'Training Samples'}
                  </div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    {Math.floor(data.length * 0.7)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '测试样本' : 'Test Samples'}
                  </div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    {data.length - Math.floor(data.length * 0.7)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '预测详情' : 'Prediction Details'}
              </h4>
              <div className="space-y-2">
                {knnResult.predictions.slice(0, 5).map((pred: number, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {lang === 'zh' ? '样本' : 'Sample'} {i + 1}
                    </span>
                    <span className={`font-mono ${pred === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {lang === 'zh' ? '类别' : 'Class'} {pred}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'pca': {
        const pcaResult = result as any;
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '主成分分析' : 'Principal Component Analysis'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {lang === 'zh'
                  ? 'PCA 将数据投影到方差最大的方向上，实现降维。'
                  : 'PCA projects data onto directions of maximum variance for dimensionality reduction.'}
              </p>
              <div className="space-y-2">
                {pcaResult.explainedVariance.map((variance: number, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-12">PC{i + 1}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${variance * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-indigo-400 w-16 text-right">
                      {(variance * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '降维效果' : 'Dimensionality Reduction'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '原始维度' : 'Original'}
                  </div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    {data[0].features.length}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-xs text-slate-400">
                    {lang === 'zh' ? '降维后' : 'Reduced'}
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {pcaResult.components.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'random-forest': {
        const rfResult = result as any;
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '随机森林' : 'Random Forest'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {lang === 'zh'
                  ? `由 ${params.nTrees} 棵决策树组成的集成模型。`
                  : `Ensemble of ${params.nTrees} decision trees.`}
              </p>
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-xs text-slate-400 mb-2">
                  {lang === 'zh' ? '特征重要性' : 'Feature Importance'}
                </div>
                <div className="space-y-1">
                  {rfResult.featureImportance.map((importance: number, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">F{i + 1}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-emerald-400 w-12 text-right">
                        {(importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'mlp': {
        const mlpResult = result as any;
        const hiddenLayers = (params.hiddenLayers as string).split(',').map(Number);
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '神经网络结构' : 'Neural Network Architecture'}
              </h4>
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/30 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold">
                    IN
                  </div>
                  <div className="text-xs text-slate-400 mt-1">2</div>
                </div>
                {hiddenLayers.map((size, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/30 border-2 border-purple-500 flex items-center justify-center text-xs font-bold">
                      H{i + 1}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{size}</div>
                  </div>
                ))}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/30 border-2 border-emerald-500 flex items-center justify-center text-xs font-bold">
                    OUT
                  </div>
                  <div className="text-xs text-slate-400 mt-1">2</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                {lang === 'zh' ? '训练损失' : 'Training Loss'}
              </h4>
              <div className="h-32 flex items-end gap-1">
                {mlpResult.lossHistory.slice(-20).map((loss: number, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                    style={{
                      height: `${Math.min(100, (loss / Math.max(...mlpResult.lossHistory)) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
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
      case 'logistic-regression': {
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
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(lrResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '迭代次数' : 'Iterations'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {lrResult.lossHistory.length}
              </div>
            </div>
          </div>
        );
      }
      case 'knn': {
        const knnResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">K 值</div>
              <div className="text-lg font-bold text-indigo-400">
                {params.k}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(knnResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '距离度量' : 'Distance'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {params.distanceMetric === 'euclidean' ? 'L2' : 'L1'}
              </div>
            </div>
          </div>
        );
      }
      case 'pca': {
        const pcaResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '主成分数' : 'Components'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {pcaResult.components.length}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '解释方差' : 'Variance Explained'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(pcaResult.totalVarianceExplained * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '第一主成分' : 'PC1 Variance'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {(pcaResult.explainedVariance[0] * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        );
      }
      case 'random-forest': {
        const rfResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '树的数量' : 'Trees'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {params.nTrees}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(rfResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '最大深度' : 'Max Depth'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                {params.maxDepth}
              </div>
            </div>
          </div>
        );
      }
      case 'mlp': {
        const mlpResult = result as any;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '最终损失' : 'Final Loss'}
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {mlpResult.finalLoss.toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '准确率' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {(mlpResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '网络结构' : 'Architecture'}
              </div>
              <div className="text-lg font-bold text-purple-400">
                [{params.hiddenLayers}]
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
