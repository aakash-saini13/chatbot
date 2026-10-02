import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Server,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface DataHealthProps {
  onOpenPaidDataModal: () => void;
  language: 'Hinglish' | 'English';
}

export const DataHealth: React.FC<DataHealthProps> = ({
  onOpenPaidDataModal,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PROVIDERS' | 'ARCHITECTURE' | 'RAM_BUDGET' | 'APPROVAL_STRATEGY'>('PROVIDERS');

  const providerComparison = [
    {
      category: 'FREE SOURCES',
      name: 'NSE Bhavcopy & Public Endpoints',
      cost: '₹0 / month',
      coverage: 'Nifty 50, Bank Nifty, All Cash Stocks',
      historical: 'EOD from 1994 to present; Intraday not archived',
      realTime: '15m Delayed or End-of-Day (16:30 IST)',
      limits: 'Aggressive Akamai bot blocks, rotating cookies required',
      verdict: 'Good for EOD backtesting & daily scan; fragile for real-time candles',
      statusColor: 'text-amber-400',
    },
    {
      category: 'FREE SOURCES',
      name: 'Yahoo Finance Gateway',
      cost: '₹0 / month',
      coverage: '`^NSEI`, `^NSEBANK`, Cash (.NS)',
      historical: 'Daily/Weekly back to 2000+; 1m/5m limited to past 30-60 days',
      realTime: '15m Delay on Indian Equities',
      limits: '~2,000 req/hour, sporadic missing candles, no formal SLA',
      verdict: 'Excellent initial paper trading & research baseline',
      statusColor: 'text-cyan-400',
    },
    {
      category: 'FREE BROKER APIS',
      name: 'Dhan HQ / Upstox API v2',
      cost: '₹0 (Free with Demat account)',
      coverage: 'Full NSE Cash, Nifty 50, Bank Nifty, F&O',
      historical: '1-minute candles for 1-5 years, daily for 10+ years',
      realTime: 'Real-Time WebSocket Tick-by-Tick (< 50ms latency)',
      limits: 'Requires active broker account login token (refreshed daily)',
      verdict: '⭐ BEST VALUE: Real-time authorized live data with ₹0 recurring fee',
      statusColor: 'text-emerald-400',
    },
    {
      category: 'PAID BROKER APIS',
      name: 'Zerodha Kite Connect',
      cost: '₹2,000 / mo (Base) + ₹2,000 / mo (Historical) = ₹4,000 / mo',
      coverage: 'All NSE Cash, Indices, F&O',
      historical: 'Minute candles since 2015, daily since 2008',
      realTime: 'Real-Time WebSocket (1-3 updates/sec/instrument)',
      limits: '3 requests/sec REST rate limit; subscription auto-renews',
      verdict: 'Industry standard documentation, but expensive for paper trading',
      statusColor: 'text-purple-400',
    },
    {
      category: 'PAID AUTHORIZED VENDORS',
      name: 'TrueData (NSE Authorized Vendor)',
      cost: '₹1,800 to ₹3,200 / month',
      coverage: 'Complete NSE Equities, Indices, F&O',
      historical: 'Clean tick-by-tick and 1-min data since 2012',
      realTime: 'Dedicated low-latency WebSocket feed (< 20ms)',
      limits: 'Fixed concurrent connection limit; requires user approval',
      verdict: 'Top institutional-grade accuracy; recommend only after strategy profitability',
      statusColor: 'text-blue-400',
    },
  ];

  const ramBudget = [
    { component: 'Tauri v2 Desktop Shell + WebKit/WebView2', usage: '70 - 110 MB', note: 'Minimal memory footprint compared to Electron (~500MB)' },
    { component: 'React UI + Candlestick Canvas Rendering', usage: '120 - 180 MB', note: 'Hardware-accelerated charting for 150 instruments' },
    { component: 'Deterministic Strategy Engine (Rust/Node)', usage: '80 - 150 MB', note: 'Processes 15m/5m triggers with < 2ms latency' },
    { component: 'Dual Database: SQLite (ACID) + DuckDB (OHLCV)', usage: '200 - 350 MB', note: 'Columnar memory-mapped caching of historical candles' },
    { component: 'Local Text & Strategy Embeddings (Optional)', usage: '150 - 250 MB', note: 'Fast local semantic search over past trade lessons' },
    { component: 'Total TradeMitra AI Footprint', usage: '~650 - 1,050 MB (~1 GB)', note: 'Leaves 15.0 GB RAM completely free for OS and apps' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-mono">
              Technical Architecture & Data-Source Feasibility Report
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              SRS MILESTONE 2
            </span>
          </div>
          <p className="text-slate-400 mt-1 max-w-2xl font-sans">
            Provider comparison, 16GB RAM hardware optimization, dual-database design, and user-controlled paid feed transition strategy.
          </p>
        </div>

        <button
          onClick={onOpenPaidDataModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-md transition"
        >
          <DollarSign className="w-4 h-4" />
          <span>Paid Feed Policy & Approval</span>
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSubTab('PROVIDERS')}
          className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'PROVIDERS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Market Data Providers (Free vs Paid)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ARCHITECTURE')}
          className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'ARCHITECTURE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Technical Architecture & DB Design</span>
        </button>
        <button
          onClick={() => setActiveSubTab('RAM_BUDGET')}
          className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'RAM_BUDGET' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>16GB RAM & Hardware Budget</span>
        </button>
        <button
          onClick={() => setActiveSubTab('APPROVAL_STRATEGY')}
          className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'APPROVAL_STRATEGY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>User Approval & Selection Strategy</span>
        </button>
      </div>

      {/* SUB-TAB 1: PROVIDERS COMPARISON TABLE */}
      {activeSubTab === 'PROVIDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              Indian Market Data Feasibility Matrix (Nifty 50, Bank Nifty & Cash Stocks)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Policy: Free data priority · Paid requires Aakash's approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Monthly Cost</th>
                  <th className="py-2.5 px-3">Coverage</th>
                  <th className="py-2.5 px-3">Real-Time Delay / Accuracy</th>
                  <th className="py-2.5 px-3">Historical Depth</th>
                  <th className="py-2.5 px-3">Architecture Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {providerComparison.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{p.name}</div>
                      <span className={`text-[10px] font-semibold ${p.statusColor}`}>{p.category}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{p.cost}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">{p.coverage}</td>
                    <td className="py-3 px-3 text-[11px] text-amber-300">{p.realTime}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">{p.historical}</td>
                    <td className="py-3 px-3 text-[11px] font-sans text-slate-300 max-w-xs">{p.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
            <strong className="text-emerald-400 block font-mono">Recommended Path for Aakash:</strong>
            <p className="font-sans leading-relaxed text-[11px]">
              Start with the current <strong>Free 15m delayed gateway</strong> for testing strategy rules and journal tracking. When live low-latency confirmation is required, connect to your existing <strong>Dhan HQ or Upstox API</strong> for <strong>₹0 cost</strong> real-time authorized WebSocket ticks, completely bypassing expensive ₹4,000/month vendor fees!
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TECHNICAL ARCHITECTURE & DUAL DATABASE */}
      {activeSubTab === 'ARCHITECTURE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Recommended Desktop Stack: Tauri v2 + React</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                <strong className="text-white font-mono">Desktop Framework: Tauri v2 (Rust Backend + React/TypeScript)</strong>
                <br />
                Unlike Electron which spawns an entire heavy Chromium browser instance per process consuming 400MB-800MB RAM, Tauri uses the native OS webview (WebView2 on Windows, WebKit on Linux/macOS) with a lightweight Rust core. It consumes only <strong>~70MB RAM</strong>, leaving full CPU and RAM headroom for your trading calculations.
              </p>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-emerald-400 font-bold">Key Architectural Advantages:</div>
                <div className="text-slate-300">• Ultra-fast startup time (&lt; 400ms)</div>
                <div className="text-slate-300">• Native OS notifications for setup alerts without browser tab open</div>
                <div className="text-slate-300">• Background execution while laptop is awake and plugged in</div>
                <div className="text-slate-300">• Memory safety with Rust-based data parsing & tick buffers</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Dual-Database Architecture (SQLite + DuckDB)</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans leading-relaxed">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-cyan-300 font-mono block">1. SQLite with SQLCipher (ACID Transactional Store)</strong>
                <p className="text-[11px] text-slate-400">
                  Stores Strategy Rules, Version History, Paper Positions, Journal Entries, Emotional Tags, and Risk Audit Logs. Encrypted at rest, zero-config single file (`trademitra.db`), and instantaneous transactional integrity.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-purple-300 font-mono block">2. DuckDB / Columnar Parquet (Analytical OHLCV Store)</strong>
                <p className="text-[11px] text-slate-400">
                  Stores multi-year 1m/5m/15m OHLCV historical candle series. Columnar storage compresses candle data by 85% and calculates indicators (RSI, EMA, ATR) across 1 million rows in <strong>under 15 milliseconds</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 16GB RAM BUDGET & HARDWARE CONSIDERATIONS */}
      {activeSubTab === 'RAM_BUDGET' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Laptop Hardware Profiling (16 GB RAM, 512 GB SSD, AMD Ryzen 5)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                SRS Constraint: System must not trigger laptop freeze or memory thrashing during all-day market monitoring.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Total Budget: ~1.0 GB RAM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ramBudget.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">{item.component}</span>
                  <span className="text-cyan-400 font-bold">{item.usage}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{item.note}</p>
              </div>
            ))}
          </div>

          {/* AI Model Deployment: Local vs API Decision */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-amber-300 font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Model Strategy: Why Hybrid Cloud API Wins on 16GB RAM</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-sans text-[11px] leading-relaxed pt-1">
              <div className="bg-rose-950/20 p-2.5 rounded border border-rose-900/30 space-y-1">
                <strong className="text-rose-400 block font-mono">Full Local LLM (e.g. Llama-3-8B 4-bit)</strong>
                <p>
                  Requires 5.5 to 6.5 GB RAM constantly allocated. On an AMD Ryzen 5 without a dedicated 8GB+ GPU, running local inference causes 100% CPU spikes, cooling fan noise, and thermal throttling, which can drop live websocket ticks.
                </p>
              </div>
              <div className="bg-emerald-950/20 p-2.5 rounded border border-emerald-900/30 space-y-1">
                <strong className="text-emerald-400 block font-mono">Recommended: Hybrid Architecture</strong>
                <p>
                  1. Local Rules Engine (0.1GB RAM) handles instant deterministic calculations (S/R, 20 EMA, SL checks, position sizing).
                  <br />
                  2. Gemini 3.1 Pro (High Thinking) via secure server API handles complex strategic reasoning, invalidation critique, and journal audits with zero local RAM footprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STEP-BY-STEP SELECTION & APPROVAL WORKFLOW */}
      {activeSubTab === 'APPROVAL_STRATEGY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Data Integration & User Approval Strategy</span>
            </h3>
            <span className="text-[11px] text-amber-300 font-mono">
              Immutable Guardrail: No silent paid billing
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white text-sm">Phase 1: Free Feed Baseline (Active Now)</strong>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                  Use Yahoo Finance + NSE EOD Bhavcopy with simulated tick generation for strategy refinement, paper trading, and journal habits. Zero financial risk.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white text-sm">Phase 2: Free Broker WebSocket Upgrade (Zero Recurring Cost)</strong>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                  If real-time tick accuracy is needed, plug in your free Dhan HQ or Upstox API credentials. Provides authorized 1-second ticks without paying monthly vendor fees.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white text-sm">Phase 3: Commercial Vendor Proposal & Explicit Approval Modal</strong>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                  If you decide to evaluate TrueData or Zerodha Kite Connect, the bot shows the exact monthly cost and terms in the <em>Paid Feed Approval Modal</em>. The app will never initiate an API purchase or contract without your two-step confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
