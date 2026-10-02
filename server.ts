import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini Client with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initial Indian Watchlist symbols
const INITIAL_INSTRUMENTS = [
  {
    symbol: 'NIFTY 50',
    type: 'INDEX',
    exchange: 'NSE',
    basePrice: 24850.5,
    tickSize: 0.05,
    lotSize: 50,
    sector: 'Broad Market',
    trend: 'Bullish Consolidation',
  },
  {
    symbol: 'BANKNIFTY',
    type: 'INDEX',
    exchange: 'NSE',
    basePrice: 52420.0,
    tickSize: 0.05,
    lotSize: 15,
    sector: 'Banking',
    trend: 'Rangebound / S&R Test',
  },
  {
    symbol: 'RELIANCE',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 2940.2,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'Energy & Tech',
    trend: 'Bullish Pullback to VWAP',
  },
  {
    symbol: 'HDFCBANK',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 1682.4,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'Private Banking',
    trend: 'Breakout above Resistance',
  },
  {
    symbol: 'TCS',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 4210.0,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'IT Services',
    trend: 'Consolidating near 50 EMA',
  },
  {
    symbol: 'INFY',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 1895.75,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'IT Services',
    trend: 'Pin Bar Rejection at Support',
  },
  {
    symbol: 'TATAMOTORS',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 980.5,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'Automobile',
    trend: 'Higher High Higher Low swing',
  },
  {
    symbol: 'ICICIBANK',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 1245.3,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'Private Banking',
    trend: 'Strong Momentum / VWAP Hold',
  },
  {
    symbol: 'SBIN',
    type: 'EQUITY',
    exchange: 'NSE',
    basePrice: 812.6,
    tickSize: 0.05,
    lotSize: 1,
    sector: 'PSU Bank',
    trend: 'Mean Reversion Setup',
  },
];

// Helper to generate realistic candles
function generateCandles(basePrice: number, count = 35) {
  const candles = [];
  let current = basePrice * 0.985;
  const now = Date.now();
  const intervalMs = 15 * 60 * 1000; // 15m intervals

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * intervalMs).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const delta = (Math.random() - 0.48) * (basePrice * 0.004);
    const open = Number(current.toFixed(2));
    const close = Number((open + delta).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * (basePrice * 0.003)).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * (basePrice * 0.003)).toFixed(2));
    const volume = Math.floor(25000 + Math.random() * 85000);
    const vwap = Number(((high + low + close) / 3).toFixed(2));

    candles.push({ time, open, high, low, close, volume, vwap });
    current = close;
  }
  return candles;
}

// Market Status check (Indian Market Hours: 09:15 to 15:30 IST, Mon-Fri)
function getMarketSessionInfo() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 3600000 * 5.5);
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && timeInMinutes >= 9 * 60 + 15 && timeInMinutes <= 15 * 60 + 30;

  return {
    isOpen,
    istTimeString: istTime.toLocaleTimeString('en-IN', { hour12: true }),
    istDateString: istTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    statusText: isOpen ? 'Live Market (09:15 - 15:30 IST)' : 'Market Closed (Research & Off-Hours Mode)',
    feedDelay: 'Free Feed · 15m Delay / Sim Mode',
    source: 'NSE Bhavcopy & Free Financial Gateway',
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TradeMitra AI',
    version: '1.0.0',
    srsVersion: 'SRS v1.0 baseline (2 Oct 2026)',
    user: 'Aakash',
    mode: 'Paper Trading & Strategy Research',
    geminiConfigured: !!apiKey,
    marketSession: getMarketSessionInfo(),
  });
});

app.get('/api/market/overview', (req, res) => {
  const session = getMarketSessionInfo();
  const instruments = INITIAL_INSTRUMENTS.map((inst) => {
    const candles = generateCandles(inst.basePrice, 30);
    const latestCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    const change = Number((latestCandle.close - firstCandle.open).toFixed(2));
    const changePct = Number(((change / firstCandle.open) * 100).toFixed(2));
    const rsi = Number((42 + Math.random() * 26).toFixed(1));
    const ema20 = Number((latestCandle.close * (1 + (Math.random() - 0.5) * 0.004)).toFixed(2));
    const ema50 = Number((latestCandle.close * (1 + (Math.random() - 0.5) * 0.008)).toFixed(2));

    return {
      ...inst,
      ltp: latestCandle.close,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      change,
      changePct,
      volume: candles.reduce((acc, c) => acc + c.volume, 0),
      rsi,
      ema20,
      ema50,
      candles,
      supportZone: Number((latestCandle.close * 0.985).toFixed(2)),
      resistanceZone: Number((latestCandle.close * 1.015).toFixed(2)),
    };
  });

  res.json({
    session,
    instruments,
    timestamp: new Date().toISOString(),
  });
});

