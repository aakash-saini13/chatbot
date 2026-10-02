import { Instrument, SetupCard, StrategyRule, PaperPosition, JournalEntry, RiskSettings, Candle } from '../types/trading';
import { calculateRobustPositionSize } from './riskEngine';

export const INITIAL_RISK_SETTINGS: RiskSettings = {
  accountCapital: 200000, // ₹2,00,000 Paper Capital
  maxRiskPerTradePct: 1.0, // 1% per trade
  maxRiskPerTradeRupees: 2000,
  dailyLossLimitRupees: 5000, // ₹5,000 hard stop
  maxOpenPositions: 3,
  minRiskRewardRatio: 2.0, // Minimum 1:2 R:R
  maxDailyDrawdownPct: 2.5,
  gapRiskWarningThresholdPct: 1.2,
  approvedBy: 'Aakash (Approved Hard Limit)',
  approvalTimestamp: '2026-10-02 09:15 IST',
  isLocked: true,
  blockNewTradesOnDailyLoss: true,
};

export const INITIAL_STRATEGIES: StrategyRule[] = [
  {
    id: 'strat-1',
    name: 'EMA 20/50 Pullback + VWAP Confluence',
    version: 'v1.2-APPROVED',
    isApprovedActive: true,
    createdAt: '2026-09-28',
    author: 'Aakash',
    instruments: ['NIFTY 50', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'TCS'],
    timeframes: ['15m', '1D'],
    entryConditions: [
      'Price in strong trend above 50 EMA on 15m candle',
      'Pullback into 20 EMA + VWAP support zone with low volume',
      'Rejection pin bar or bullish engulfing candle confirmation',
      'RSI rebounding out of 40-50 zone without bearish divergence',
    ],
    exitConditions: [
      'Target 1 (1:2 R:R) reached: Book 50% lot and trail SL to cost',
      'Target 2 (1:3.5 R:R) reached: Exit remainder',
      'Close below 50 EMA on 15m bar invalidates immediately',
    ],
    stopLossRule: '1 tick below recent swing low or 1.2x 15m ATR below entry',
    targetRules: ['T1: Entry + 2 * Risk', 'T2: Entry + 3.5 * Risk (Key Resistance)'],
    positionSizingRule: 'Max 1% capital risk (₹2,000) divided by (Entry - SL)',
    indicators: ['EMA 20', 'EMA 50', 'VWAP', 'RSI 14', 'Volume'],
    confirmationConditions: ['Volume expansion on bounce candle', 'Nifty sector index alignment'],
    invalidationConditions: [
      '15m candle closes firmly below 50 EMA before entry trigger',
      'High impact macro news / RBI announcement within 30 minutes',
    ],
    noTradeConditions: [
      'First 15 minutes of open (09:15 - 09:30 IST) due to opening spread',
      'After 15:00 IST for intraday setups',
      'Daily loss limit threshold reached (₹5,000)',
    ],
    backtestSampleCount: 64,
    historicalWinRatePct: 54.7,
    expectancyR: 0.62,
  },
  {
    id: 'strat-2',
    name: 'Daily Range Breakout with Volume Surge',
    version: 'v1.3-EXPERIMENTAL',
    isApprovedActive: false,
    createdAt: '2026-10-01',
    author: 'AI Suggested',
    instruments: ['TATAMOTORS', 'INFY', 'ICICIBANK', 'SBIN'],
    timeframes: ['1D'],
    entryConditions: [
      'Multi-day consolidation range tightest in 10 sessions',
      'Daily candle closes 0.5% above range resistance',
      'Volume at least 1.8x 20-day average volume',
    ],
    exitConditions: [
      'Trailing SL behind prior 2-day low',
      'Target 1: 1.5x range height',
    ],
    stopLossRule: 'Midpoint of consolidation range',
    targetRules: ['T1: Range height extension (1:2.2 R:R)'],
    positionSizingRule: '1% portfolio risk for swing allocation',
    indicators: ['20-day Volume MA', 'Bollinger Band Squeeze', 'Support/Resistance'],
    confirmationConditions: ['Nifty 50 above its 20 EMA'],
    invalidationConditions: ['False breakout: Next candle opens below breakout level'],
    noTradeConditions: ['Earnings announcement within 3 days'],
    backtestSampleCount: 19, // Small sample!
    historicalWinRatePct: 58.0,
    expectancyR: 0.55,
  },
];

