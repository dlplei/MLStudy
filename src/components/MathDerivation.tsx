import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { AlgorithmDerivation, DerivationStep } from '../data/derivations';
import { Lang } from '../i18n/translations';

interface MathDerivationProps {
  derivation: AlgorithmDerivation;
  lang: Lang;
}

/**
 * 数学推导展示组件
 * 使用 KaTeX 渲染 LaTeX 公式
 */
export function MathDerivation({ derivation, lang }: MathDerivationProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['1']));

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAll = () => {
    setExpandedSteps(new Set(derivation.steps.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  /**
   * 渲染 LaTeX 公式为 HTML
   */
  const renderFormula = (formula: string): string => {
    try {
      return katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#ef4444',
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      return `<span style="color: #ef4444;">Formula error: ${formula}</span>`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl p-5 border border-indigo-500/20">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📐</span>
          {lang === 'zh' ? derivation.title.zh : derivation.title.en}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
          >
            {lang === 'zh' ? '展开全部' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {lang === 'zh' ? '收起全部' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* 介绍 */}
      <p className="text-sm text-slate-300 mb-5 leading-relaxed">
        {lang === 'zh' ? derivation.introduction.zh : derivation.introduction.en}
      </p>

      {/* 推导步骤 */}
      <div className="space-y-3">
        {derivation.steps.map((step, index) => (
          <DerivationStepCard
            key={step.id}
            step={step}
            lang={lang}
            isExpanded={expandedSteps.has(step.id)}
            onToggle={() => toggleStep(step.id)}
            stepNumber={index + 1}
            totalSteps={derivation.steps.length}
            renderFormula={renderFormula}
          />
        ))}
      </div>
    </div>
  );
}

interface DerivationStepCardProps {
  step: DerivationStep;
  lang: Lang;
  isExpanded: boolean;
  onToggle: () => void;
  stepNumber: number;
  totalSteps: number;
  renderFormula: (formula: string) => string;
}

/**
 * 单个推导步骤卡片
 */
function DerivationStepCard({
  step,
  lang,
  isExpanded,
  onToggle,
  stepNumber,
  totalSteps,
  renderFormula,
}: DerivationStepCardProps) {
  return (
    <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden transition-all">
      {/* 步骤标题 */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold">
            {stepNumber}
          </span>
          <span className="text-sm font-medium text-white text-left">
            {lang === 'zh' ? step.title.zh : step.title.en}
          </span>
        </div>
        <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 展开的内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
          {/* 公式 */}
          <div className="bg-slate-900/60 rounded-lg p-4 overflow-x-auto">
            <div
              className="text-center text-lg"
              dangerouslySetInnerHTML={{ __html: renderFormula(step.formula) }}
            />
          </div>

          {/* 解释 */}
          <p className="text-sm text-slate-300 leading-relaxed">
            💡 {lang === 'zh' ? step.explanation.zh : step.explanation.en}
          </p>

          {/* 进度指示 */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
            <span>
              {lang === 'zh' ? '步骤' : 'Step'} {stepNumber} / {totalSteps}
            </span>
            <span>
              {stepNumber === totalSteps
                ? lang === 'zh' ? '✓ 推导完成' : '✓ Derivation Complete'
                : lang === 'zh' ? '继续下一步 →' : 'Continue to next →'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
