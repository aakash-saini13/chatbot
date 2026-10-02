import React, { useState } from 'react';
import { SetupCard } from '../types/trading';
import {
  Sparkles,
  Cpu,
  ShieldAlert,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SetupDetailProps {
  selectedSetup: SetupCard | null;
  allSetups: SetupCard[];
  onSelectSetup: (setup: SetupCard) => void;
  language: 'Hinglish' | 'English';
  onExecutePaperTrade: (setup: SetupCard) => void;
}

export const SetupDetail: React.FC<SetupDetailProps> = ({
  selectedSetup,
  allSetups,
  onSelectSetup,
  language,
  onExecutePaperTrade,
}) => {
  const setup = selectedSetup || allSetups[0];
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.1-pro-preview');
  const [thinkingMode, setThinkingMode] = useState<'HIGH' | 'STANDARD'>('HIGH');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunDeepAnalysis = async (queryText?: string) => {
    if (!setup) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument: setup.instrument,
          setupName: setup.strategyName,
          timeframe: setup.timeframe,
          direction: setup.direction,
          entryZone: setup.entryZone,
          stopLoss: setup.stopLoss,
          target1: setup.target1,
          target2: setup.target2,
          riskReward: setup.potentialRiskReward,
          userQuery: queryText || customQuery,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error generating analysis.');
      }

      setAiAnalysis(data.analysis);
      setModelUsed(data.model || 'gemini-3.1-pro-preview');
      setThinkingMode(data.thinkingLevel || 'HIGH');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing AI high-thinking analysis.');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Bhai agar 15m candle breakdown ho jaye toh exit rule kya hai?',
    'What is the fakeout / trap probability at this resistance zone?',
    'Is the 1:2 R:R realistic with Indian market brokerage and slippage?',
    'Should I scale in or wait for second re-test candle?',
  ];

  if (!setup) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        No setup selected. Please select a setup from Setup Alerts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector & Setup Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-mono">{setup.instrument}</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                setup.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {setup.direction} ({setup.timeframe})
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {setup.setupStatus}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Strategy: <strong className="text-slate-200">{setup.strategyName}</strong> ({setup.strategyVersion})
          </div>
        </div>

        {/* Setup Switcher dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Switch Setup:</label>
          <select
            value={setup.id}
            onChange={(e) => {
              const found = allSetups.find((s) => s.id === e.target.value);
              if (found) {
                onSelectSetup(found);
                setAiAnalysis(null);
              }
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
          >
            {allSetups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.instrument} · {s.direction} ({s.setupStatus})
              </option>
            ))}
          </select>

          <button
            onClick={() => onExecutePaperTrade(setup)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
          >
            <span>Execute Paper Trade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Technical Confluence on Left + Gemini High Thinking Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Traceable Technical Evidence & Rules */}
        <div className="lg:col-span-5 space-y-3">
          {/* Rules & Levels breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Traceable Rule Levels (FR-03 & FR-04)</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Entry Zone:</span>
                <span className="text-white font-bold">{setup.entryZone}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Stop-Loss Level:</span>
                <span className="text-rose-400 font-bold">₹{setup.stopLoss}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Target 1 (1:2 R:R):</span>
                <span className="text-emerald-400 font-bold">₹{setup.target1}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Target 2:</span>
                <span className="text-emerald-400 font-bold">₹{setup.target2}</span>
              </div>
            </div>

            {/* Invalidation Rule */}
            <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-xs">
              <span className="text-rose-400 font-bold block mb-1">Defined Invalidation Rule:</span>
              <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{setup.invalidation}</p>
            </div>

            {/* Matched Rules Checklist */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Strategy Rules Matched:</span>
              {setup.matchedRules.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Reasons this setup may fail */}
            <div className="space-y-1.5 text-xs bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg">
              <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Reasons Setup May Fail:</span>
              </span>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                {setup.reasonsMayFail.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: High Thinking AI Reasoning Engine */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            {/* Header of AI Engine */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Gemini 3.1 Pro · High Thinking Engine
                  </h3>
                  <div className="text-[10px] text-indigo-300 flex items-center gap-1.5">
                    <span>Model: <strong>gemini-3.1-pro-preview</strong></span>
                    <span>•</span>
                    <span className="bg-indigo-500/20 px-1.5 py-0.2 rounded text-[9px] font-semibold text-indigo-200">
                      thinkingLevel: HIGH
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRunDeepAnalysis()}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-950/50 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{loading ? 'Thinking Deeply...' : 'Run Deep Invalidation Analysis'}</span>
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCustomQuery(prompt);
                    handleRunDeepAnalysis(prompt);
                  }}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Output Display */}
            <div className="mt-4 bg-slate-950 rounded-xl p-4 border border-slate-800 min-h-[320px] max-h-[480px] overflow-y-auto no-scrollbar font-mono text-xs">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-slate-300 text-xs">
                    Gemini 3.1 Pro High-Thinking mode analyzing price action, trap zones, and invalidation criteria...
                  </p>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Testing mathematical risk/reward and Indian market slippage bounds
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Analysis Error:</span>
                  </div>
                  <p>{errorMsg}</p>
                </div>
              )}

              {!loading && !errorMsg && !aiAnalysis && (
                <div className="text-center py-16 space-y-2 text-slate-500">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-xs font-sans">
                    Click <strong>"Run Deep Invalidation Analysis"</strong> to execute Gemini 3.1 Pro with High Thinking mode on this {setup.instrument} setup.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto font-sans">
                    Aakash ke SRS niyam: Guaranteed profit ka koi dava nahi, specific invalidation level identify hoga, aur calibrated probability sample-size warning ke saath present hogi.
                  </p>
                </div>
              )}

              {!loading && aiAnalysis && (
                <div className="text-slate-200 space-y-3 leading-relaxed whitespace-pre-line text-xs font-sans">
                  <div className="bg-indigo-950/40 p-2 rounded border border-indigo-800/40 flex items-center justify-between text-[11px] text-indigo-300">
                    <span className="font-semibold">Reasoning Model: {modelUsed}</span>
                    <span className="font-mono text-[10px]">Thinking: {thinkingMode}</span>
                  </div>
                  <div className="text-slate-200 font-mono text-[11px] leading-relaxed p-1">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chat Input */}
          <div className="pt-2 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customQuery.trim()) {
                  handleRunDeepAnalysis(customQuery);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Aakash, is setup ke baare me kuch specific poochna hai? (Hinglish/English)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !customQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