// Gemini AI High-Thinking Endpoint for Deep Setup Analysis & Invalidation Review
app.post('/api/ai/deep-analysis', async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
  }

  const {
    instrument,
    setupName,
    timeframe,
    direction,
    entryZone,
    stopLoss,
    target1,
    target2,
    riskReward,
    userQuery,
    language = 'Hinglish',
    contextCandles,
  } = req.body;

  const prompt = `
Aakash's Personal AI Trading Assistant.
You must perform an exhaustive, high-reasoning, disciplined setup validation for Indian markets.

Instrument: ${instrument}
Setup: ${setupName}
Timeframe: ${timeframe}
Direction: ${direction}
Entry Zone: ${entryZone}
Stop Loss: ${stopLoss}
Target 1: ${target1}
Target 2: ${target2}
Risk/Reward Ratio: ${riskReward}
Context / Recent Price Action: ${JSON.stringify(contextCandles || 'Intraday 15m pullback to VWAP with RSI rebound')}
User Query / Dilemma: ${userQuery || 'Is this setup robust or is there high invalidation/trap risk?'}
Preferred Language: ${language} (Default Hinglish with natural Indian trader vocabulary like "Bhai", "SL placement", "Trap zone", "Discipline", "Breakout failure").

SRS Rules to follow strictly:
1. NO guaranteed profits: Frame setups as probabilistic hypotheses.
2. Invalidation clarity: Define the exact price action or candle close that makes this setup void.
3. Realistic Probability: Provide calibrated win probability range with explicit sample size caveat ("Low confidence / small sample size warning" if unvalidated).
4. Risk check against Hard Limits: Ensure risk/reward is at least 1:1.5 to 1:2.
5. Psychological check: Warn against FOMO entry, chasing green candles, or moving SL away.

Please break your response into:
1. "Tathya & Context" (Price action & Market Structure analysis)
2. "Invalidation Level" (Kab yeh setup bekaar / void ho jayega)
3. "Probability Assessment" (Statistical expectancy with confidence bounds)
4. "Risk & Capital Preservation Advice" (Hard limits, position sizing guidance)
5. "Final Recommendation for Paper Trading" (Candidate, Needs Confirmation, Confirmed, or Blocked)
`;

  try {
    // Calling gemini-3.1-pro-preview with thinkingLevel HIGH as instructed
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction:
          'You are TradeMitra AI, an uncompromising, risk-first Indian Stock Market quantitative assistant for Aakash. You speak fluently in Hinglish. You never invent fake 90%+ win rates. You prioritize capital protection over trade volume.',
      },
    });

    res.json({
      model: 'gemini-3.1-pro-preview',
      thinkingLevel: 'HIGH',
      analysis: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini 3.1 Pro preview failed, attempting fallback to gemini-3.8-flash:', error?.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are TradeMitra AI, an uncompromising, risk-first Indian Stock Market quantitative assistant for Aakash in Hinglish.',
        },
      });

      res.json({
        model: 'gemini-3.8-flash',
        thinkingLevel: 'STANDARD_FALLBACK',
        analysis: fallbackResponse.text,
        timestamp: new Date().toISOString(),
      });
    } catch (fallbackError: any) {
      res.status(500).json({
        error: fallbackError?.message || 'Failed to generate AI analysis.',
      });
    }
  }
});

// Gemini AI Strategy Research & Rule Formalization
app.post('/api/ai/strategy-research', async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
  }

  const { strategyDescription, existingRules } = req.body;

  const prompt = `
Aakash wants to refine or create a trading strategy for Indian Cash Stocks / Nifty / Bank Nifty.
User Input: "${strategyDescription}"
Existing Strategy baseline: "${JSON.stringify(existingRules || {})}"

Convert this into formal, disciplined strategy rules conforming to FR-03 and FR-10 of the SRS:
- Name of Strategy
- Instruments & Timeframes
- Exact Entry Criteria (Indicator triggers, candlestick confirmation)
- Stop-Loss derivation formula (e.g., Swing Low - 1 ATR)
- Target 1 & Target 2 formulas (Minimum 1:2 R:R)
- Invalidation / No-Trade conditions (e.g. Major RBI policy day, 5 mins before market close, choppy ADX < 20)
- Position Sizing rule
- Backtesting / Walk-forward validation requirements (Sample size > 30 trades, fee & slippage deductions)
- Explain risks of overfitting.

Respond in structured JSON format with keys:
{
  "strategyName": string,
  "version": string,
  "instruments": string[],
  "timeframes": string[],
  "entryRules": string[],
  "exitRules": string[],
  "stopLossRule": string,
  "targetRules": string[],
  "invalidationConditions": string[],
  "noTradeConditions": string[],
  "sampleSizeRequired": number,
  "overfittingRisk": string,
  "hinglishSummary": string
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      strategy: parsed,
      model: 'gemini-3.1-pro-preview',
    });
  } catch (error: any) {
    console.warn('Gemini 3.1 Pro strategy research fallback:', error?.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(fallbackResponse.text || '{}');
      res.json({
        success: true,
        strategy: parsed,
        model: 'gemini-3.8-flash',
      });
    } catch (fallbackError: any) {
      res.status(500).json({ error: fallbackError?.message });
    }
  }
});

// Gemini AI Mistake & Journal Audit (FR-09)
app.post('/api/ai/audit-journal', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const { journalEntries, approvedRiskLimits } = req.body;

  const prompt = `
Act as TradeMitra AI's Discipline Auditor. Review Aakash's recent paper trades and emotional journal entries:
Entries: ${JSON.stringify(journalEntries)}
Approved Hard Risk Limits: ${JSON.stringify(approvedRiskLimits)}

Analyze strictly per SRS FR-09:
1. Identify repeated mistakes (Early exits, moving stop loss, revenge trading, sizing too large).
2. Distinguish between an Execution Error (disciplined rule broken) vs Normal Strategy Expectancy (good trade, but hit SL).
3. Psychological observations based on logged emotions (FOMO, Greed, Fear, Frustration).
4. Clear actionable corrective actions in Hinglish.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      audit: response.text,
      model: 'gemini-3.1-pro-preview',
    });
  } catch (error: any) {
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      res.json({
        audit: fallbackResponse.text,
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  }
});

// Setup dev server with Vite middlewares or static files for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradeMitra AI Desktop server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
