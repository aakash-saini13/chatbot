import { Candle } from '../types/trading';

/**
 * True Mathematical Exponential Moving Average (EMA)
 * Formula: EMA_t = Price_t * k + EMA_{t-1} * (1 - k)
 * where k = 2 / (period + 1)
 */
export function calculateEMA(candles: Candle[], period: number): number[] {
  if (candles.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = [];

  // Seed with Simple Moving Average of first 'period' candles
  const initialSlice = candles.slice(0, Math.min(period, candles.length));
  let currentEMA = initialSlice.reduce((sum, c) => sum + c.close, 0) / initialSlice.length;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      emaValues.push(Number(currentEMA.toFixed(2)));
    } else {
      currentEMA = candles[i].close * k + currentEMA * (1 - k);
      emaValues.push(Number(currentEMA.toFixed(2)));
    }
  }

  return emaValues;
}

/**
 * True Mathematical Volume-Weighted Average Price (VWAP)
 * Formula: Cumulative(Typical Price * Volume) / Cumulative(Volume)
 * where Typical Price = (High + Low + Close) / 3
 */
export function calculateVWAP(candles: Candle[]): number[] {
  if (candles.length === 0) return [];
  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;
  const vwapValues: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume > 0 ? c.volume : 1000;

    cumulativeTypicalVolume += typicalPrice * vol;
    cumulativeVolume += vol;

    const vwap = cumulativeVolume > 0 ? cumulativeTypicalVolume / cumulativeVolume : typicalPrice;
    vwapValues.push(Number(vwap.toFixed(2)));
  }

  return vwapValues;
}

/**
 * True Relative Strength Index (RSI 14) with Wilder's Smoothing
 */
export function calculateRSI(candles: Candle[], period = 14): number[] {
  if (candles.length < 2) return [50];
  const rsiValues: number[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= Math.min(period, candles.length - 1); i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      rsiValues.push(50.0);
    } else {
      const diff = candles[i].close - candles[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        rsiValues.push(100.0);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);
        rsiValues.push(Number(rsi.toFixed(1)));
      }
    }
  }

  return rsiValues;
}

/**
 * Pivot Point Highs and Lows for Support and Resistance
 */
export function calculateSupportResistanceLevels(candles: Candle[]): { support: number; resistance: number } {
  if (candles.length === 0) return { support: 0, resistance: 0 };
  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);

  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);
  const recentSlice = candles.slice(-15);

  const recentLow = Math.min(...recentSlice.map((c) => c.low));
  const recentHigh = Math.max(...recentSlice.map((c) => c.high));

  return {
    support: Number(((minLow + recentLow) / 2).toFixed(2)),
    resistance: Number(((maxHigh + recentHigh) / 2).toFixed(2)),
  };
}
