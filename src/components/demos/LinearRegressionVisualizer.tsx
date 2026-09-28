import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { LinearRegressionPoint, LinearRegressionVisualizationData } from '../../types/demo';
import { Lang } from '../../i18n/translations';

interface LinearRegressionVisualizerProps {
  visualizationData: LinearRegressionVisualizationData;
  lang: Lang;
}

export function LinearRegressionVisualizer({ visualizationData, lang }: LinearRegressionVisualizerProps) {
  const { points, weights, loss, iteration } = visualizationData;

  const lineData = points.map((p: LinearRegressionPoint) => ({
    x: p.x,
    actual: p.y,
    predicted: p.predicted,
    residual: p.residual,
  }));

  const minX = Math.min(...points.map((p: LinearRegressionPoint) => p.x));
  const maxX = Math.max(...points.map((p: LinearRegressionPoint) => p.x));
  const fitLine = [
    { x: minX, fitY: weights.w * minX + weights.b },
    { x: maxX, fitY: weights.w * maxX + weights.b },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">w</div>
          <div className="text-sm font-bold text-blue-400">{weights.w.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">b</div>
          <div className="text-sm font-bold text-purple-400">{weights.b.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '损失' : 'Loss'}</div>
          <div className="text-sm font-bold text-amber-400">{loss.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '迭代' : 'Iter'}</div>
          <div className="text-sm font-bold text-emerald-400">{iteration}</div>
        </div>
      </div>

      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/30">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="x" domain={[0, 9]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <YAxis domain={[0, 28]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} formatter={(value: number, name: string) => [value.toFixed(2), name]} />

            <Area type="monotone" dataKey="residual" data={lineData} fill="#EF444420" stroke="none" name={lang === 'zh' ? '残差' : 'Residual'} />
            <Scatter name={lang === 'zh' ? '实际值' : 'Actual'} data={lineData} dataKey="actual" fill="#3B82F6" stroke="#60A5FA" strokeWidth={1} r={4} />
            <Scatter name={lang === 'zh' ? '预测值' : 'Predicted'} data={lineData} dataKey="predicted" fill="#F59E0B" stroke="#FBBF24" strokeWidth={1} r={3} shape="diamond" />
            <Line data={fitLine} dataKey="fitY" type="monotone" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} name={lang === 'zh' ? '拟合线' : 'Fit Line'} isAnimationActive={true} />
            <ReferenceLine y={0} stroke="#475569" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
        <code className="text-emerald-400 font-mono text-sm">
          y = {weights.w.toFixed(2)}x + {weights.b.toFixed(2)}
        </code>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{lang === 'zh' ? '损失函数 (MSE)' : 'Loss Function (MSE)'}</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(5, 100 - (loss / 42.5) * 100)}%` }} />
          </div>
          <span className="text-amber-400 font-mono">{loss.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
