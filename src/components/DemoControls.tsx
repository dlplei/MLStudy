import { Lang } from '../i18n/translations';
import { DemoState, DemoActions } from '../types/demo';

interface DemoControlsProps {
  state: DemoState;
  actions: DemoActions;
  totalSteps: number;
  lang: Lang;
}

/**
 * 演示控制面板
 * 提供播放/暂停、上一步/下一步、重置、进度条等控制
 */
export function DemoControls({ state, actions, totalSteps, lang }: DemoControlsProps) {
  const { currentStep, isPlaying, isComplete } = state;

  const stepLabels = lang === 'zh'
    ? { prev: '上一步', next: '下一步', play: '自动播放', pause: '暂停', reset: '重置' }
    : { prev: 'Previous', next: 'Next', play: 'Auto Play', pause: 'Pause', reset: 'Reset' };

  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            {lang === 'zh' ? '步骤' : 'Step'} {currentStep + 1} / {totalSteps}
          </span>
          {isComplete && (
            <span className="text-xs text-emerald-400 font-medium">
              {lang === 'zh' ? '✓ 已完成' : '✓ Complete'}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => actions.goToStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx <= currentStep
                  ? 'bg-blue-500'
                  : 'bg-slate-700'
              } ${idx === currentStep ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={actions.reset}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors"
          title={stepLabels.reset}
        >
          ↺ {stepLabels.reset}
        </button>
        <button
          onClick={actions.prev}
          disabled={currentStep === 0}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← {stepLabels.prev}
        </button>
        <button
          onClick={isPlaying ? actions.pause : actions.play}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          {isPlaying ? '⏸' : '▶'} {isPlaying ? stepLabels.pause : stepLabels.play}
        </button>
        <button
          onClick={actions.next}
          disabled={currentStep >= totalSteps - 1}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stepLabels.next} →
        </button>
      </div>
    </div>
  );
}
