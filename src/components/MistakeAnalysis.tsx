import React, { useState } from 'react';
import { JournalEntry, RiskSettings } from '../types/trading';
import {
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  Flame,
  Frown,
  Loader2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface MistakeAnalysisProps {
  entries: JournalEntry[];
  riskSettings: RiskSettings;
  language: 'Hinglish' | 'English';
}

export const MistakeAnalysis: React.FC<MistakeAnalysisProps> = ({
  entries,
  riskSettings,
  language,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  // Analyze Violations
  const allViolations: Record<string, number> = {};
  let totalViolationsCount = 0;
  let capitalLostToViolations = 0;

  entries.forEach((e) => {
    if (e.ruleViolations && e.ruleViolations.length > 0) {
      totalViolationsCount += e.ruleViolations.length;
      if (e.pnlRupees < 0) {
        capitalLostToViolations += Math.abs(e.pnlRupees);
      }
      e.ruleViolations.forEach((v) => {
        allViolations[v] = (allViolations[v] || 0) + 1;
      });
    }
  });

  // FR-09 Core Principle: Distinguish Execution Error vs Strategy Expectancy
  const ruleBreakerTrades = entries.filter((e) => e.ruleViolations.length > 0);
  const disciplinedLosses = entries.filter((e) => e.ruleViolations.length === 0 && e.pnlRupees < 0);

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/audit-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalEntries: entries,
          approvedRiskLimits: riskSettings,
        }),
      });
      const data = await res.json();
      setAuditResult(data.audit || 'Discipline audit complete.');
    } catch (e) {
      console.error(e);
      setAuditResult('Failed to run AI audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining FR-09 Principle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>Mistake Analysis & Behavioral Audit (FR-09)</span>
          </h2>
          <p className="text-slate-400 mt-1 max-w-2xl font-sans">
            <strong className="text-amber-300">FR-09 Core Safeguard:</strong> Har losing trade ko mistake nahi mana jayega. Agar rules follow kiye gaye hain aur SL hit hua hai, toh woh strategy expectancy ka part hai. Mistake sirf execution rule break karna hai (SL move karna, premature exit, FOMO entry).
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAuditing}
          className="bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-lg transition disabled:opacity-50"
        >
          {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isAuditing ? 'Auditing with Gemini Thinking...' : 'Run Gemini Discipline Audit'}</span>
        </button>
      </div>

      {/* Metrics Row: Execution Errors vs Good Losses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px]">Rule Violations (Execution Errors)</span>
          <div className="text-xl font-bold text-rose-400">{totalViolationsCount} Violations</div>
          <span className="text-slate-400 text-[11px] block">
            Capital Impact: -₹{capitalLostToViolations.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px]">Good Losses (Disciplined -1R Hits)</span>
          <div className="text-xl font-bold text-emerald-400">{disciplinedLosses.length} Trades</div>
          <span className="text-slate-400 text-[11px] block">
            Rules strictly followed. Statistically healthy.
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px]">Trade Execution Integrity</span>
          <div className="text-xl font-bold text-cyan-400">
            {entries.length > 0
              ? `${Math.round(((entries.length - ruleBreakerTrades.length) / entries.length) * 100)}%`
              : '100%'}
          </div>
          <span className="text-slate-400 text-[11px] block">Target: 95%+ Discipline Rate</span>
        </div>
      </div>

      {/* Main Grid: Repeated Violations Breakdown + AI Discipline Audit Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Violation Breakdown */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Repeated Violation Patterns</span>
          </h3>

          {Object.keys(allViolations).length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Shabash Aakash! Koi repeated rule violation record nahi hua hai.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(allViolations).map(([pattern, count]) => (
                <div key={pattern} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-300 font-bold">{pattern}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[11px] font-bold border border-rose-800">
                      {count} {count === 1 ? 'Time' : 'Times'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {pattern.includes('Stop Loss')
                      ? 'Losses ko cut hone se rokna account blow-up ka sabse bada kaaran hota hai. Never move SL away from initial placement.'
                      : 'Impulsive entry market me trap ka shikaar banati hai.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Discipline Audit Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Gemini 3.1 Pro · Discipline Audit Report</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                Thinking Mode: HIGH
              </span>
            </div>

            <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[300px] max-h-[460px] overflow-y-auto no-scrollbar font-mono text-xs text-slate-200">
              {isAuditing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
                  <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                  <p className="text-xs">
                    Auditing recent journal logs for FOMO, revenge trading, and expectancy mismatch...
                  </p>
                </div>
              ) : auditResult ? (
                <div className="whitespace-pre-line leading-relaxed text-[11px]">
                  {auditResult}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 font-sans space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-xs">
                    Click <strong>"Run Gemini Discipline Audit"</strong> to generate a psychological and execution error breakdown of your recent paper trades.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
