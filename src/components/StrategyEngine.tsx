import React, { useState } from 'react';
import { StrategyRule } from '../types/trading';
import {
  GitBranch,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PlusCircle,
  Cpu,
  Layers,
  FileText,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface StrategyEngineProps {
  strategies: StrategyRule[];
  onUpdateStrategies: (strategies: StrategyRule[]) => void;
  language: 'Hinglish' | 'English';
}

export const StrategyEngine: React.FC<StrategyEngineProps> = ({
  strategies,
  onUpdateStrategies,
  language,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyRule>(
    strategies.find((s) => s.isApprovedActive) || strategies[0]
  );
  const [naturalStrategyPrompt, setNaturalStrategyPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [approvalModalStrategy, setApprovalModalStrategy] = useState<StrategyRule | null>(null);

  // Handle Promoting Experimental Strategy to Approved Active
  const handlePromoteToActive = (strat: StrategyRule) => {
    const updated = strategies.map((s) => ({
      ...s,
      isApprovedActive: s.id === strat.id,
      version: s.id === strat.id ? `${s.version.replace('-EXPERIMENTAL', '')}-APPROVED` : s.version,
    }));
    onUpdateStrategies(updated);
    setApprovalModalStrategy(null);
    setSelectedStrategy({
      ...strat,
      isApprovedActive: true,
      version: `${strat.version.replace('-EXPERIMENTAL', '')}-APPROVED`,
    });
  };

  // AI Strategy Research & Rule Formalization
  const handleGenerateStrategy = async () => {
    if (!naturalStrategyPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/strategy-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyDescription: naturalStrategyPrompt,
          existingRules: selectedStrategy,
        }),
      });

      const data = await res.json();
      if (data.strategy) {
        const newStrat: StrategyRule = {
          id: `strat-${Date.now()}`,
          name: data.strategy.strategyName || 'Experimental Setup Strategy',
          version: `v${strategies.length + 1}.0-EXPERIMENTAL`,
          isApprovedActive: false, // Strict safeguard: starts as experimental
          createdAt: new Date().toISOString().split('T')[0],
          author: 'AI Suggested',
          instruments: data.strategy.instruments || ['NIFTY 50', 'BANKNIFTY', 'RELIANCE'],
          timeframes: data.strategy.timeframes || ['15m', '1D'],
          entryConditions: data.strategy.entryRules || ['Indicator trigger confirmation'],
          exitConditions: data.strategy.exitRules || ['Target 1 at 1:2 R:R'],
          stopLossRule: data.strategy.stopLossRule || 'Below swing low',
          targetRules: data.strategy.targetRules || ['T1: 1:2 R:R', 'T2: 1:3.5 R:R'],
          positionSizingRule: data.strategy.positionSizingRule || 'Max 1% capital per trade',
          indicators: ['VWAP', 'EMA 20', 'RSI'],
          confirmationConditions: ['Volume confirmation on trigger bar'],
          invalidationConditions: data.strategy.invalidationConditions || ['Close opposite to bias'],
          noTradeConditions: data.strategy.noTradeConditions || ['First 15m of market open'],
          backtestSampleCount: 0,
          historicalWinRatePct: 50.0,
          expectancyR: 0.5,
        };

        const updated = [...strategies, newStrat];
        onUpdateStrategies(updated);
        setSelectedStrategy(newStrat);
        setNaturalStrategyPrompt('');
      }
    } catch (e) {
      console.error('Failed to formalize strategy:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Safeguard Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <span>Strategy Guardrail & Version Control (FR-03 & FR-10)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                LOCKED SAFEGUARD
              </span>
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Experimental versions automatically ban aur test ho sakti hain, lekin active approved strategy tumhare explicit approval ke bina replace nahi hogi.
            </p>
          </div>
        </div>

        {/* List of Version Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {strategies.map((strat) => (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategy(strat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition flex items-center gap-1.5 ${
                selectedStrategy.id === strat.id
                  ? 'bg-slate-800 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {strat.isApprovedActive ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{strat.version}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Strategy Inspector on Left + AI Research Generator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Selected Strategy Deep Rules Inspector */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{selectedStrategy.name}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    selectedStrategy.isApprovedActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {selectedStrategy.version}
                </span>
                <span className="text-[11px] text-slate-400">By {selectedStrategy.author}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Instruments: <strong className="text-slate-200 font-mono">{selectedStrategy.instruments.join(', ')}</strong></span>
                <span>•</span>
                <span>Timeframes: <strong className="text-emerald-400 font-mono">{selectedStrategy.timeframes.join(', ')}</strong></span>
              </div>
            </div>

            {/* Promote Action */}
            {!selectedStrategy.isApprovedActive ? (
              <button
                onClick={() => setApprovalModalStrategy(selectedStrategy)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approve as Active Strategy</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approved Active Strategy</span>
              </span>
            )}
          </div>

          {/* Rules Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Entry Conditions */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Entry Conditions (Mandatory Triggers):</span>
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {selectedStrategy.entryConditions.map((cond, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-mono">•</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exit Conditions & Targets */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Exit Rules & Targets:</span>
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {selectedStrategy.targetRules.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-500 font-mono">•</span>
                    <span>{t}</span>
                  </li>
                ))}
                {selectedStrategy.exitConditions.map((e, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-mono">•</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stop Loss & Position Sizing */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Stop-Loss & Sizing Rule:</span>
              </span>
              <div className="space-y-1 text-slate-300 text-[11px] font-mono">
                <div>SL Derivation: {selectedStrategy.stopLossRule}</div>
                <div>Position Sizing: {selectedStrategy.positionSizingRule}</div>
              </div>
            </div>

            {/* Invalidation & No-Trade Conditions */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>No-Trade & Invalidation Conditions:</span>
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {selectedStrategy.invalidationConditions.map((inv, i) => (
                  <li key={i} className="text-rose-300 flex items-start gap-1">
                    <span>×</span>
                    <span>{inv}</span>
                  </li>
                ))}
                {selectedStrategy.noTradeConditions.map((noTrade, i) => (
                  <li key={i} className="text-amber-300 flex items-start gap-1">
                    <span>!</span>
                    <span>{noTrade}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Backtest Sample Count</span>
              <strong className={selectedStrategy.backtestSampleCount < 30 ? 'text-amber-400' : 'text-emerald-400'}>
                N = {selectedStrategy.backtestSampleCount} trades
                {selectedStrategy.backtestSampleCount < 30 && ' (Small Sample Warning)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Historical Win Rate</span>
              <strong className="text-cyan-300">{selectedStrategy.historicalWinRatePct}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Statistical Expectancy</span>
              <strong className="text-emerald-400">+{selectedStrategy.expectancyR} R per trade</strong>
            </div>
          </div>
        </div>

        {/* Right: AI Strategy Research Lab */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                AI Strategy Research Lab (FR-10)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Natural language me apni strategy likho. Gemini 3.1 Pro isko formal Indian market rules me convert karega aur experimental version banayega.
            </p>

            <textarea
              value={naturalStrategyPrompt}
              onChange={(e) => setNaturalStrategyPrompt(e.target.value)}
              placeholder="Example: Nifty 50 me 15 min chart par agar price VWAP ke upar cross kare aur RSI 60 cross kare with 1.5x volume, toh buy karo. SL previous swing low, Target 1:2 R:R..."
              rows={6}
              className="mt-3 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/30 text-[10px] text-amber-300">
              <strong>Overfitting Alert:</strong> AI-generated rules require out-of-sample walk-forward testing before real capital deployment.
            </div>

            <button
              onClick={handleGenerateStrategy}
              disabled={isGenerating || !naturalStrategyPrompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isGenerating ? 'Structuring Rules with Gemini...' : 'Synthesize Formal Rules'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Human Approval Confirmation Modal */}
      {approvalModalStrategy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Approve Strategy Replacement?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Aakash, SRS rule ke according koi bhi experimental version bina tumhari approval ke active strategy ko replace nahi kar sakti.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div>New Strategy: <strong className="text-white">{approvalModalStrategy.name}</strong></div>
              <div>Version: <strong className="text-emerald-400">{approvalModalStrategy.version}</strong></div>
              <div>Instruments: {approvalModalStrategy.instruments.join(', ')}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovalModalStrategy(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePromoteToActive(approvalModalStrategy)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md"
              >
                Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
