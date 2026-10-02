import React, { useState } from 'react';
import { SetupCard, SetupStatus } from '../types/trading';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  ExternalLink,
  Ban,
  Activity,
} from 'lucide-react';

interface SetupAlertsProps {
  setups: SetupCard[];
  language: 'Hinglish' | 'English';
  onExecutePaperTrade: (setup: SetupCard) => void;
  onDeepAnalyze: (setup: SetupCard) => void;
}

export const SetupAlerts: React.FC<SetupAlertsProps> = ({
  setups,
  language,
  onExecutePaperTrade,
  onDeepAnalyze,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredSetups = setups.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.setupStatus === filterStatus;
  });

  const getStatusBadge = (status: SetupStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Needs confirmation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Candidate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Invalidated':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Blocked':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>{language === 'Hinglish' ? 'Active Setup Cards (FR-05)' : 'Active Setup Cards (FR-05)'}</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({filteredSetups.length} Setups)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'Hinglish'
              ? 'SRS ke anusaar rule-derived levels, invalidation criteria, aur low-confidence warnings ke saath.'
              : 'Rule-derived levels with explicit invalidation rules and sample-size calibrated warnings.'}
          </p>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
          {['ALL', 'Confirmed', 'Needs confirmation', 'Candidate', 'Invalidated'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded font-medium transition ${
                filterStatus === st ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Illustrative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSetups.map((setup) => {
          const isLong = setup.direction === 'LONG';
          const isSmallSample = setup.sampleSize < 30;

          return (
            <div
              key={setup.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all hover:border-slate-700"
            >
              {/* Illustrative Setup Card Header Banner - Exact SRS Requirement */}
              <div className="bg-amber-950/40 border-b border-amber-900/40 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-amber-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Paper trading only
                </span>
                <span className="text-amber-400/80 font-mono text-[10px]">
                  Example format only · Real market signal nahi hai
                </span>
              </div>

              {/* Main Card Content */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Symbol, Direction, Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-mono">{setup.instrument}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 ${
                          isLong ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {setup.direction} ({setup.timeframe})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Strategy: <strong className="text-slate-200">{setup.strategyName}</strong> ({setup.strategyVersion})
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      setup.setupStatus
                    )}`}
                  >
                    {setup.setupStatus}
                  </span>
                </div>

                {/* SRS Rule-Derived Levels Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Entry Zone</span>
                    <span className="font-bold text-slate-200">{setup.entryZone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Stop-Loss (SL)</span>
                    <span className="font-bold text-rose-400">₹{setup.stopLoss.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Target 1 (T1)</span>
                    <span className="font-bold text-emerald-400">₹{setup.target1.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Risk / Reward</span>
                    <span className="font-bold text-cyan-400">{setup.potentialRiskReward}</span>
                  </div>
                </div>

                {/* Invalidation Rule */}
                <div className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-[11px] mb-1">
                    <Ban className="w-3.5 h-3.5 text-rose-400" />
                    <span>Invalidation Condition (FR-03 & FR-05):</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                    {setup.invalidation}
                  </p>
                </div>

                {/* Evidence & Matched Rules */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Matched Rules & Evidence:</span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {setup.matchedRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                    {setup.unmetConditions.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>Awaiting: {cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FR-06: Calibrated Probability & Low Confidence Warning */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Validation Sample:</span>
                    <strong className={isSmallSample ? 'text-amber-400' : 'text-emerald-400'}>
                      N = {setup.sampleSize} trades
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Calibrated Probability:</span>
                    <strong className="text-cyan-300">{setup.calibratedProbabilityPct}%</strong>
                  </div>

                  {/* Warning banner */}
                  <div className="mt-1 flex items-start gap-1 text-[10px] text-amber-300/90 font-sans leading-tight bg-amber-950/40 p-1.5 rounded border border-amber-900/30">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{setup.confidenceWarning}</span>
                  </div>
                </div>

                {/* Data Source & Timestamp */}
                <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono pt-1">
                  <span>Source: {setup.dataSource}</span>
                  <span>{setup.timestamp}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-slate-950/80 p-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onDeepAnalyze(setup)}
                  className="flex-1 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 font-medium text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deep Reasoning</span>
                </button>

                <button
                  onClick={() => onExecutePaperTrade(setup)}
                  disabled={setup.setupStatus === 'Invalidated' || setup.setupStatus === 'Blocked'}
                  className={`flex-1 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    setup.setupStatus === 'Confirmed'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : setup.setupStatus === 'Needs confirmation'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                  }`}
                  title={
                    setup.setupStatus === 'Invalidated' || setup.setupStatus === 'Blocked'
                      ? `Execution blocked: Setup is ${setup.setupStatus}`
                      : 'Execute paper trade through Central Risk Gate'
                  }
                >
                  <span>
                    {setup.setupStatus === 'Invalidated' || setup.setupStatus === 'Blocked'
                      ? `${setup.setupStatus} (Blocked)`
                      : 'Paper Trade'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
