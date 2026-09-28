import { useState } from 'react';
import { algorithms, categories, Algorithm, Category } from './data/algorithms';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlgorithms = algorithms.filter((algo) => {
    const matchCategory = selectedCategory === 'all' || algo.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getCategoryInfo = (categoryId: string): Category => {
    return categories.find((c) => c.id === categoryId)!;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🤖 机器学习算法学习指南
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
              系统学习 {algorithms.length} 种常用机器学习算法，涵盖监督学习、无监督学习、集成学习、深度学习和强化学习五大类别
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: cat.color + '30', color: cat.color }}
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              全部 ({algorithms.length})
            </button>
            {categories.map((cat) => {
              const count = algorithms.filter((a) => a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: cat.color, color: 'white' }
                      : {}
                  }
                >
                  {cat.icon} {cat.name} ({count})
                </button>
              );
            })}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索算法..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Algorithm Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlgorithms.map((algo) => {
            const cat = getCategoryInfo(algo.category);
            return (
              <div
                key={algo.id}
                onClick={() => setSelectedAlgorithm(algo)}
                className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 hover:border-slate-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{algo.icon}</span>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                        {algo.name}
                      </h3>
                      <p className="text-xs text-slate-400">{algo.nameEn}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: cat.color + '20', color: cat.color }}
                  >
                    {cat.name}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300 line-clamp-2">{algo.description}</p>
                {algo.formula && (
                  <div className="mt-3 px-3 py-2 bg-slate-900/50 rounded-lg">
                    <code className="text-xs text-emerald-400 font-mono">{algo.formula}</code>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>复杂度: {algo.complexity}</span>
                  <span className="text-blue-400 group-hover:text-blue-300">
                    查看详情 →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-slate-400">没有找到匹配的算法</p>
          </div>
        )}

        {/* Category Overview */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📚 算法分类概览
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const catAlgos = algorithms.filter((a) => a.category === cat.id);
              return (
                <div
                  key={cat.id}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-bold text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{cat.nameEn}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{cat.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {catAlgos.map((algo) => (
                      <span
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo)}
                        className="text-xs px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        {algo.icon} {algo.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Learning Path */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              🗺️ 推荐学习路径
            </span>
          </h2>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  step: 1,
                  title: '基础入门',
                  desc: '线性回归 → 逻辑回归 → 决策树',
                  color: '#3B82F6',
                },
                {
                  step: 2,
                  title: '经典算法',
                  desc: 'SVM → KNN → 朴素贝叶斯',
                  color: '#10B981',
                },
                {
                  step: 3,
                  title: '集成方法',
                  desc: '随机森林 → 梯度提升 → XGBoost',
                  color: '#F59E0B',
                },
                {
                  step: 4,
                  title: '深度学习',
                  desc: 'MLP → CNN → RNN → Transformer',
                  color: '#8B5CF6',
                },
                {
                  step: 5,
                  title: '高级主题',
                  desc: 'GAN → 强化学习 → PPO',
                  color: '#EF4444',
                },
              ].map((item, idx) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.step}
                    </span>
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-9">{item.desc}</p>
                  {idx < 4 && (
                    <div className="hidden md:block absolute top-3 -right-2 text-slate-600">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Detail Modal */}
      {selectedAlgorithm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedAlgorithm(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAlgorithm.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAlgorithm.name}</h2>
                  <p className="text-sm text-slate-400">{selectedAlgorithm.nameEn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlgorithm(null)}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Category Badge */}
              <div>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getCategoryInfo(selectedAlgorithm.category).color + '20',
                    color: getCategoryInfo(selectedAlgorithm.category).color,
                  }}
                >
                  {getCategoryInfo(selectedAlgorithm.category).icon}{' '}
                  {getCategoryInfo(selectedAlgorithm.category).name}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  📝 简介
                </h3>
                <p className="text-slate-200">{selectedAlgorithm.description}</p>
              </div>

              {/* Principle */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  🔬 核心原理
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedAlgorithm.principle}
                </p>
              </div>

              {/* Formula */}
              {selectedAlgorithm.formula && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    📐 核心公式
                  </h3>
                  <div className="bg-slate-900/70 rounded-lg p-4">
                    <code className="text-emerald-400 font-mono text-sm">
                      {selectedAlgorithm.formula}
                    </code>
                  </div>
                </div>
              )}

              {/* Use Cases */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  💼 应用场景
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlgorithm.useCases.map((uc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ 优点</h3>
                  <ul className="space-y-1.5">
                    {selectedAlgorithm.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2">❌ 缺点</h3>
                  <ul className="space-y-1.5">
                    {selectedAlgorithm.cons.map((con, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Complexity */}
              <div className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">⏱️ 时间复杂度</span>
                <code className="text-amber-400 font-mono text-sm">
                  {selectedAlgorithm.complexity}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            🎓 机器学习算法学习指南 | 共收录 {algorithms.length} 种算法，涵盖 {categories.length} 大类别
          </p>
          <p className="text-slate-600 text-xs mt-2">
            点击任意算法卡片查看详细原理、应用场景和优缺点分析
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