export const INITIAL_SETUPS: SetupCard[] = [
  {
    id: 'setup-reliance-01',
    instrument: 'RELIANCE',
    strategyName: 'EMA 20/50 Pullback + VWAP Confluence',
    strategyVersion: 'v1.2-APPROVED',
    timeframe: '15m',
    direction: 'LONG',
    setupStatus: 'Confirmed',
    entryZone: '₹1,165.00 - ₹1,168.00',
    entryPrice: 1167.5,
    stopLoss: 1156.0, // Risk ₹11.5/share
    target1: 1190.5, // 1:2 R:R (+₹23.0)
    target2: 1207.5, // 1:3.5 R:R (+₹40.0)
    invalidation: 'Any 15m candle close below ₹1,154.00 (below swing low and 50 EMA)',
    potentialRiskReward: '1:2.0 (T1) / 1:3.5 (T2)',
    matchedRules: [
      '15m price above 50 EMA (1,155.2)',
      'Clean pullback into 20 EMA (1,166.0) and VWAP (1,165.8)',
      'Bullish pin bar rejection from 1,164 support with 1.4x volume',
      'RSI bouncing upward from 48 level',
    ],
    unmetConditions: [],
    evidence: 'High confluence of VWAP support, rising 20 EMA, and strong order block rejection.',
    reasonsMayFail: [
      'Nifty 50 facing resistance near 22,500 round level',
      'Brent crude volatility could cause short-term pressure',
    ],
    dataSource: 'Free NSE Feed · 15m Delay / Live Sim',
    timestamp: 'Today, 11:15 IST',
    isStale: false,
    sampleSize: 64,
    historicalWinRatePct: 54.7,
    calibratedProbabilityPct: 53.2,
    confidenceWarning: 'Moderate sample size (N=64). Calibrated model factors slippage & Indian market fees.',
    newsRisk: 'Low macro event risk today.',
  },
  {
    id: 'setup-nifty-02',
    instrument: 'NIFTY 50',
    strategyName: 'EMA 20/50 Pullback + VWAP Confluence',
    strategyVersion: 'v1.2-APPROVED',
    timeframe: '15m',
    direction: 'LONG',
    setupStatus: 'Needs confirmation',
    entryZone: '22,400.00 - 22,425.00',
    entryPrice: 22420.0,
    stopLoss: 22360.0, // Risk 60 pts
    target1: 22540.0, // Reward 120 pts (1:2)
    target2: 22630.0,
    invalidation: 'Breakdown below 22,350 with sustained selling volume',
    potentialRiskReward: '1:2.0',
    matchedRules: [
      'Index in primary bullish structure on daily timeframe',
      'Pullback to key previous resistance-turned-support at 22,400',
    ],
    unmetConditions: [
      'Awaiting bullish confirmation candle close above 22,430',
      'Bank Nifty lagging near 54,400 resistance',
    ],
    evidence: 'Approaching high volume node; heavy put writing at 22,400 strike.',
    reasonsMayFail: [
      'Global cues weak (US futures -0.3%)',
      'Heavy call resistance built up at 22,500 round number',
    ],
    dataSource: 'Free NSE Feed · 15m Delay / Live Sim',
    timestamp: 'Today, 10:45 IST',
    isStale: false,
    sampleSize: 64,
    historicalWinRatePct: 54.7,
    calibratedProbabilityPct: 49.5,
    confidenceWarning: 'Setup not yet confirmed. Do not anticipate entry before rule trigger.',
    newsRisk: 'US CPI data expected tonight at 18:00 IST.',
  },
  {
    id: 'setup-icici-03',
    instrument: 'ICICIBANK',
    strategyName: 'Daily Range Breakout with Volume Surge',
    strategyVersion: 'v1.3-EXPERIMENTAL',
    timeframe: '1D',
    direction: 'LONG',
    setupStatus: 'Candidate',
    entryZone: '₹1,308.00 - ₹1,312.00',
    entryPrice: 1310.0,
    stopLoss: 1290.0, // Risk ₹20
    target1: 1350.0, // Reward ₹40 (1:2)
    target2: 1380.0,
    invalidation: 'Daily close back below ₹1,288.00 consolidation floor',
    potentialRiskReward: '1:2.0',
    matchedRules: ['Consolidated for 8 days in 1,290-1,310 range', 'Bank Nifty holding 54,400'],
    unmetConditions: ['Daily candle volume must exceed 1.8x average at 15:30 close'],
    evidence: 'Private banking credit growth strong; loan book quality stable.',
    reasonsMayFail: ['Experimental strategy with small historical sample (N=19)'],
    dataSource: 'Free NSE Feed · 15m Delay / Live Sim',
    timestamp: 'Today, 09:45 IST',
    isStale: false,
    sampleSize: 19,
    historicalWinRatePct: 58.0,
    calibratedProbabilityPct: 51.0,
    confidenceWarning: '⚠️ LOW CONFIDENCE WARNING: Sample size (N=19) is below the 30-trade validation threshold. High variance expected.',
    newsRisk: 'Quarterly results in 12 days.',
  },
];

