import { DecisionTreeVisualizationData } from '../../types/demo';
import { Lang } from '../../i18n/translations';

interface DecisionTreeVisualizerProps {
  visualizationData: DecisionTreeVisualizationData;
  lang: Lang;
}

export function DecisionTreeVisualizer({ visualizationData, lang }: DecisionTreeVisualizerProps) {
  const { data, currentFeature, currentThreshold, leftData, rightData, treeStructure, complete } = visualizationData;

  const t = {
    zh: {
      dataset: '数据集',
      samples: '样本',
      feature: '特征',
      threshold: '阈值',
      left: '左分支',
      right: '右分支',
      apple: '苹果',
      orange: '橙子',
      weight: '重量',
      color: '颜色',
      complete: '构建完成',
      building: '构建中',
    },
    en: {
      dataset: 'Dataset',
      samples: 'samples',
      feature: 'Feature',
      threshold: 'Threshold',
      left: 'Left Branch',
      right: 'Right Branch',
      apple: 'Apple',
      orange: 'Orange',
      weight: 'Weight',
      color: 'Color',
      complete: 'Complete',
      building: 'Building',
    },
  };

  const labels = t[lang];

  return (
    <div className="space-y-4">
      {/* 树结构可视化 */}
      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-300">
            {lang === 'zh' ? '决策树结构' : 'Decision Tree Structure'}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${complete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {complete ? `✓ ${labels.complete}` : `⚡ ${labels.building}`}
          </span>
        </div>

        {/* 简化的树可视化 */}
        <div className="flex flex-col items-center space-y-4">
          {/* 根节点 */}
          {treeStructure.nodes[0] && (
            <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-slate-400">{lang === 'zh' ? '根节点' : 'Root'}</div>
              <div className="text-sm font-semibold text-white">
                {treeStructure.nodes[0].type === 'split' ? (
                  <>
                    {treeStructure.nodes[0].feature === 'color' ? labels.color : labels.weight}
                    {treeStructure.nodes[0].threshold && (
                      <span className="text-blue-400"> {treeStructure.nodes[0].threshold}</span>
                    )}
                  </>
                ) : (
                  lang === 'zh' ? '数据集' : 'Dataset'
                )}
              </div>
              <div className="text-xs text-slate-400">
                {treeStructure.nodes[0].samples} {labels.samples}
              </div>
            </div>
          )}

          {/* 分支 */}
          {treeStructure.nodes.length > 1 && (
            <div className="flex items-start justify-center gap-8">
              {/* 左分支 */}
              {treeStructure.nodes[1] && (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-slate-500 mb-1">← {labels.left}</div>
                  <div className={`border-2 rounded-lg px-3 py-2 text-center ${
                    treeStructure.nodes[1].type === 'leaf' 
                      ? 'bg-emerald-500/20 border-emerald-500' 
                      : 'bg-purple-500/20 border-purple-500'
                  }`}>
                    <div className="text-sm font-semibold text-white">
                      {treeStructure.nodes[1].type === 'leaf' ? (
                        <span className={treeStructure.nodes[1].label === 'apple' ? 'text-red-400' : 'text-orange-400'}>
                          {treeStructure.nodes[1].label === 'apple' ? '🍎' : '🍊'} {treeStructure.nodes[1].label === 'apple' ? labels.apple : labels.orange}
                        </span>
                      ) : (
                        <>
                          {treeStructure.nodes[1].feature === 'weight' ? labels.weight : labels.color}
                          {treeStructure.nodes[1].threshold && (
                            <span className="text-purple-400"> {treeStructure.nodes[1].threshold}g</span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {treeStructure.nodes[1].samples} {labels.samples}
                    </div>
                  </div>
                </div>
              )}

              {/* 右分支 */}
              {treeStructure.nodes[2] && (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-slate-500 mb-1">{labels.right} →</div>
                  <div className={`border-2 rounded-lg px-3 py-2 text-center ${
                    treeStructure.nodes[2].type === 'leaf' 
                      ? 'bg-emerald-500/20 border-emerald-500' 
                      : 'bg-purple-500/20 border-purple-500'
                  }`}>
                    <div className="text-sm font-semibold text-white">
                      {treeStructure.nodes[2].type === 'leaf' ? (
                        <span className={treeStructure.nodes[2].label === 'apple' ? 'text-red-400' : 'text-orange-400'}>
                          {treeStructure.nodes[2].label === 'apple' ? '🍎' : '🍊'} {treeStructure.nodes[2].label === 'apple' ? labels.apple : labels.orange}
                        </span>
                      ) : (
                        <>
                          {treeStructure.nodes[2].feature === 'weight' ? labels.weight : labels.color}
                          {treeStructure.nodes[2].threshold && (
                            <span className="text-purple-400"> {treeStructure.nodes[2].threshold}g</span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {treeStructure.nodes[2].samples} {labels.samples}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '总样本' : 'Total'}</div>
          <div className="text-lg font-bold text-white">{data.length}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">{labels.left}</div>
          <div className="text-lg font-bold text-blue-400">{leftData.length}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">{labels.right}</div>
          <div className="text-lg font-bold text-purple-400">{rightData.length}</div>
        </div>
      </div>

      {/* 当前分裂信息 */}
      {currentFeature && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'zh' ? '当前分裂' : 'Current Split'}
          </div>
          <div className="text-sm text-white">
            {lang === 'zh' ? '按' : 'By'} <span className="text-blue-400 font-semibold">{currentFeature === 'color' ? labels.color : labels.weight}</span>
            {currentThreshold && (
              <span> {lang === 'zh' ? '分裂，阈值' : 'split, threshold'} <span className="text-amber-400 font-semibold">{currentThreshold}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
