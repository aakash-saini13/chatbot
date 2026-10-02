import { Instrument, SetupCard, StrategyRule, PaperPosition, JournalEntry, RiskSettings, Candle } from '../types/trading';

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
    entryZone: '₹2,935.00 - ₹2,942.00',
    entryPrice: 2940.0,
    stopLoss: 2920.0, // Risk ₹20/share
    target1: 2980.0, // 1:2 R:R (+₹40)
    target2: 3010.0, // 1:3.5 R:R (+₹70)
    invalidation: 'Any 15m candle close below ₹2,918.00 (below swing low and 50 EMA)',
    potentialRiskReward: '1:2.0 (T1) / 1:3.5 (T2)',
    matchedRules: [
      '15m price above 50 EMA (2912.5)',
      'Clean pullback into 20 EMA (2938.0) and VWAP (2936.5)',
      'Bullish pin bar rejection from 2932 support with 1.4x volume',
      'RSI bouncing upward from 46 level',
    ],
    unmetConditions: [],
    evidence: 'High confluence of VWAP support, rising 20 EMA, and strong order block rejection in energy sector.',
    reasonsMayFail: [
      'Nifty 50 facing resistance at 24,900 round number',
      'Brent crude spike could cause short-term pressure',
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
    entryZone: '24,820.00 - 24,845.00',
    entryPrice: 24840.0,
    stopLoss: 24780.0, // Risk 60 pts
    target1: 24960.0, // Reward 120 pts (1:2)
    target2: 25050.0,
    invalidation: 'Breakdown below 24,770 with sustained selling volume',
    potentialRiskReward: '1:2.0',
    matchedRules: [
      'Index in primary bullish structure on 1D timeframe',
      'Pullback to key previous resistance-turned-support at 24,820',
    ],
    unmetConditions: [
      'Awaiting bullish confirmation candle close above 24,850',
      'Bank Nifty lagging (HDFC Bank consolidating)',
    ],
    evidence: 'Approaching high volume node; heavy put writing at 24,800 strike.',
    reasonsMayFail: [
      'Global cues weak (US futures -0.3%)',
      'Heavy call resistance built up at 25,000 round number',
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
    id: 'setup-tatamotors-03',
    instrument: 'TATAMOTORS',
    strategyName: 'Daily Range Breakout with Volume Surge',
    strategyVersion: 'v1.3-EXPERIMENTAL',
    timeframe: '1D',
    direction: 'LONG',
    setupStatus: 'Candidate',
    entryZone: '₹982.00 - ₹986.00',
    entryPrice: 984.0,
    stopLoss: 960.0, // Risk ₹24
    target1: 1032.0, // Reward ₹48 (1:2)
    target2: 1060.0,
    invalidation: 'Daily close back below ₹958.00 consolidation floor',
    potentialRiskReward: '1:2.0',
    matchedRules: ['Consolidated for 8 days in 960-980 range', 'Auto index in top quartile momentum'],
    unmetConditions: ['Daily candle volume must exceed 1.8x average at 15:30 close'],
    evidence: 'Monthly sales numbers positive; Jaguar Land Rover margins expanding.',
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
    instrument: 'HDFCBANK',
    direction: 'LONG',
    entryPrice: 1675.0,
    quantity: 100, // ₹1,67,500 position, risk = ₹15 * 100 = ₹1,500 (within ₹2,000 max risk)
    stopLoss: 1660.0,
    target1: 1705.0,
    target2: 1725.0,
    openedAt: '2026-10-02 09:45 IST',
    status: 'OPEN',
    currentLtp: 1682.4,
    unrealizedPnL: 740.0, // +₹740 (+0.44%)
    feesAndSlippage: 55.0,
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

// Position Sizing calculator adhering to approved risk limits
export function calculatePositionSize(
  accountCapital: number,
  riskPct: number,
  entry: number,
  sl: number
): { quantity: number; riskRupees: number; capitalRequired: number; error?: string } {
  if (entry <= 0 || sl <= 0 || entry === sl) {
    return { quantity: 0, riskRupees: 0, capitalRequired: 0, error: 'Invalid Entry or Stop Loss' };
  }

  const riskPerShare = Math.abs(entry - sl);
  const maxRiskAmount = (accountCapital * riskPct) / 100;
  const rawQuantity = Math.floor(maxRiskAmount / riskPerShare);
  const quantity = Math.max(1, rawQuantity);
  const riskRupees = Number((quantity * riskPerShare).toFixed(2));
  const capitalRequired = Number((quantity * entry).toFixed(2));

  return {
    quantity,
    riskRupees,
    capitalRequired,
  };
}
