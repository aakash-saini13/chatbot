import React from 'react';
import { JournalEntry, RiskSettings } from '../types/trading';
import {
  BarChart3,
  TrendingUp,
  Percent,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  entries: JournalEntry[];
  riskSettings: RiskSettings;
  language: 'Hinglish' | 'English';
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  entries,
  riskSettings,
  language,
}) => {
  const totalTrades = entries.length;
  const winningTrades = entries.filter((e) => e.pnlRupees > 0);
  const losingTrades = entries.filter((e) => e.pnlRupees < 0);
  const breakEvenTrades = entries.filter((e) => e.pnlRupees === 0);

  const winRate = totalTrades > 0 ? Number(((winningTrades.length / totalTrades) * 100).toFixed(1)) : 0;
  const totalPnL = entries.reduce((acc, e) => acc + e.pnlRupees, 0);

  const grossProfit = winningTrades.reduce((acc, e) => acc + e.pnlRupees, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, e) => acc + e.pnlRupees, 0));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.0 : 0;

  // Expectancy in R = (Win Rate * Avg Win R) - (Loss Rate * Avg Loss R)
  const avgWinR =
    winningTrades.length > 0
      ? winningTrades.reduce((acc, e) => acc + e.rMultiple, 0) / winningTrades.length
      : 0;
  const avgLossR =
    losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((acc, e) => acc + e.rMultiple, 0) / losingTrades.length)
      : 0;

  const winRateRatio = totalTrades > 0 ? winningTrades.length / totalTrades : 0;
  const lossRateRatio = totalTrades > 0 ? losingTrades.length / totalTrades : 0;
  const expectancyR = Number((winRateRatio * avgWinR - lossRateRatio * avgLossR).toFixed(2));

  // Minimum statistical sample threshold: N=30
  const isSmallSample = totalTrades < 30;

  // Cumulative equity curve data points
  let runningEquity = riskSettings.accountCapital;
  const equityPoints: { trade: number; equity: number; pnl: number }[] = [
    { trade: 0, equity: runningEquity, pnl: 0 },
    ...entries
      .slice()
      .reverse()
      .map((e, idx) => {
        runningEquity += e.pnlRupees;
        return { trade: idx + 1, equity: runningEquity, pnl: e.pnlRupees };
      }),
  ];

  const minEquity = Math.min(...equityPoints.map((p) => p.equity)) * 0.98;
  const maxEquity = Math.max(...equityPoints.map((p) => p.equity)) * 1.02;
  const equityRange = maxEquity - minEquity || 1;

  const svgWidth = 650;
  const svgHeight = 220;
  const padX = 40;
  const padY = 25;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const getEquityY = (val: number) => {
    return chartH - ((val - minEquity) / equityRange) * chartH + padY;
  };

  return (
    <div className="space-y-4">
      {/* Sample Size Warning Banner (Strictly per FR-06) */}
      {isSmallSample ? (
        <div className="bg-amber-950/50 border border-amber-800/80 p-3.5 rounded-xl text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-300 font-bold font-mono">
              FR-06 STATISTICAL VALIDATION ALERT: Low Sample Size (N = {totalTrades} / 30 minimum)
            </strong>
            <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed font-sans">
              SRS niyam ke anusaar: 30 trades se kam data par dikhaya gaya koi bhi win rate ya expectancy statistically calibrated nahi mana ja sakta. Real edge verify karne ke liye paper trading sample expand karein.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Sufficient statistical sample size reached (N = {totalTrades} trades). Metrics passed validation gate.</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Total Trades</span>
          <span className="text-lg font-bold text-white">{totalTrades}</span>
          <span className="text-[10px] text-slate-500 block">N = {totalTrades}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Win Rate</span>
          <span className="text-lg font-bold text-cyan-400">{winRate}%</span>
          <span className="text-[10px] text-slate-500 block">{winningTrades.length}W / {losingTrades.length}L</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Expectancy</span>
          <span className={`text-lg font-bold ${expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {expectancyR >= 0 ? `+${expectancyR}R` : `${expectancyR}R`}
          </span>
          <span className="text-[10px] text-slate-500 block">Avg return / trade</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Profit Factor</span>
          <span className="text-lg font-bold text-emerald-400">{profitFactor}</span>
          <span className="text-[10px] text-slate-500 block">Gross W/L ratio</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Net Realized P&L</span>
          <span className={`text-lg font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? `+₹${totalPnL.toFixed(2)}` : `-₹${Math.abs(totalPnL).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-slate-500 block">INR Realized</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-slate-400 text-[10px] block uppercase">Avg Win vs Loss</span>
          <span className="text-sm font-bold text-slate-200">
            +{avgWinR.toFixed(1)}R / -{avgLossR.toFixed(1)}R
          </span>
          <span className="text-[10px] text-slate-500 block">Risk/Reward Realized</span>
        </div>
      </div>

      {/* Main Charts Grid: Equity Curve + R-Multiple Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Equity Curve SVG */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Simulated Paper Equity Curve</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Current: ₹{runningEquity.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[200px]">
              {/* Horizontal Reference Lines */}
              {[0, 0.5, 1].map((r) => {
                const y = padY + r * chartH;
                const eq = maxEquity - r * equityRange;
                return (
                  <g key={r}>
                    <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x={padX - 35} y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace">
                      ₹{Math.round(eq / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Equity Curve Polyline */}
              {equityPoints.length > 1 && (
                <path
                  d={equityPoints
                    .map((p, i) => {
                      const x = padX + (i / (equityPoints.length - 1)) * chartW;
                      const y = getEquityY(p.equity);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}

              {/* Plot dots */}
              {equityPoints.map((p, i) => {
                const x = padX + (i / (equityPoints.length - 1 || 1)) * chartW;
                const y = getEquityY(p.equity);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={i === 0 ? '#64748b' : p.pnl && p.pnl >= 0 ? '#10b981' : '#f43f5e'}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Trade R-Distribution */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>R-Multiple Distribution</span>
            </h3>

            <div className="space-y-3 mt-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Big Winners (&gt; +2R):</span>
                  <span className="font-bold text-emerald-400">
                    {entries.filter((e) => e.rMultiple >= 2).length} Trades
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(entries.filter((e) => e.rMultiple >= 2).length / (totalTrades || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Standard Winners (+1R to +2R):</span>
                  <span className="font-bold text-cyan-400">
                    {entries.filter((e) => e.rMultiple > 0 && e.rMultiple < 2).length} Trades
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{
                      width: `${
                        (entries.filter((e) => e.rMultiple > 0 && e.rMultiple < 2).length / (totalTrades || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Planned Losses (-1R):</span>
                  <span className="font-bold text-rose-400">
                    {entries.filter((e) => e.rMultiple <= 0 && e.rMultiple >= -1.1).length} Trades
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${
                        (entries.filter((e) => e.rMultiple <= 0 && e.rMultiple >= -1.1).length /
                          (totalTrades || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Fat Losses (&gt; -1.2R / SL Moved):</span>
                  <span className="font-bold text-purple-400">
                    {entries.filter((e) => e.rMultiple < -1.1).length} Trades
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{
                      width: `${
                        (entries.filter((e) => e.rMultiple < -1.1).length / (totalTrades || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans">
            Expectancy tabhi profitable rahegi jab tumhare losses strictly -1R par cut hon aur winners ko 1:2R tak chalne diya jaye.
          </div>
        </div>
      </div>
    </div>
  );
};
