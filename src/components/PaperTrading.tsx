import React, { useState } from 'react';
import { PaperPosition, RiskSettings, SetupCard, Instrument } from '../types/trading';
import { calculatePositionSize } from '../utils/mockMarket';
import {
  PlaySquare,
  TrendingUp,
  TrendingDown,
  XCircle,
  PlusCircle,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ArrowRight,
  Calculator,
  Percent,
} from 'lucide-react';

interface PaperTradingProps {
  positions: PaperPosition[];
  onUpdatePositions: (positions: PaperPosition[]) => void;
  riskSettings: RiskSettings;
  instruments: Instrument[];
  dailyRealizedPnL: number;
  onPositionClosed: (closedPosition: PaperPosition) => void;
  language: 'Hinglish' | 'English';
}

export const PaperTrading: React.FC<PaperTradingProps> = ({
  positions,
  onUpdatePositions,
  riskSettings,
  instruments,
  dailyRealizedPnL,
  onPositionClosed,
  language,
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(instruments[0]?.symbol || 'RELIANCE');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(instruments[0]?.ltp || 2940);
  const [stopLoss, setStopLoss] = useState<number>(2920);
  const [target1, setTarget1] = useState<number>(2980);
  const [includeFees, setIncludeFees] = useState(true);

  const isDailyLossBreached = dailyRealizedPnL <= -riskSettings.dailyLossLimitRupees;
  const isMaxPositionsReached =
    positions.filter((p) => p.status === 'OPEN').length >= riskSettings.maxOpenPositions;

  // Auto calculate sizing based on Approved Hard Risk limit
  const sizing = calculatePositionSize(
    riskSettings.accountCapital,
    riskSettings.maxRiskPerTradePct,
    entryPrice,
    stopLoss
  );

  const handleOpenPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDailyLossBreached) {
      alert('Order Blocked! Daily Loss Limit (₹5,000) reached. No further trades allowed per approved risk rules.');
      return;
    }
    if (isMaxPositionsReached) {
      alert(`Order Blocked! Maximum ${riskSettings.maxOpenPositions} open positions already active.`);
      return;
    }

    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      instrument: selectedSymbol,
      direction,
      entryPrice: Number(entryPrice),
      quantity: sizing.quantity,
      stopLoss: Number(stopLoss),
      target1: Number(target1),
      openedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'OPEN',
      currentLtp: Number(entryPrice),
      unrealizedPnL: 0,
      feesAndSlippage: includeFees ? Number((sizing.quantity * entryPrice * 0.0006).toFixed(2)) : 0,
      strategyVersion: 'v1.2-APPROVED',
    };

    onUpdatePositions([newPos, ...positions]);
    setShowOrderModal(false);
  };

  const handleClosePosition = (
    pos: PaperPosition,
    exitReason: 'TARGET' | 'STOP_LOSS' | 'MANUAL' | 'INVALIDATED'
  ) => {
    let exitPrice = pos.currentLtp;
    if (exitReason === 'TARGET') exitPrice = pos.target1;
    if (exitReason === 'STOP_LOSS') exitPrice = pos.stopLoss;

    const priceDiff =
      pos.direction === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const grossPnL = priceDiff * pos.quantity;
    const netPnL = Number((grossPnL - pos.feesAndSlippage).toFixed(2));
    const riskAmount = Math.abs(pos.entryPrice - pos.stopLoss) * pos.quantity || 1;
    const rMultiple = Number((netPnL / riskAmount).toFixed(2));

    const closed: PaperPosition = {
      ...pos,
      status: 'CLOSED',
      exitPrice,
      closedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      realizedPnL: netPnL,
      exitReason,
      rMultiple,
    };

    const remaining = positions.filter((p) => p.id !== pos.id);
    onUpdatePositions(remaining);
    onPositionClosed(closed);
  };

  const openPositions = positions.filter((p) => p.status === 'OPEN');
  const totalUnrealizedPnL = openPositions.reduce((acc, p) => acc + p.unrealizedPnL, 0);

  return (
    <div className="space-y-4">
      {/* Top Paper Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[11px]">Paper Trading Capital:</span>
          <span className="text-base font-bold text-white">
            ₹{riskSettings.accountCapital.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">Virtual Wallet</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Unrealized P&L:</span>
          <span
            className={`text-base font-bold ${
              totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalUnrealizedPnL >= 0 ? `+₹${totalUnrealizedPnL.toFixed(2)}` : `-₹${Math.abs(totalUnrealizedPnL).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-slate-500 block">{openPositions.length} Open Positions</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Today's Realized P&L:</span>
          <span
            className={`text-base font-bold ${
              dailyRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {dailyRealizedPnL >= 0 ? `+₹${dailyRealizedPnL.toFixed(2)}` : `-₹${Math.abs(dailyRealizedPnL).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-slate-500 block">Limit: -₹{riskSettings.dailyLossLimitRupees}</span>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowOrderModal(true)}
            disabled={isDailyLossBreached || isMaxPositionsReached}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place Paper Order</span>
          </button>
        </div>
      </div>

      {/* Daily Loss Cutoff Alert */}
      {isDailyLossBreached && (
        <div className="p-3 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <div>
              <strong className="block text-rose-300 font-bold">Hard Limit Guardrail Triggered!</strong>
              <span>
                Daily Loss Limit (-₹{riskSettings.dailyLossLimitRupees.toLocaleString('en-IN')}) reached. Naye trades blocked hain.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-rose-900/60 px-2.5 py-1 rounded border border-rose-600">
            FR-12 Immutable Lock
          </span>
        </div>
      )}

      {/* Open Positions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-emerald-400" />
            <span>Open Paper Trading Positions ({openPositions.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Slippage & STT simulation: Active
          </span>
        </div>

        {openPositions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active open paper positions. Select a setup card or click "Place Paper Order" to test.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Entry</th>
                  <th className="py-2.5 px-3">LTP</th>
                  <th className="py-2.5 px-3">Stop Loss</th>
                  <th className="py-2.5 px-3">Target 1</th>
                  <th className="py-2.5 px-3">Unrealized P&L</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {openPositions.map((pos) => {
                  const isLong = pos.direction === 'LONG';
                  const isProfitable = pos.unrealizedPnL >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                        <span>{pos.instrument}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                          {pos.strategyVersion}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {pos.direction}
                        </span>
                      </td>
                      <td className="py-3 px-3">{pos.quantity}</td>
                      <td className="py-3 px-3 font-medium">₹{pos.entryPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-white">₹{pos.currentLtp.toFixed(2)}</td>
                      <td className="py-3 px-3 text-rose-400">₹{pos.stopLoss.toFixed(2)}</td>
                      <td className="py-3 px-3 text-emerald-400">₹{pos.target1.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            isProfitable ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfitable ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {/* Simulation Quick triggers */}
                        <button
                          onClick={() => handleClosePosition(pos, 'TARGET')}
                          className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] rounded"
                          title="Simulate Target Hit"
                        >
                          Hit T1
                        </button>
                        <button
                          onClick={() => handleClosePosition(pos, 'STOP_LOSS')}
                          className="px-2 py-1 bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] rounded"
                          title="Simulate SL Hit"
                        >
                          Hit SL
                        </button>
                        <button
                          onClick={() => handleClosePosition(pos, 'MANUAL')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded"
                        >
                          Market Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Place Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-emerald-400" />
                <span>Place Paper Trade Order (SRS FR-07)</span>
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenPosition} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Instrument</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => {
                      const sym = e.target.value;
                      setSelectedSymbol(sym);
                      const inst = instruments.find((i) => i.symbol === sym);
                      if (inst) {
                        setEntryPrice(inst.ltp);
                        setStopLoss(Number((inst.ltp * 0.99).toFixed(1)));
                        setTarget1(Number((inst.ltp * 1.02).toFixed(1)));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {instruments.map((i) => (
                      <option key={i.symbol} value={i.symbol}>
                        {i.symbol} (₹{i.ltp})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDirection('LONG')}
                      className={`p-2 rounded-lg font-bold ${
                        direction === 'LONG'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('SHORT')}
                      className={`p-2 rounded-lg font-bold ${
                        direction === 'SHORT'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target 1 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={target1}
                    onChange={(e) => setTarget1(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Position Sizing Calculator Breakdown */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Approved Risk per Trade (1%):</span>
                  <span className="text-white font-bold">₹{riskSettings.maxRiskPerTradeRupees}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Per-share SL Distance:</span>
                  <span className="text-rose-400 font-bold">₹{Math.abs(entryPrice - stopLoss).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                  <span>Calculated Safe Quantity:</span>
                  <span className="text-sm">{sizing.quantity} Shares / Contracts</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Capital Required:</span>
                  <span>₹{sizing.capitalRequired.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Slippage & Fees Toggle */}
              <label className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFees}
                  onChange={(e) => setIncludeFees(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Include realistic Indian market fees (STT + Exchange turnover + 0.05% slippage)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition"
                >
                  Submit Paper Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
