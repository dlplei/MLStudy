import { useAlgorithmDemo } from '../../hooks/useAlgorithmDemo';
import { DemoControls } from '../DemoControls';
import { KMeansVisualizer } from './KMeansVisualizer';
import { LinearRegressionVisualizer } from './LinearRegressionVisualizer';
import { Lang } from '../../i18n/translations';
import { KMeansVisualizationData, LinearRegressionVisualizationData } from '../../types/demo';
import { demoService } from '../../services/DemoService';

interface AlgorithmDemoContainerProps {
  algorithmId: string;
  lang: Lang;
}

/**
 * 算法演示容器组件 (Phase 2)
 * 
 * 通过 useAlgorithmDemo Hook 获取数据（经过 DemoService + LRU 缓存）
 * 包含完整的降级机制和加载状态处理
 */
export function AlgorithmDemoContainer({ algorithmId, lang }: AlgorithmDemoContainerProps) {
  const demoState = useAlgorithmDemo(algorithmId, 2500);
  const { currentSnapshot, error, isLoading, isDegraded, config } = demoState;

  // 加载状态
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-8 border border-slate-700/30 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-300 text-sm">
            {lang === 'zh' ? '正在加载演示数据...' : 'Loading demo data...'}
          </span>
        </div>
      </div>
    );
  }

  // 降级状态
  if (isDegraded || error) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-6 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-amber-400 font-medium text-sm mb-1">
              {lang === 'zh'
                ? '动态演示暂时不可用'
                : 'Dynamic demo temporarily unavailable'}
            </h4>
            <p className="text-slate-400 text-xs">
              {lang === 'zh'
                ? '已为您切换至静态图解模式。请查看上方"算法详情"标签页了解原理。'
                : 'Switched to static illustration mode. Please check the "Details" tab for principles.'}
            </p>
            {error && (
              <p className="text-slate-500 text-xs mt-2 font-mono">
                Debug: {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentSnapshot || !config) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700/30 text-center">
        <p className="text-slate-400 text-sm">
          {lang === 'zh' ? '暂无数据' : 'No data available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 步骤标题和通俗解说 */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
            {currentSnapshot.stepIndex + 1}
          </span>
          <h4 className="font-semibold text-white text-sm">
            {lang === 'zh' ? currentSnapshot.title.zh : currentSnapshot.title.en}
          </h4>
        </div>
        {/* 通俗解说词 */}
        <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
          <p className="text-slate-200 text-sm leading-relaxed">
            💡 {lang === 'zh' ? currentSnapshot.plainExplanation.zh : currentSnapshot.plainExplanation.en}
          </p>
        </div>
        {/* 技术描述 */}
        <p className="text-slate-400 text-xs leading-relaxed">
          {lang === 'zh' ? currentSnapshot.description.zh : currentSnapshot.description.en}
        </p>
      </div>

      {/* 可视化区域 */}
      <div className="min-h-[200px]">
        <DemoVisualizer
          algorithmId={algorithmId}
          visualizationData={currentSnapshot.visualizationData}
          lang={lang}
        />
      </div>

      {/* 控制面板 */}
      <DemoControls
        state={demoState}
        actions={demoState}
        totalSteps={config.totalSteps}
        lang={lang}
      />

      {/* 缓存状态指示器（开发模式） */}
      <CacheStatusIndicator lang={lang} />
    </div>
  );
}

/**
 * 根据算法ID分发到对应的可视化组件
 */
function DemoVisualizer({
  algorithmId,
  visualizationData,
  lang,
}: {
  algorithmId: string;
  visualizationData: Record<string, unknown>;
  lang: Lang;
}) {
  try {
    switch (algorithmId) {
      case 'kmeans':
        return <KMeansVisualizer visualizationData={visualizationData as unknown as KMeansVisualizationData} lang={lang} />;
      case 'linear-regression':
        return <LinearRegressionVisualizer visualizationData={visualizationData as unknown as LinearRegressionVisualizationData} lang={lang} />;
      default:
        return (
          <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700/30 text-center">
            <span className="text-3xl mb-3 block">🚧</span>
            <p className="text-slate-400 text-sm">
              {lang === 'zh'
                ? '该算法的动态演示正在开发中...'
                : 'Dynamic demo for this algorithm is under development...'}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              {lang === 'zh'
                ? '即将支持：决策树、KNN、逻辑回归等'
                : 'Coming soon: Decision Tree, KNN, Logistic Regression, etc.'}
            </p>
          </div>
        );
    }
  } catch (err) {
    console.error('[DemoVisualizer] Render error:', err);
    return (
      <div className="bg-slate-900/40 rounded-xl p-4 border border-amber-500/30">
        <p className="text-amber-400 text-sm text-center">
          {lang === 'zh' ? '可视化渲染异常，请刷新重试' : 'Visualization error, please refresh and retry'}
        </p>
      </div>
    );
  }
}

/**
 * 缓存状态指示器 - 展示 LRU 缓存的运行状态
 */
function CacheStatusIndicator({ lang }: { lang: Lang }) {
  const stats = demoService.getCacheStats();

  if (stats.totalRequests === 0) return null;

  return (
    <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/20">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {lang === 'zh' ? '服务状态' : 'Service Status'}
        </span>
        <div className="flex items-center gap-3 text-slate-500">
          <span>
            {lang === 'zh' ? '缓存' : 'Cache'}: {stats.size}/{stats.capacity}
          </span>
          <span>
            {lang === 'zh' ? '命中率' : 'Hit Rate'}: {(stats.hitRate * 100).toFixed(0)}%
          </span>
          <span>
            ~{Math.round(stats.estimatedMemoryBytes / 1024)}KB
          </span>
        </div>
      </div>
    </div>
  );
}