export const INITIAL_PAPER_POSITIONS: PaperPosition[] = [
  {
    id: 'pos-1',
    instrument: 'RELIANCE',
    direction: 'LONG',
    entryPrice: 1167.5,
    quantity: 100, // ₹1,16,750 position, risk = ₹11.5 * 100 = ₹1,150 (within ₹2,000 max risk)
    stopLoss: 1156.0,
    target1: 1190.5,
    target2: 1207.5,
    openedAt: '2026-10-02 09:45 IST',
    status: 'OPEN',
    currentLtp: 1168.25,
    unrealizedPnL: 75.0, // +₹75.00 (MTM)
    feesAndSlippage: 35.0,
    strategyVersion: 'v1.2-APPROVED',
  },
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j-1',
    date: '2026-10-01',
    instrument: 'ICICIBANK',
    tradingStyle: 'Intraday',
    timeframe: '15m',
    strategyVersion: 'v1.2-APPROVED',
    direction: 'LONG',
    entryPrice: 1235.0,
    exitPrice: 1252.0,
    quantity: 120,
    stopLoss: 1226.0,
    target: 1253.0,
    plannedRiskRupees: 1080,
    actualRiskRupees: 1080,
    pnlRupees: 2040,
    rMultiple: 1.89,
    ruleViolations: [],
    emotions: 'Disciplined',
    reasoning: 'Clean bounce off 20 EMA with VWAP support. Nifty Bank was in strong upward momentum.',
    reviewAndLessons: 'Held patiently until T1 near key resistance. Trailed remainder successfully. Good discipline.',
    sensitiveNotesApproved: true,
  },
  {
    id: 'j-2',
    date: '2026-09-30',
    instrument: 'TCS',
    tradingStyle: 'Intraday',
    timeframe: '15m',
    strategyVersion: 'v1.2-APPROVED',
    direction: 'LONG',
    entryPrice: 4230.0,
    exitPrice: 4205.0,
    quantity: 40,
    stopLoss: 4205.0,
    target: 4280.0,
    plannedRiskRupees: 1000,
    actualRiskRupees: 1000,
    pnlRupees: -1000,
    rMultiple: -1.0,
    ruleViolations: [],
    emotions: 'Disciplined',
    reasoning: 'Pullback setup met all entry criteria. IT index took sudden selling pressure from Nasdaq weakness.',
    reviewAndLessons: 'SL was hit cleanly at 4205. Did not move stop loss. A loss with rules intact is a good execution.',
    sensitiveNotesApproved: true,
  },
  {
    id: 'j-3',
    date: '2026-09-29',
    instrument: 'BANKNIFTY',
    tradingStyle: 'Intraday',
    timeframe: '5m',
    strategyVersion: 'Unapproved Manual',
    direction: 'SHORT',
    entryPrice: 52600.0,
    exitPrice: 52780.0,
    quantity: 15,
    stopLoss: 52700.0,
    target: 52350.0,
    plannedRiskRupees: 1500,
    actualRiskRupees: 2700,
    pnlRupees: -2700,
    rMultiple: -1.8,
    ruleViolations: [
      'Moved Stop Loss away when price approached initial SL',
      'Entered on 5m timeframe instead of approved 15m rule',
      'Chased sudden red candle (FOMO)',
    ],
    emotions: 'FOMO',
    reasoning: 'Felt index was too high and due for a sharp drop. Chased without waiting for 15m rejection confirmation.',
    reviewAndLessons: 'Severe mistake: Moved SL from 52,700 to 52,780 hoping for reversal. Cost extra ₹1,200. Never move SL away!',
    sensitiveNotesApproved: true,
  },
];

// Position Sizing calculator strictly adhering to approved risk limits & capital affordability
export function calculatePositionSize(
  accountCapital: number,
  riskPct: number,
  entry: number,
  sl: number,
  tp?: number,
  direction?: 'LONG' | 'SHORT'
): { quantity: number; riskRupees: number; capitalRequired: number; error?: string; allowed: boolean } {
  // Directly delegate to centralized robust sizing engine
  const res = calculateRobustPositionSize(
    accountCapital,
    riskPct,
    entry,
    sl,
    tp,
    direction
  );

  return {
    quantity: res.quantity,
    riskRupees: res.riskRupees,
    capitalRequired: res.capitalRequired,
    allowed: res.allowed,
    error: res.rejectReason,
  };
}

