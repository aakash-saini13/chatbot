import React, { useState } from 'react';
import { RiskSettings } from '../types/trading';
import { calculatePositionSize } from '../utils/mockMarket';
import {
  HARD_CODED_MAX_RISK_PER_TRADE_RUPEES,
  HARD_CODED_DAILY_LOSS_LIMIT_RUPEES,
  HARD_CODED_MAX_OPEN_POSITIONS,
  HARD_CODED_MIN_RR_RATIO,
} from '../utils/riskEngine';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  XCircle,
  History,
  Info,
  Scale,
} from 'lucide-react';

interface RiskGuardrailsProps {
  riskSettings: RiskSettings;
  onUpdateRiskSettings: (settings: RiskSettings) => void;
  language: 'Hinglish' | 'English';
}

export const RiskGuardrails: React.FC<RiskGuardrailsProps> = ({
  riskSettings,
  language,
}) => {
  const [calcCapital, setCalcCapital] = useState(riskSettings.accountCapital);
  const [calcRiskPct, setCalcRiskPct] = useState(riskSettings.maxRiskPerTradePct);
  const [calcEntry, setCalcEntry] = useState(2940);
  const [calcSL, setCalcSL] = useState(2920);

  const sizingResult = calculatePositionSize(calcCapital, calcRiskPct, calcEntry, calcSL);

  const perShareRisk = Math.abs(calcEntry - calcSL);
  const percentageBudget = (calcCapital * calcRiskPct) / 100;
  const effectiveRiskBudget = Math.min(percentageBudget, HARD_CODED_MAX_RISK_PER_TRADE_RUPEES);
  const rawQtyByRisk = perShareRisk > 0 ? Math.floor(effectiveRiskBudget / perShareRisk) : 0;
  const rawQtyByCapital = calcEntry > 0 ? Math.floor(calcCapital / calcEntry) : 0;

  // Preset verification scenarios to directly demonstrate the user's test cases
  const applyPreset = (preset: 'TEST_RELIANCE' | 'TEST_EXTREME' | 'TEST_3LAKH' | 'TEST_ZERO_RISK') => {
    if (preset === 'TEST_RELIANCE') {
      setCalcCapital(200000);
      setCalcRiskPct(1.0);
      setCalcEntry(2940);
      setCalcSL(2920);
    } else if (preset === 'TEST_EXTREME') {
      setCalcCapital(200000);
      setCalcRiskPct(1.0);
      setCalcEntry(10000);
      setCalcSL(9990);
    } else if (preset === 'TEST_3LAKH') {
      setCalcCapital(300000);
      setCalcRiskPct(1.0);
      setCalcEntry(2500);
      setCalcSL(2475);
    } else if (preset === 'TEST_ZERO_RISK') {
      setCalcCapital(200000);
      setCalcRiskPct(0);
      setCalcEntry(2940);
      setCalcSL(2920);
    }
  };

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
              <span>Risk Management Engine & Code-Level Hard Limits (FR-12)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold">
                CODE-LEVEL IMMUTABLE
              </span>
            </h2>
            <p className="text-slate-400 mt-0.5 max-w-2xl font-sans">
              Hard limits code-level par locked hain. LocalStorage tampering ya corrupt backup bhi in boundaries ko relax nahi kar sakte.
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
          <div className="text-xl font-bold text-white">1% / Max ₹2,000</div>
          <span className="text-emerald-400 text-[11px] block font-sans">
            Strict min(1%, ₹2,000 hard cap)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Daily Loss Limit</span>
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </span>
          <div className="text-xl font-bold text-rose-400">
            -₹{HARD_CODED_DAILY_LOSS_LIMIT_RUPEES.toLocaleString('en-IN')}
          </div>
          <span className="text-slate-400 text-[11px] block font-sans">
            Realized + Open Unrealized loss cutoff
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Min Risk / Reward</span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </span>
          <div className="text-xl font-bold text-cyan-400">
            1:{HARD_CODED_MIN_RR_RATIO.toFixed(1)} Minimum
          </div>
          <span className="text-slate-400 text-[11px] block font-sans">
            Sub-1:2 setups centrally blocked
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 uppercase text-[10px] flex items-center justify-between">
            <span>Max Open Positions</span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="text-xl font-bold text-amber-400">
            {HARD_CODED_MAX_OPEN_POSITIONS} Concurrent Max
          </div>
          <span className="text-slate-400 text-[11px] block font-sans">
            Free capital enforcement
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Position Sizing Calculator on Left + Audit History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Position Sizing Calculator with Verified Capital Affordability */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Hardened Position Sizing Calculator
              </h3>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Dual-Constraint: Risk Budget & Capital Affordability
            </span>
          </div>

          {/* Quick Preset Buttons for Scenario Verification */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-mono">Verify Critical Scenarios:</span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => applyPreset('TEST_RELIANCE')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[10px]"
              >
                1. Reliance ₹2,940 (Capital limit check)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('TEST_EXTREME')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[10px]"
              >
                2. Extreme ₹10k/SL ₹9,990 (₹20L bypass test)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('TEST_3LAKH')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[10px]"
              >
                3. ₹3 Lakh Account (₹2k hard cap test)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('TEST_ZERO_RISK')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[10px]"
              >
                4. 0% Risk (No 1-share force test)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
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

          {/* Sizing Math Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-300">
              <span>Risk Budget from % ({calcRiskPct}% of ₹{calcCapital.toLocaleString('en-IN')}):</span>
              <strong className="text-white">₹{percentageBudget.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1">
                <span>Effective Risk Budget (Capped at ₹2,000):</span>
                <Lock className="w-3 h-3 text-emerald-400" />
              </span>
              <strong className={percentageBudget > 2000 ? 'text-amber-400' : 'text-emerald-400'}>
                ₹{effectiveRiskBudget.toFixed(2)} {percentageBudget > 2000 && '(Hard Cap Applied)'}
              </strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Per-Share Risk Distance:</span>
              <strong className="text-rose-400">₹{perShareRisk.toFixed(2)}</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>1. Shares allowed by Risk Budget:</span>
                <span className="font-bold text-slate-200">{rawQtyByRisk} shares</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>2. Shares affordable by Account Capital:</span>
                <span className="font-bold text-slate-200">{rawQtyByCapital} shares</span>
              </div>
              <div className="flex justify-between items-center text-cyan-300 font-semibold border-t border-slate-800 pt-1">
                <span>Enforced Quantity = min(Risk, Capital):</span>
                <span>{sizingResult.quantity} shares</span>
              </div>
            </div>

            {/* Final Order Status Card */}
            {sizingResult.allowed ? (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div className="flex justify-between items-center text-emerald-400 text-sm font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Safe Enforced Quantity:</span>
                  </span>
                  <span className="text-base">{sizingResult.quantity} Shares</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span>Total Capital Required:</span>
                  <span className="font-bold text-white">₹{sizingResult.capitalRequired.toLocaleString('en-IN')} (≤ ₹{calcCapital.toLocaleString('en-IN')})</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span>Total Risk on SL Hit:</span>
                  <span className="font-bold text-rose-300">₹{sizingResult.riskRupees.toFixed(2)} (≤ ₹{effectiveRiskBudget.toFixed(2)})</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>ORDER REJECTED BY RISK ENGINE:</span>
                </div>
                <div className="text-[11px] font-sans text-rose-200 pl-5">
                  {sizingResult.error}
                </div>
                <div className="text-[10px] text-rose-400/80 pl-5 font-mono">
                  Enforced quantity is 0. System never forces 1 share when risk or capital bounds are violated.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Risk Audit Log & Immutable Boundaries */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Risk Engine Invariants & Audit Trail
              </h3>
            </div>

            <div className="space-y-2.5 mt-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">Code-Level Invariant 1</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-slate-300">
                  <strong>Capital Affordability:</strong> <code>quantity × entry ≤ accountCapital</code>. Bot will never open cash positions exceeding account balance.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">Code-Level Invariant 2</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-slate-300">
                  <strong>₹2,000 Hard Cap:</strong> <code>risk = min(capital × pct, ₹2,000)</code>. Even on high capital accounts, risk per trade never exceeds ₹2,000.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">Code-Level Invariant 3</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-slate-300">
                  <strong>Centralized Gate:</strong> No order is placed without passing <code>validateOrderAgainstCentralRiskGate()</code>. Invalidated setups are hard-blocked.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">Code-Level Invariant 4</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-slate-300">
                  <strong>Zero-Share Rejection:</strong> If risk budget or capital is insufficient, quantity is 0 + error. Never forces <code>Math.max(1, qty)</code>.
                </div>
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
