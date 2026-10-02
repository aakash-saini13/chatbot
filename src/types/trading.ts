export type TradingStyle = 'INTRADAY' | 'SWING' | 'BOTH';

export type SetupStatus =
  | 'Candidate'
  | 'Needs confirmation'
  | 'Confirmed'
  | 'Invalidated'
  | 'Expired'
  | 'Blocked';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface Instrument {
  symbol: string;
  type: 'INDEX' | 'EQUITY';
  exchange: 'NSE';
  basePrice: number;
  ltp: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  volume: number;
  rsi: number;
  ema20: number;
  ema50: number;
  supportZone: number;
  resistanceZone: number;
  sector: string;
  trend: string;
  candles: Candle[];
}

export interface SetupCard {
  id: string;
  instrument: string;
  strategyName: string;
  strategyVersion: string;
  timeframe: '5m' | '15m' | '1D' | '1W';
  direction: 'LONG' | 'SHORT';
  setupStatus: SetupStatus;
  entryZone: string;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  invalidation: string;
  potentialRiskReward: string;
  matchedRules: string[];
  unmetConditions: string[];
  evidence: string;
  reasonsMayFail: string[];
  dataSource: string;
  timestamp: string;
  isStale: boolean;
  sampleSize: number;
  historicalWinRatePct?: number;
  calibratedProbabilityPct?: number;
  confidenceWarning: string;
  newsRisk: string;
}

export interface StrategyRule {
  id: string;
  name: string;
  version: string;
  isApprovedActive: boolean;
  createdAt: string;
  author: 'Aakash' | 'AI Suggested';
  instruments: string[];
  timeframes: ('5m' | '15m' | '1D' | '1W')[];
  entryConditions: string[];
  exitConditions: string[];
  stopLossRule: string;
  targetRules: string[];
  positionSizingRule: string;
  indicators: string[];
  confirmationConditions: string[];
  invalidationConditions: string[];
  noTradeConditions: string[];
  backtestSampleCount: number;
  historicalWinRatePct: number;
  expectancyR: number;
}

export interface PaperPosition {
  id: string;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  target1: number;
  target2?: number;
  openedAt: string;
  status: 'OPEN' | 'CLOSED';
  currentLtp: number;
  unrealizedPnL: number;
  realizedPnL?: number;
  exitPrice?: number;
  closedAt?: string;
  exitReason?: 'TARGET' | 'STOP_LOSS' | 'MANUAL' | 'INVALIDATED';
  rMultiple?: number;
  feesAndSlippage: number;
  strategyVersion: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  instrument: string;
  tradingStyle: 'Intraday' | 'Swing';
  timeframe: string;
  strategyVersion: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss: number;
  target: number;
  plannedRiskRupees: number;
  actualRiskRupees: number;
  pnlRupees: number;
  rMultiple: number;
  ruleViolations: string[];
  emotions: 'Disciplined' | 'FOMO' | 'Anxious' | 'Revenge' | 'Greed' | 'Hesitant';
  reasoning: string;
  reviewAndLessons: string;
  screenshotUrl?: string;
  sensitiveNotesApproved: boolean;
}

export interface RiskSettings {
  accountCapital: number;
  maxRiskPerTradePct: number;
  maxRiskPerTradeRupees: number;
  dailyLossLimitRupees: number;
  maxOpenPositions: number;
  minRiskRewardRatio: number;
  maxDailyDrawdownPct: number;
  gapRiskWarningThresholdPct: number;
  approvedBy: string;
  approvalTimestamp: string;
  isLocked: boolean;
  blockNewTradesOnDailyLoss: boolean;
}

export interface DataFeedStatus {
  sourceName: string;
  isFree: boolean;
  delayNotice: string;
  latencyMs: number;
  lastUpdated: string;
  staleDetected: boolean;
  missingCandlesDetected: boolean;
  paidProposalShown: boolean;
}
