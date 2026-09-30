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
import { KMeansPoint, KMeansVisualizationData } from '../../types/demo';
import { Lang } from '../../i18n/translations';

interface KMeansVisualizerProps {
  visualizationData: KMeansVisualizationData;
  lang: Lang;
}

const CLUSTER_COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export function KMeansVisualizer({ visualizationData, lang }: KMeansVisualizerProps) {
  const { points, centers, converged } = visualizationData;

  const clusteredData = points.map((p: KMeansPoint) => ({
    ...p,
    fill: p.cluster >= 0 ? CLUSTER_COLORS[p.cluster] : '#94A3B8',
  }));

  const unassigned = clusteredData.filter((p: KMeansPoint) => p.cluster === -1);
  const cluster0 = clusteredData.filter((p: KMeansPoint) => p.cluster === 0);
  const cluster1 = clusteredData.filter((p: KMeansPoint) => p.cluster === 1);
  const cluster2 = clusteredData.filter((p: KMeansPoint) => p.cluster === 2);

  const centerData = centers.map((c: { x: number; y: number; id: number }) => ({
    ...c,
    name: `C${c.id}`,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {centers.length > 0 &&
            centers.map((c: { id: number }, idx: number) => (
              <span key={c.id} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CLUSTER_COLORS[idx] }}
                />
                {lang === 'zh' ? `簇 ${idx + 1}` : `Cluster ${idx + 1}`}
              </span>
            ))}
          {unassigned.length > 0 && (
            <span key="unassigned" className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              {lang === 'zh' ? '未分配' : 'Unassigned'}
            </span>
          )}
        </div>
        {converged && (
          <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            {lang === 'zh' ? '✓ 已收敛' : '✓ Converged'}
          </span>
        )}
      </div>

      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/30">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="x" domain={[0, 10]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <YAxis type="number" dataKey="y" domain={[0, 10]} tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#475569" />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} formatter={(value: number, name: string) => [value.toFixed(2), name]} />

            {unassigned.length > 0 && <Scatter name={lang === 'zh' ? '数据点' : 'Points'} data={unassigned} fill="#94A3B8" stroke="#64748B" strokeWidth={1} r={5} />}
            {cluster0.length > 0 && <Scatter name="Cluster 0" data={cluster0} fill={CLUSTER_COLORS[0]} r={5} opacity={0.8} />}
            {cluster1.length > 0 && <Scatter name="Cluster 1" data={cluster1} fill={CLUSTER_COLORS[1]} r={5} opacity={0.8} />}
            {cluster2.length > 0 && <Scatter name="Cluster 2" data={cluster2} fill={CLUSTER_COLORS[2]} r={5} opacity={0.8} />}
            {centerData.length > 0 && <Scatter name={lang === 'zh' ? '聚类中心' : 'Centers'} data={centerData} fill="#EF4444" stroke="#FCA5A5" strokeWidth={2} r={8} shape="star" />}

            <ReferenceLine x={5} stroke="#334155" strokeDasharray="2 2" />
            <ReferenceLine y={5} stroke="#334155" strokeDasharray="2 2" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '数据点' : 'Points'}</div>
          <div className="text-sm font-bold text-white">{points.length}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '聚类数' : 'Clusters'}</div>
          <div className="text-sm font-bold text-white">{centers.length || 'K=3'}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">{lang === 'zh' ? '状态' : 'Status'}</div>
          <div className={`text-sm font-bold ${converged ? 'text-emerald-400' : 'text-amber-400'}`}>
            {converged ? (lang === 'zh' ? '已收敛' : 'Done') : (lang === 'zh' ? '迭代中' : 'Running')}
          </div>
        </div>
      </div>
    </div>
  );
}
