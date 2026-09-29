import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SVMVisualizationData, SVMPoint } from '../../types/demo';
import { Lang } from '../../i18n/translations';

interface SVMVisualizerProps {
  visualizationData: SVMVisualizationData;
  lang: Lang;
}

export function SVMVisualizer({ visualizationData, lang }: SVMVisualizerProps) {
  const { points, supportVectors, weights, margin, accuracy, complete } = visualizationData;

  const t = {
    zh: {
      class0: '类别 0',
      class1: '类别 1',
      supportVectors: '支持向量',
      decisionBoundary: '决策边界',
      margin: '间隔',
      accuracy: '准确率',
      complete: '训练完成',
      training: '训练中',
    },
    en: {
      class0: 'Class 0',
      class1: 'Class 1',
      supportVectors: 'Support Vectors',
      decisionBoundary: 'Decision Boundary',
      margin: 'Margin',
      accuracy: 'Accuracy',
      complete: 'Complete',
      training: 'Training',
    },
  };

  const labels = t[lang];

  // 分离两类数据
  const class0Points = points.filter((p) => p.label === 0);
  const class1Points = points.filter((p) => p.label === 1);

  // 支持向量点（用于特殊标记）
  const svPoints = supportVectors.map((sv) => ({
    ...sv,
    isSV: true,
  }));

  // 计算决策边界线（简化版）
  const boundaryLine = [];
  if (weights.w1 !== 0 || weights.w2 !== 0) {
    for (let x = 0; x <= 8; x += 0.5) {
      const y = -(weights.w1 * x + weights.b) / weights.w2;
      if (y >= 0 && y <= 8) {
        boundaryLine.push({ x, y });
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 散点图 */}
      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-300">
            {lang === 'zh' ? '数据分布与决策边界' : 'Data Distribution & Decision Boundary'}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${complete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {complete ? `✓ ${labels.complete}` : `⚡ ${labels.training}`}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="x" domain={[0, 8]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <YAxis type="number" dataKey="y" domain={[0, 8]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }}
              formatter={(value: number, name: string) => [value.toFixed(2), name]}
            />

            {/* 类别 0 的点 */}
            <Scatter name={labels.class0} data={class0Points} fill="#3B82F6" stroke="#60A5FA" strokeWidth={1} r={5} />

            {/* 类别 1 的点 */}
            <Scatter name={labels.class1} data={class1Points} fill="#EF4444" stroke="#F87171" strokeWidth={1} r={5} />

            {/* 支持向量（大圆圈标记） */}
            {svPoints.length > 0 && (
              <Scatter
                name={labels.supportVectors}
                data={svPoints}
                fill="transparent"
                stroke="#FBBF24"
                strokeWidth={3}
                r={10}
              />
            )}

            {/* 决策边界线 */}
            {boundaryLine.length > 0 && (
              <Scatter
                name={labels.decisionBoundary}
                data={boundaryLine}
                fill="#10B981"
                stroke="#10B981"
                strokeWidth={2}
                r={2}
                line={{ stroke: '#10B981', strokeWidth: 2 }}
              />
            )}

            <ReferenceLine x={4} stroke="#334155" strokeDasharray="2 2" />
            <ReferenceLine y={4} stroke="#334155" strokeDasharray="2 2" />
          </ScatterChart>
        </ResponsiveContainer>

        {/* 图例 */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">{labels.class0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">{labels.class1}</span>
          </div>
          {svPoints.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-amber-400"></div>
              <span className="text-slate-400">{labels.supportVectors}</span>
            </div>
          )}
        </div>
      </div>

      {/* 模型参数 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">{labels.margin}</div>
          <div className="text-lg font-bold text-emerald-400">{margin.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">{labels.accuracy}</div>
          <div className="text-lg font-bold text-blue-400">{(accuracy * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* 权重信息 */}
      {(weights.w1 !== 0 || weights.w2 !== 0) && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'zh' ? '超平面参数' : 'Hyperplane Parameters'}
          </div>
          <div className="text-sm text-white font-mono">
            w = ({weights.w1.toFixed(2)}, {weights.w2.toFixed(2)}), b = {weights.b.toFixed(2)}
          </div>
        </div>
      )}

      {/* 支持向量数量 */}
      {supportVectors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">{labels.supportVectors}</div>
          <div className="text-sm text-white">
            {supportVectors.length} {lang === 'zh' ? '个支持向量决定了决策边界' : 'support vectors determine the decision boundary'}
          </div>
        </div>
      )}
    </div>
  );
}
