import { useAlgorithmDemo } from '../../hooks/useAlgorithmDemo';
import { DemoConfig } from '../../types/demo';
import { DemoControls } from '../DemoControls';
import { KMeansVisualizer } from './KMeansVisualizer';
import { LinearRegressionVisualizer } from './LinearRegressionVisualizer';
import { Lang } from '../../i18n/translations';

interface AlgorithmDemoContainerProps {
  config: DemoConfig;
  lang: Lang;
}

/**
 * 算法演示容器组件
 * 负责整合控制面板和具体可视化组件
 * 包含降级机制：如果可视化渲染失败，显示静态描述
 */
export function AlgorithmDemoContainer({ config, lang }: AlgorithmDemoContainerProps) {
  const demoState = useAlgorithmDemo(config, 2500);
  const { currentSnapshot, error } = demoState;

  // 降级：如果出错，显示静态信息
  if (error) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-4 border border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
          <span>⚠️</span>
          <span>
            {lang === 'zh'
              ? '动态演示暂时不可用，已切换为静态描述'
              : 'Dynamic demo unavailable, showing static description'}
          </span>
        </div>
        <p className="text-slate-400 text-xs">{error}</p>
      </div>
    );
  }

  if (!currentSnapshot) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30">
        <p className="text-slate-400 text-sm text-center">
          {lang === 'zh' ? '加载中...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 步骤标题和描述 */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
            {currentSnapshot.stepIndex + 1}
          </span>
          <h4 className="font-semibold text-white text-sm">
            {lang === 'zh' ? currentSnapshot.title.zh : currentSnapshot.title.en}
          </h4>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed pl-8">
          {lang === 'zh' ? currentSnapshot.description.zh : currentSnapshot.description.en}
        </p>
      </div>

      {/* 可视化区域 */}
      <div className="min-h-[200px]">
        <DemoVisualizer
          algorithmId={config.algorithmId}
          data={currentSnapshot.data}
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
    </div>
  );
}

/**
 * 根据算法ID分发到对应的可视化组件
 * 扩展新算法时只需在此添加新的 case
 */
function DemoVisualizer({
  algorithmId,
  data,
  lang,
}: {
  algorithmId: string;
  data: unknown;
  lang: Lang;
}) {
  try {
    switch (algorithmId) {
      case 'kmeans':
        return <KMeansVisualizer data={data as any} lang={lang} />;
      case 'linear-regression':
        return <LinearRegressionVisualizer data={data as any} lang={lang} />;
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
          {lang === 'zh'
            ? '可视化渲染异常，请刷新重试'
            : 'Visualization error, please refresh and retry'}
        </p>
      </div>
    );
  }
}
