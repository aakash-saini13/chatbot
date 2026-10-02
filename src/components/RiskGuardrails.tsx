import React, { useState } from 'react';
import { RiskSettings } from '../types/trading';
import { calculatePositionSize } from '../utils/mockMarket';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Sliders,
  DollarSign,
  History,
} from 'lucide-react';

interface RiskGuardrailsProps {
  riskSettings: RiskSettings;
  onUpdateRiskSettings: (settings: RiskSettings) => void;
  language: 'Hinglish' | 'English';
}

export const RiskGuardrails: React.FC<RiskGuardrailsProps> = ({
  riskSettings,
  onUpdateRiskSettings,
  language,
}) => {
  const [calcCapital, setCalcCapital] = useState(riskSettings.accountCapital);
  const [calcRiskPct, setCalcRiskPct] = useState(riskSettings.maxRiskPerTradePct);
  const [calcEntry, setCalcEntry] = useState(2940);
  const [calcSL, setCalcSL] = useState(2920);

  const sizingResult = calculatePositionSize(calcCapital, calcRiskPct, calcEntry, calcSL);

  return (
    <div className="space-y-4">
      {/* Immutable Hard Limits Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Risk Management Engine & Hard Limits (FR-12)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                APPROVED & LOCKED
              </span>
            </h2>
            <p className="text-slate-400 mt-0.5 max-w-2xl font-sans">
              Bot risk limits suggest kar sakta hai, lekin tumhari approval required hogi. Approved hard limits ko bot kabhi automatically override nahi kar sakta.
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono">
          <span className="text-slate-400 block text-[10px]">Approved Authority:</span>
          <span className="text-white font-bold">{riskSettings.approvedBy}</span>
          <span className="text-[10px] text-slate-500 block">{riskSettings.approvalTimestamp}</span>
        </div>
      </div>

      {/* Hard Limits Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Max Risk Per Trade</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <div className="text-xl font-bold text-white">{riskSettings.maxRiskPerTradePct}%</div>
          <span className="text-slate-400 text-[11px] block">
            Max ₹{riskSettings.maxRiskPerTradeRupees} per trade
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Daily Loss Limit</span>
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </span>
          <div className="text-xl font-bold text-rose-400">
            -₹{riskSettings.dailyLossLimitRupees.toLocaleString('en-IN')}
          </div>
          <span className="text-slate-400 text-[11px] block">
            Automatic trading cutoff trigger
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Min Risk / Reward</span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </span>
          <div className="text-xl font-bold text-cyan-400">
            1:{riskSettings.minRiskRewardRatio.toFixed(1)}
          </div>
          <span className="text-slate-400 text-[11px] block">
            Sub-1:2 setups automatically blocked
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Max Open Positions</span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="text-xl font-bold text-amber-400">
            {riskSettings.maxOpenPositions} Concurrent
          </div>
          <span className="text-slate-400 text-[11px] block">
            Portfolio exposure guardrail
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Position Sizing Calculator on Left + Audit History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Position Sizing Calculator */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Safe Position Sizing Calculator (Strict Math)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Account Capital (₹)</label>
              <input
                type="number"
                value={calcCapital}
                onChange={(e) => setCalcCapital(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Risk Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={calcRiskPct}
                onChange={(e) => setCalcRiskPct(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Entry Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={calcEntry}
                onChange={(e) => setCalcEntry(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Stop Loss (₹)</label>
              <input
                type="number"
                step="0.05"
                value={calcSL}
                onChange={(e) => setCalcSL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-300">
              <span>Allowable Risk Amount:</span>
              <strong className="text-white">₹{((calcCapital * calcRiskPct) / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Per-Share Risk Distance:</span>
              <strong className="text-rose-400">₹{Math.abs(calcEntry - calcSL).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-400 text-sm font-bold pt-2 border-t border-slate-800">
              <span>Maximum Safe Quantity:</span>
              <span className="text-base">{sizingResult.quantity} Shares / Contracts</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Required Margin / Capital:</span>
              <span>₹{sizingResult.capitalRequired.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right: Risk Audit Log */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Risk Approval Audit Trail (NFR-10)
              </h3>
            </div>

            <div className="space-y-2.5 mt-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">Hard Limit Baseline Locked</span>
                  <span>2026-10-02 09:15</span>
                </div>
                <div className="text-slate-300">
                  Per-trade risk approved at 1.0% (₹2,000). Daily loss limit locked at ₹5,000.
                </div>
                <div className="text-[10px] text-slate-500">Sign-off: Aakash (User Verified)</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">Bot Suggestion Rejected</span>
                  <span>2026-09-30 16:00</span>
                </div>
                <div className="text-slate-300">
                  Bot suggested increasing risk to 1.5% for high-probability setups. User rejected.
                </div>
                <div className="text-[10px] text-slate-500">Hard limit preserved.</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/30 text-[10px] text-emerald-300 leading-relaxed font-sans">
            Immutable Guardrail Active: AI Studio trading assistant cannot increase position sizing or widen stop loss beyond approved boundaries.
          </div>
        </div>
      </div>
    </div>
  );
};
