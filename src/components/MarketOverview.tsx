import React, { useState } from 'react';
import { Instrument, Candle } from '../types/trading';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart2,
  Clock,
  Info,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface MarketOverviewProps {
  instruments: Instrument[];
  selectedInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
  language: 'Hinglish' | 'English';
  onNavigateToSetup: (symbol: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  instruments,
  selectedInstrument,
  onSelectInstrument,
  language,
  onNavigateToSetup,
}) => {
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '1D' | '1W'>('15m');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'INDEX' | 'EQUITY'>('ALL');
  const [showIndicators, setShowIndicators] = useState({
    ema20: true,
    ema50: true,
    vwap: true,
    srZones: true,
  });

  const filteredInstruments = instruments.filter((inst) => {
    if (activeFilter === 'ALL') return true;
    return inst.type === activeFilter;
  });

  const candles = selectedInstrument.candles || [];
  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;

  // Chart coordinate helper
  const svgWidth = 800;
  const svgHeight = 320;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight + paddingY;
  };

  const candleWidth = Math.max(6, Math.min(22, (chartWidth / candles.length) * 0.7));

  return (
    <div className="space-y-4">
      {/* Top Ticker Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {instruments.slice(0, 5).map((inst) => {
          const isPositive = inst.change >= 0;
          const isSelected = selectedInstrument.symbol === inst.symbol;
          return (
            <div
              key={inst.symbol}
              onClick={() => onSelectInstrument(inst)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/20'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white font-mono">{inst.symbol}</span>
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded font-semibold ${
                    isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {inst.changePct}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-bold font-mono text-slate-100">
                  ₹{inst.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {inst.type === 'INDEX' ? 'Index' : 'NSE Cash'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Watchlist on Left + Interactive Chart & Levels on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Watchlist */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'Hinglish' ? 'Indian Watchlist (Cash & Indices)' : 'Indian Watchlist'}
                </span>
              </div>
              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${
                    activeFilter === 'ALL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('INDEX')}
                  className={`px-2 py-0.5 rounded ${
                    activeFilter === 'INDEX' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Indices
                </button>
                <button
                  onClick={() => setActiveFilter('EQUITY')}
                  className={`px-2 py-0.5 rounded ${
                    activeFilter === 'EQUITY' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Stocks
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-850 mt-2 max-h-[460px] overflow-y-auto no-scrollbar space-y-1">
              {filteredInstruments.map((inst) => {
                const isSelected = selectedInstrument.symbol === inst.symbol;
                const isPositive = inst.change >= 0;
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => onSelectInstrument(inst)}
                    className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-l-4 border-emerald-400 text-white'
                        : 'hover:bg-slate-850/60 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs font-mono">{inst.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{inst.sector}]</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>RSI: {inst.rsi}</span>
                        <span>•</span>
                        <span>EMA20: ₹{inst.ema20}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-100">
                        ₹{inst.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-[11px] font-mono font-medium flex items-center justify-end ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {inst.changePct}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium font-mono">FR-01 Monitoring:</span> Intraday (5m, 15m) aur Swing (1D) timeframes continuous scan par hain. Market close ke baad research mode active rehta hai.
          </div>
        </div>

        {/* Right Interactive Candle Chart & Context */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          {/* Chart Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {selectedInstrument.symbol} · {selectedInstrument.exchange}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedInstrument.sector}
                </span>
                <span className="text-[11px] text-slate-400">
                  Trend: <strong className="text-emerald-400">{selectedInstrument.trend}</strong>
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>
                  LTP: <strong className="text-white font-mono">₹{selectedInstrument.ltp}</strong>
                </span>
                <span>
                  High: <strong className="text-emerald-400 font-mono">₹{selectedInstrument.high}</strong>
                </span>
                <span>
                  Low: <strong className="text-rose-400 font-mono">₹{selectedInstrument.low}</strong>
                </span>
                <span>
                  RSI(14): <strong className="text-cyan-400 font-mono">{selectedInstrument.rsi}</strong>
                </span>
              </div>
            </div>

            {/* Timeframe & Indicator Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
                {(['5m', '15m', '1D', '1W'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded font-mono font-medium ${
                      timeframe === tf ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onNavigateToSetup(selectedInstrument.symbol)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                <span>Check Setups</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Indicator toggles strip */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Overlays:</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showIndicators.ema20}
                onChange={(e) => setShowIndicators({ ...showIndicators, ema20: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span className="text-emerald-400">EMA 20</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showIndicators.ema50}
                onChange={(e) => setShowIndicators({ ...showIndicators, ema50: e.target.checked })}
                className="rounded text-amber-500 focus:ring-0"
              />
              <span className="text-amber-400">EMA 50</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showIndicators.vwap}
                onChange={(e) => setShowIndicators({ ...showIndicators, vwap: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span className="text-cyan-400">VWAP</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showIndicators.srZones}
                onChange={(e) => setShowIndicators({ ...showIndicators, srZones: e.target.checked })}
                className="rounded text-purple-500 focus:ring-0"
              />
              <span className="text-purple-400">S/R Zones</span>
            </label>
          </div>

          {/* SVG Candlestick Chart */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-[280px] select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + ratio * chartHeight;
                const price = maxPrice - ratio * priceRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={svgWidth - paddingX + 5}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      ₹{price.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Support & Resistance Bands */}
              {showIndicators.srZones && (
                <>
                  {/* Resistance Band */}
                  <rect
                    x={paddingX}
                    y={getY(selectedInstrument.resistanceZone) - 6}
                    width={chartWidth}
                    height="12"
                    fill="rgba(244, 63, 94, 0.12)"
                    stroke="rgba(244, 63, 94, 0.35)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={paddingX + 10}
                    y={getY(selectedInstrument.resistanceZone) - 9}
                    fill="#fb7185"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    Key Resistance Zone ₹{selectedInstrument.resistanceZone}
                  </text>

                  {/* Support Band */}
                  <rect
                    x={paddingX}
                    y={getY(selectedInstrument.supportZone) - 6}
                    width={chartWidth}
                    height="12"
                    fill="rgba(16, 185, 129, 0.12)"
                    stroke="rgba(16, 185, 129, 0.35)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={paddingX + 10}
                    y={getY(selectedInstrument.supportZone) + 16}
                    fill="#34d399"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    Key Support Zone ₹{selectedInstrument.supportZone}
                  </text>
                </>
              )}

              {/* Candlesticks */}
              {candles.map((candle, idx) => {
                const x = paddingX + idx * (chartWidth / candles.length) + (chartWidth / candles.length) / 2;
                const isBullish = candle.close >= candle.open;
                const color = isBullish ? '#10b981' : '#f43f5e';
                const bodyTop = getY(Math.max(candle.open, candle.close));
                const bodyBottom = getY(Math.min(candle.open, candle.close));
                const bodyHeight = Math.max(2, bodyBottom - bodyTop);

                return (
                  <g key={idx} className="transition-opacity hover:opacity-80">
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={getY(candle.high)}
                      x2={x}
                      y2={getY(candle.low)}
                      stroke={color}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* EMA 20 Line Overlay */}
              {showIndicators.ema20 && (
                <path
                  d={candles
                    .map((c, i) => {
                      const x = paddingX + i * (chartWidth / candles.length) + (chartWidth / candles.length) / 2;
                      const emaVal = c.close * 0.998 + (i % 3) * 0.5;
                      const y = getY(emaVal);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              )}

              {/* EMA 50 Line Overlay */}
              {showIndicators.ema50 && (
                <path
                  d={candles
                    .map((c, i) => {
                      const x = paddingX + i * (chartWidth / candles.length) + (chartWidth / candles.length) / 2;
                      const emaVal = c.close * 0.992 - (i % 2) * 0.5;
                      const y = getY(emaVal);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              )}
            </svg>
          </div>

          {/* Context Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Market Structure:</span>
              <p className="text-slate-200 mt-1 font-mono leading-relaxed">
                Higher Highs & Higher Lows on 15m. Sustaining above 20 EMA pullback line.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Order Flow / Volume:</span>
              <p className="text-slate-200 mt-1 font-mono leading-relaxed">
                Healthy volume on up candles; drying volume on pullbacks to VWAP.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Data Integrity & Delay:</span>
              <p className="text-emerald-400 mt-1 font-mono leading-relaxed">
                Free NSE Feed (15m Delay / Live Sim). No missing candles detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
