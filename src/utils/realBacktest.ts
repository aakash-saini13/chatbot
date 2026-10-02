import { Candle } from '../types/trading';
import { calculateEMA, calculateVWAP } from './technicalIndicators';

export interface BacktestTradeResult {
  tradeIndex: number;
  entryTime: string;
  exitTime: string;
  direction: 'LONG';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  quantity: number;
  pnlRupees: number;
  rMultiple: number;
  exitReason: 'T1_FULL' | 'T1_PARTIAL_T2' | 'T1_PARTIAL_COST' | 'STOP_LOSS';
  isOutOfSample: boolean;
}

export interface RealBacktestReport {
  totalTrades: number;
  inSampleTrades: number;
  outOfSampleTrades: number;
  inSampleWinRate: number;
  outOfSampleWinRate: number;
  overallWinRate: number;
  expectancyR: number;
  profitFactor: number;
  maxDrawdownPct: number;
  netPnLRupees: number;
  trades: BacktestTradeResult[];
  overfittingDiagnostic: string;
}

/**
 * Empirical Backtesting Engine (Runs deterministic rules over real historical candle series)
 * Evaluates EMA 20/50 Pullback + VWAP setup with realistic slippage & STT fees.
 */
export function runEmpiricalBacktest(
  candles: Candle[],
  slippagePct = 0.05,
  inSampleSplitPct = 70,
  capitalPerTrade = 100000
): RealBacktestReport {
  if (candles.length < 30) {
    return {
      totalTrades: 0,
      inSampleTrades: 0,
      outOfSampleTrades: 0,
      inSampleWinRate: 0,
      outOfSampleWinRate: 0,
      overallWinRate: 0,
      expectancyR: 0,
      profitFactor: 0,
      maxDrawdownPct: 0,
      netPnLRupees: 0,
      trades: [],
      overfittingDiagnostic: 'Insufficient candle data for empirical testing (Need at least 30 candles).',
    };
  }

  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const vwap = calculateVWAP(candles);

  const splitIndex = Math.floor((candles.length * inSampleSplitPct) / 100);
  const trades: BacktestTradeResult[] = [];

  let inPosition = false;
  let currentTrade: any = null;

  for (let i = 21; i < candles.length - 2; i++) {
    const c = candles[i];
    const prev = candles[i - 1];

    if (!inPosition) {
      // Strategy Rule 1: Price in uptrend above 50 EMA
      const isUptrend = c.close > ema50[i];

      // Strategy Rule 2: Pullback into 20 EMA / VWAP zone
      const touchedPullback = c.low <= ema20[i] * 1.002 || c.low <= vwap[i] * 1.002;

      // Strategy Rule 3: Bullish bounce bar (Close > Open and Close > 20 EMA)
      const isBullishReversal = c.close > c.open && c.close >= ema20[i];

      if (isUptrend && touchedPullback && isBullishReversal) {
        // Find recent swing low of previous 3 bars
        const swingLow = Math.min(candles[i - 2].low, candles[i - 1].low, c.low);
        const slDistance = c.close - swingLow;

        // Valid setup with sensible risk distance (> 0.2%)
        if (slDistance > c.close * 0.002 && slDistance < c.close * 0.03) {
          const entryWithSlippage = c.close * (1 + slippagePct / 100);
          const stopLoss = Number(swingLow.toFixed(2));
          const perShareRisk = entryWithSlippage - stopLoss;

          // Target 1: 1:2 R:R, Target 2: 1:3.5 R:R
          const target1 = Number((entryWithSlippage + 2 * perShareRisk).toFixed(2));
          const target2 = Number((entryWithSlippage + 3.5 * perShareRisk).toFixed(2));

          const maxRiskRupees = 2000; // Approved hard limit
          const quantity = Math.max(1, Math.floor(maxRiskRupees / perShareRisk));

          inPosition = true;
          currentTrade = {
            tradeIndex: trades.length + 1,
            entryIndex: i,
            entryTime: c.time,
            direction: 'LONG' as const,
            entryPrice: Number(entryWithSlippage.toFixed(2)),
            stopLoss,
            target1,
            target2,
            quantity,
            perShareRisk,
            hitT1: false,
            isOutOfSample: i >= splitIndex,
          };
        }
      }
    } else if (currentTrade) {
      // Evaluate trade forward in time
      const high = c.high;
      const low = c.low;

      // Check Stop Loss First (Intrabar worst-case assumption)
      if (low <= currentTrade.stopLoss) {
        const exitPrice = currentTrade.stopLoss * (1 - slippagePct / 100);
        const pnl = (exitPrice - currentTrade.entryPrice) * currentTrade.quantity;
        const fees = (currentTrade.entryPrice + exitPrice) * currentTrade.quantity * 0.0006;
        const netPnL = Number((pnl - fees).toFixed(2));
        const rMultiple = Number((netPnL / (currentTrade.perShareRisk * currentTrade.quantity)).toFixed(2));

        trades.push({
          tradeIndex: currentTrade.tradeIndex,
          entryTime: currentTrade.entryTime,
          exitTime: c.time,
          direction: 'LONG',
          entryPrice: currentTrade.entryPrice,
          exitPrice: Number(exitPrice.toFixed(2)),
          stopLoss: currentTrade.stopLoss,
          target1: currentTrade.target1,
          target2: currentTrade.target2,
          quantity: currentTrade.quantity,
          pnlRupees: netPnL,
          rMultiple,
          exitReason: currentTrade.hitT1 ? 'T1_PARTIAL_COST' : 'STOP_LOSS',
          isOutOfSample: currentTrade.isOutOfSample,
        });

        inPosition = false;
        currentTrade = null;
      } else if (!currentTrade.hitT1 && high >= currentTrade.target1) {
        // T1 Hit! Strategy rules state: Book 50% lot and trail SL to cost (breakeven)
        currentTrade.hitT1 = true;
        currentTrade.stopLoss = currentTrade.entryPrice; // Trail to breakeven!
      } else if (currentTrade.hitT1 && high >= currentTrade.target2) {
        // T2 Hit for remaining 50%!
        const exitPrice = currentTrade.target2 * (1 - slippagePct / 100);
        const t1Price = currentTrade.target1;
        // 50% exited at T1, 50% at T2
        const halfQty = Math.floor(currentTrade.quantity / 2) || 1;
        const pnlHalf1 = (t1Price - currentTrade.entryPrice) * halfQty;
        const pnlHalf2 = (exitPrice - currentTrade.entryPrice) * (currentTrade.quantity - halfQty);
        const totalGross = pnlHalf1 + pnlHalf2;
        const fees = (currentTrade.entryPrice + exitPrice) * currentTrade.quantity * 0.0006;
        const netPnL = Number((totalGross - fees).toFixed(2));
        const rMultiple = Number((netPnL / (currentTrade.perShareRisk * currentTrade.quantity)).toFixed(2));

        trades.push({
          tradeIndex: currentTrade.tradeIndex,
          entryTime: currentTrade.entryTime,
          exitTime: c.time,
          direction: 'LONG',
          entryPrice: currentTrade.entryPrice,
          exitPrice: Number(exitPrice.toFixed(2)),
          stopLoss: currentTrade.stopLoss,
          target1: currentTrade.target1,
          target2: currentTrade.target2,
          quantity: currentTrade.quantity,
          pnlRupees: netPnL,
          rMultiple,
          exitReason: 'T1_PARTIAL_T2',
          isOutOfSample: currentTrade.isOutOfSample,
        });

        inPosition = false;
        currentTrade = null;
      }
    }
  }

  // Calculate empirical metrics from actual trades
  const inSampleTrades = trades.filter((t) => !t.isOutOfSample);
  const outOfSampleTrades = trades.filter((t) => t.isOutOfSample);

  const inSampleWins = inSampleTrades.filter((t) => t.pnlRupees > 0).length;
  const outOfSampleWins = outOfSampleTrades.filter((t) => t.pnlRupees > 0).length;
  const totalWins = trades.filter((t) => t.pnlRupees > 0).length;

  const inSampleWinRate = inSampleTrades.length > 0 ? Number(((inSampleWins / inSampleTrades.length) * 100).toFixed(1)) : 0;
  const outOfSampleWinRate =
    outOfSampleTrades.length > 0 ? Number(((outOfSampleWins / outOfSampleTrades.length) * 100).toFixed(1)) : 0;
  const overallWinRate = trades.length > 0 ? Number(((totalWins / trades.length) * 100).toFixed(1)) : 0;

  const totalGains = trades.filter((t) => t.pnlRupees > 0).reduce((sum, t) => sum + t.pnlRupees, 0);
  const totalLosses = Math.abs(trades.filter((t) => t.pnlRupees < 0).reduce((sum, t) => sum + t.pnlRupees, 0));
  const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99 : 0;

  const netPnLRupees = Number(trades.reduce((sum, t) => sum + t.pnlRupees, 0).toFixed(2));
  const expectancyR =
    trades.length > 0 ? Number((trades.reduce((sum, t) => sum + t.rMultiple, 0) / trades.length).toFixed(2)) : 0;

  // Max Drawdown calculation
  let peak = 0;
  let running = 0;
  let maxDD = 0;
  trades.forEach((t) => {
    running += t.pnlRupees;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDD) maxDD = dd;
  });
  const maxDrawdownPct = peak > 0 ? Number(((maxDD / peak) * 100).toFixed(1)) : 0;

  // Overfitting Diagnostic
  const winRateDiff = Math.abs(inSampleWinRate - outOfSampleWinRate);
  let overfittingDiagnostic = 'STABLE: Out-of-sample win rate tracks in-sample within normal statistical variance.';
  if (winRateDiff > 15) {
    overfittingDiagnostic = `HIGH OVERFITTING RISK: Significant drop in Out-of-Sample performance (${inSampleWinRate}% vs ${outOfSampleWinRate}%). Strategy is sensitive to test period.`;
  } else if (outOfSampleTrades.length < 10) {
    overfittingDiagnostic = `LOW CONFIDENCE: Out-of-sample sample size (${outOfSampleTrades.length} trades) is too small to rule out variance.`;
  }

  return {
    totalTrades: trades.length,
    inSampleTrades: inSampleTrades.length,
    outOfSampleTrades: outOfSampleTrades.length,
    inSampleWinRate,
    outOfSampleWinRate,
    overallWinRate,
    expectancyR,
    profitFactor,
    maxDrawdownPct,
    netPnLRupees,
    trades,
    overfittingDiagnostic,
  };
}
