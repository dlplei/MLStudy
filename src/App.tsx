import { useState } from 'react';
import { algorithms, categories, Algorithm, Category } from './data/algorithms';
import { translations, Lang } from './i18n/translations';
import { demoService } from './services/DemoService';
import { AlgorithmDemoContainer } from './components/demos/AlgorithmDemoContainer';
import { MathDerivation } from './components/MathDerivation';
import { getDerivation, hasDerivation } from './data/derivations';

function App() {
  const [lang, setLang] = useState<Lang>('zh');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'detail' | 'demo' | 'derivation'>('detail');

  const t = translations[lang];

  const filteredAlgorithms = algorithms.filter((algo) => {
    const matchCategory = selectedCategory === 'all' || algo.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      searchQuery === '' ||
      algo.name.toLowerCase().includes(searchLower) ||
      algo.nameEn.toLowerCase().includes(searchLower) ||
      algo.description.toLowerCase().includes(searchLower) ||
      algo.descriptionEn.toLowerCase().includes(searchLower);
    return matchCategory && matchSearch;
  });

  const getCategoryInfo = (categoryId: string): Category => {
    return categories.find((c) => c.id === categoryId)!;
  };

  const getAlgoName = (algo: Algorithm) => (lang === 'zh' ? algo.name : algo.nameEn);
  const getAlgoSubName = (algo: Algorithm) => (lang === 'zh' ? algo.nameEn : algo.name);
  const getAlgoDescription = (algo: Algorithm) =>
    lang === 'zh' ? algo.description : algo.descriptionEn;
  const getAlgoPrinciple = (algo: Algorithm) =>
    lang === 'zh' ? algo.principle : algo.principleEn;
  const getAlgoUseCases = (algo: Algorithm) =>
    lang === 'zh' ? algo.useCases : algo.useCasesEn;
  const getAlgoPros = (algo: Algorithm) => (lang === 'zh' ? algo.pros : algo.prosEn);
  const getAlgoCons = (algo: Algorithm) => (lang === 'zh' ? algo.cons : algo.consEn);
  const getCategoryName = (cat: Category) => (lang === 'zh' ? cat.name : cat.nameEn);
  const getCategoryDescription = (cat: Category) =>
    lang === 'zh' ? cat.description : cat.descriptionEn;

  const hasDemo = (algoId: string) => demoService.hasDemo(algoId);

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  const openAlgorithm = (algo: Algorithm) => {
    setSelectedAlgorithm(algo);
    setActiveTab('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🤖 {t.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
              {t.subtitle(algorithms.length, categories.length)}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: cat.color + '30', color: cat.color }}
                >
                  {cat.icon} {getCategoryName(cat)}
                </span>
              ))}
            </div>
            {/* Demo badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {lang === 'zh'
                  ? `✨ ${demoService.getAvailableDemos().length} 种算法支持动态演示`
                  : `✨ ${demoService.getAvailableDemos().length} algorithms with interactive demos`}
              </span>
            </div>
          </div>
        </div>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLang}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full text-sm font-medium text-slate-200 hover:bg-slate-700 hover:border-slate-500 transition-all shadow-lg"
        >
          <span className="text-base">🌐</span>
          <span>{t.language}</span>
        </button>
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
              {t.all} ({algorithms.length})
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
                  {cat.icon} {getCategoryName(cat)} ({count})
                </button>
              );
            })}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
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
            const algoHasDemo = hasDemo(algo.id);
            return (
              <div
                key={algo.id}
                onClick={() => openAlgorithm(algo)}
                className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 hover:border-slate-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{algo.icon}</span>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                        {getAlgoName(algo)}
                      </h3>
                      <p className="text-xs text-slate-400">{getAlgoSubName(algo)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                      style={{ backgroundColor: cat.color + '20', color: cat.color }}
                    >
                      {getCategoryName(cat)}
                    </span>
                    {algoHasDemo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                        {lang === 'zh' ? '可演示' : 'Demo'}
                      </span>
                    )}
                    {hasDerivation(algo.id) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                        {lang === 'zh' ? '推导' : 'Math'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300 line-clamp-2">
                  {getAlgoDescription(algo)}
                </p>
                {algo.formula && (
                  <div className="mt-3 px-3 py-2 bg-slate-900/50 rounded-lg">
                    <code className="text-xs text-emerald-400 font-mono">{algo.formula}</code>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {t.complexity}: {algo.complexity}
                  </span>
                  <span className="text-blue-400 group-hover:text-blue-300">
                    {t.viewDetails}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-slate-400">{t.noResults}</p>
          </div>
        )}

        {/* Category Overview */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📚 {t.categoryOverview}
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
                      <h3 className="font-bold text-white">{getCategoryName(cat)}</h3>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh' ? cat.nameEn : cat.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    {getCategoryDescription(cat)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catAlgos.map((algo) => (
                      <span
                        key={algo.id}
                        onClick={() => openAlgorithm(algo)}
                        className="text-xs px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        {algo.icon} {getAlgoName(algo)}
                        {hasDemo(algo.id) && (
                          <span className="ml-1 text-emerald-400">●</span>
                        )}
                        {hasDerivation(algo.id) && (
                          <span className="ml-0.5 text-purple-400">◆</span>
                        )}
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
              🗺️ {t.learningPath}
            </span>
          </h2>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {t.steps.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor: categories[idx]?.color || '#3B82F6',
                      }}
                    >
                      {idx + 1}
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
            className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[modalIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-5 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAlgorithm.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {getAlgoName(selectedAlgorithm)}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {getAlgoSubName(selectedAlgorithm)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlgorithm(null)}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('detail')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'detail'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 {lang === 'zh' ? '算法详情' : 'Details'}
              </button>
              {hasDemo(selectedAlgorithm.id) && (
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'demo'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎬 {lang === 'zh' ? '动态演示' : 'Interactive Demo'}
                </button>
              )}
              {hasDerivation(selectedAlgorithm.id) && (
                <button
                  onClick={() => setActiveTab('derivation')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'derivation'
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📐 {lang === 'zh' ? '数学推导' : 'Math Derivation'}
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {activeTab === 'detail' && (
                <DetailTab
                  algo={selectedAlgorithm}
                  lang={lang}
                  getCategoryInfo={getCategoryInfo}
                  getCategoryName={getCategoryName}
                  getAlgoDescription={getAlgoDescription}
                  getAlgoPrinciple={getAlgoPrinciple}
                  getAlgoUseCases={getAlgoUseCases}
                  getAlgoPros={getAlgoPros}
                  getAlgoCons={getAlgoCons}
                  t={t}
                  hasDemo={hasDemo(selectedAlgorithm.id)}
                  onOpenDemo={() => setActiveTab('demo')}
                />
              )}
              {activeTab === 'demo' && (
                <DemoTab
                  algoId={selectedAlgorithm.id}
                  lang={lang}
                />
              )}
              {activeTab === 'derivation' && (
                <DerivationTab
                  algoId={selectedAlgorithm.id}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            🎓 {t.footer(algorithms.length, categories.length)}
          </p>
          <p className="text-slate-600 text-xs mt-2">{t.footerHint}</p>
        </div>
      </footer>
    </div>
  );
}

// ==================== Sub Components ====================

interface DetailTabProps {
  algo: Algorithm;
  lang: Lang;
  getCategoryInfo: (id: string) => Category;
  getCategoryName: (cat: Category) => string;
  getAlgoDescription: (algo: Algorithm) => string;
  getAlgoPrinciple: (algo: Algorithm) => string;
  getAlgoUseCases: (algo: Algorithm) => string[];
  getAlgoPros: (algo: Algorithm) => string[];
  getAlgoCons: (algo: Algorithm) => string[];
  t: typeof translations.zh;
  hasDemo: boolean;
  onOpenDemo: () => void;
}

function DetailTab({
  algo,
  lang,
  getCategoryInfo,
  getCategoryName,
  getAlgoDescription,
  getAlgoPrinciple,
  getAlgoUseCases,
  getAlgoPros,
  getAlgoCons,
  t,
  hasDemo,
  onOpenDemo,
}: DetailTabProps) {
  return (
    <div className="space-y-5">
      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: getCategoryInfo(algo.category).color + '20',
            color: getCategoryInfo(algo.category).color,
          }}
        >
          {getCategoryInfo(algo.category).icon}{' '}
          {getCategoryName(getCategoryInfo(algo.category))}
        </span>
        {hasDemo && (
          <button
            onClick={onOpenDemo}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-medium"
          >
            🎬 {lang === 'zh' ? '查看演示' : 'View Demo'}
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
          📝 {t.intro}
        </h3>
        <p className="text-slate-200">{getAlgoDescription(algo)}</p>
      </div>

      {/* Principle */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
          🔬 {t.principle}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {getAlgoPrinciple(algo)}
        </p>
      </div>

      {/* Formula */}
      {algo.formula && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            📐 {t.formula}
          </h3>
          <div className="bg-slate-900/70 rounded-lg p-4">
            <code className="text-emerald-400 font-mono text-sm">
              {algo.formula}
            </code>
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
          💼 {t.useCases}
        </h3>
        <div className="flex flex-wrap gap-2">
          {getAlgoUseCases(algo).map((uc, idx) => (
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
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ {t.pros}</h3>
          <ul className="space-y-1.5">
            {getAlgoPros(algo).map((pro, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-2">❌ {t.cons}</h3>
          <ul className="space-y-1.5">
            {getAlgoCons(algo).map((con, idx) => (
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
        <span className="text-sm text-slate-400">⏱️ {t.timeComplexity}</span>
        <code className="text-amber-400 font-mono text-sm">
          {algo.complexity}
        </code>
      </div>
    </div>
  );
}

interface DemoTabProps {
  algoId: string;
  lang: Lang;
}

function DemoTab({ algoId, lang }: DemoTabProps) {
  if (!demoService.hasDemo(algoId)) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl">🚧</span>
        <p className="mt-3 text-slate-400">
          {lang === 'zh'
            ? '该算法的动态演示正在开发中...'
            : 'Demo for this algorithm is under development...'}
        </p>
      </div>
    );
  }

  return <AlgorithmDemoContainer algorithmId={algoId} lang={lang} />;
}

interface DerivationTabProps {
  algoId: string;
  lang: Lang;
}

function DerivationTab({ algoId, lang }: DerivationTabProps) {
  const derivation = getDerivation(algoId);
  
  if (!derivation) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl">🚧</span>
        <p className="mt-3 text-slate-400">
          {lang === 'zh'
            ? '该算法的数学推导正在准备中...'
            : 'Math derivation for this algorithm is being prepared...'}
        </p>
      </div>
    );
  }

  return <MathDerivation derivation={derivation} lang={lang} />;
}

export default App;
