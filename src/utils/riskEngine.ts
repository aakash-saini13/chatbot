import { RiskSettings, SetupCard, PaperPosition, SetupStatus } from '../types/trading';

export interface OrderValidationResult {
  allowed: boolean;
  rejectReason?: string;
  sanitizedQuantity?: number;
  riskAmountRupees?: number;
  capitalRequiredRupees?: number;
  rewardRiskRatio?: number;
}

export interface PositionSizeResult {
  quantity: number;
  riskRupees: number;
  capitalRequired: number;
  rewardRiskRatio: number;
  allowed: boolean;
  rejectReason?: string;
}

/**
 * IMMUTABLE CODE-LEVEL BOUNDARIES (Cannot be overridden even if localStorage is tampered with)
 */
export const HARD_CODED_MAX_RISK_PER_TRADE_RUPEES = 2000.0;
export const HARD_CODED_DAILY_LOSS_LIMIT_RUPEES = 5000.0;
export const HARD_CODED_MAX_OPEN_POSITIONS = 3;
export const HARD_CODED_MIN_RR_RATIO = 2.0;
export const HARD_CODED_MAX_RISK_PCT = 1.0;

/**
 * Enforces immutable limits on risk settings.
 * Clamps any tampered or corrupted values to code-level inviolable boundaries.
 */
export function enforceImmutableRiskLimits(raw: any): RiskSettings {
  const capital = Number(raw?.accountCapital);
  const safeCapital = !isNaN(capital) && capital > 0 ? capital : 200000;

  // Percentage risk cannot exceed 1.0%
  const rawPct = Number(raw?.maxRiskPerTradePct);
  const safePct = !isNaN(rawPct) && rawPct > 0 ? Math.min(HARD_CODED_MAX_RISK_PCT, rawPct) : 1.0;

  // Absolute risk cannot exceed ₹2,000
  const rawRupees = Number(raw?.maxRiskPerTradeRupees);
  const safeRupees =
    !isNaN(rawRupees) && rawRupees > 0
      ? Math.min(HARD_CODED_MAX_RISK_PER_TRADE_RUPEES, rawRupees)
      : HARD_CODED_MAX_RISK_PER_TRADE_RUPEES;

  // Daily loss cannot exceed ₹5,000
  const rawDaily = Number(raw?.dailyLossLimitRupees);
  const safeDaily =
    !isNaN(rawDaily) && rawDaily > 0
      ? Math.min(HARD_CODED_DAILY_LOSS_LIMIT_RUPEES, rawDaily)
      : HARD_CODED_DAILY_LOSS_LIMIT_RUPEES;

  // Max open positions cannot exceed 3
  const rawPositions = Number(raw?.maxOpenPositions);
  const safePositions =
    !isNaN(rawPositions) && rawPositions > 0
      ? Math.min(HARD_CODED_MAX_OPEN_POSITIONS, Math.floor(rawPositions))
      : HARD_CODED_MAX_OPEN_POSITIONS;

  // Min R:R cannot be less than 2.0
  const rawRR = Number(raw?.minRiskRewardRatio);
  const safeRR = !isNaN(rawRR) && rawRR >= HARD_CODED_MIN_RR_RATIO ? rawRR : HARD_CODED_MIN_RR_RATIO;

  return {
    accountCapital: safeCapital,
    maxRiskPerTradePct: safePct,
    maxRiskPerTradeRupees: safeRupees,
    dailyLossLimitRupees: safeDaily,
    maxOpenPositions: safePositions,
    minRiskRewardRatio: safeRR,
    maxDailyDrawdownPct: 2.5,
    gapRiskWarningThresholdPct: 1.2,
    approvedBy: 'Aakash (Approved Hard Limit)',
    approvalTimestamp: raw?.approvalTimestamp || '2026-10-02 09:15 IST',
    isLocked: true, // Immutable boundary
    blockNewTradesOnDailyLoss: true, // Immutable boundary
  };
}

/**
 * Robust, Uncompromising Position Sizing Engine
 * Adheres strictly to:
 * 1. Capital Affordability: quantity * entryPrice <= accountCapital (or available free capital)
 * 2. Absolute ₹2,000 Hard Cap: min(accountCapital * pct, 2000)
 * 3. Zero-risk / Inverted SL rejection (never forces 1 share)
 * 4. Direction-Awareness: LONG (SL < Entry < TP), SHORT (SL > Entry > TP)
 * 5. Minimum 1:2 R:R Ratio enforcement
 */
export function calculateRobustPositionSize(
  accountCapital: number,
  riskPct: number,
  entry: number,
  sl: number,
  tp?: number,
  direction?: 'LONG' | 'SHORT',
  hardCapRupees: number = HARD_CODED_MAX_RISK_PER_TRADE_RUPEES,
  minRR: number = HARD_CODED_MIN_RR_RATIO
): PositionSizeResult {
  if (accountCapital <= 0) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio: 0,
      allowed: false,
      rejectReason: 'Account capital must be positive and greater than ₹0.',
    };
  }

  if (entry <= 0 || sl <= 0) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio: 0,
      allowed: false,
      rejectReason: 'Entry and Stop Loss must both be positive numbers.',
    };
  }

  if (entry === sl) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio: 0,
      allowed: false,
      rejectReason: 'Entry price cannot equal Stop Loss (zero risk distance is invalid).',
    };
  }

  const effectiveDirection = direction || (entry > sl ? 'LONG' : 'SHORT');

  // Direction-aware geometry check
  if (effectiveDirection === 'LONG') {
    if (sl >= entry) {
      return {
        quantity: 0,
        riskRupees: 0,
        capitalRequired: 0,
        rewardRiskRatio: 0,
        allowed: false,
        rejectReason: `LONG trade invalid: Stop Loss (₹${sl}) must be BELOW Entry (₹${entry}).`,
      };
    }
    if (tp && tp <= entry) {
      return {
        quantity: 0,
        riskRupees: 0,
        capitalRequired: 0,
        rewardRiskRatio: 0,
        allowed: false,
        rejectReason: `LONG trade invalid: Target (₹${tp}) must be ABOVE Entry (₹${entry}).`,
      };
    }
  } else {
    // SHORT
    if (sl <= entry) {
      return {
        quantity: 0,
        riskRupees: 0,
        capitalRequired: 0,
        rewardRiskRatio: 0,
        allowed: false,
        rejectReason: `SHORT trade invalid: Stop Loss (₹${sl}) must be ABOVE Entry (₹${entry}).`,
      };
    }
    if (tp && tp >= entry) {
      return {
        quantity: 0,
        riskRupees: 0,
        capitalRequired: 0,
        rewardRiskRatio: 0,
        allowed: false,
        rejectReason: `SHORT trade invalid: Target (₹${tp}) must be BELOW Entry (₹${entry}).`,
      };
    }
  }

  const perShareRisk = Math.abs(entry - sl);
  let rewardRiskRatio = 0;

  if (tp && tp > 0) {
    const perShareReward = Math.abs(tp - entry);
    rewardRiskRatio = Number((perShareReward / perShareRisk).toFixed(2));

    // Minimum 1:2 R:R enforcement
    if (rewardRiskRatio < minRR) {
      return {
        quantity: 0,
        riskRupees: 0,
        capitalRequired: 0,
        rewardRiskRatio,
        allowed: false,
        rejectReason: `Reward:Risk ratio (1:${rewardRiskRatio}) is below the required 1:${minRR} minimum hard limit.`,
      };
    }
  }

  if (riskPct <= 0) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio,
      allowed: false,
      rejectReason: 'Risk percentage must be greater than zero. Cannot risk 0% or negative.',
    };
  }

  // Absolute ₹2,000 Hard Cap: minimum of percentage budget and ₹2,000 absolute limit
  const percentageBudget = (accountCapital * riskPct) / 100;
  const effectiveHardCap = Math.min(hardCapRupees, HARD_CODED_MAX_RISK_PER_TRADE_RUPEES);
  const maxAllowableRisk = Math.min(percentageBudget, effectiveHardCap);

  // Raw quantity allowed by risk budget
  const rawQuantityByRisk = Math.floor(maxAllowableRisk / perShareRisk);

  // Capital affordability limit: cannot buy more shares than total available account capital permits!
  const maxQuantityByCapital = Math.floor(accountCapital / entry);

  // True allowable quantity is the MINIMUM of risk limit and capital affordability
  const quantity = Math.min(rawQuantityByRisk, maxQuantityByCapital);

  // CRITICAL: NEVER force 1 share if unaffordable or risk budget is too small!
  if (quantity <= 0) {
    let reason = '';
    if (maxQuantityByCapital <= 0) {
      reason = `Capital limit breached: 1 share of ₹${entry.toLocaleString(
        'en-IN'
      )} exceeds total available capital of ₹${accountCapital.toLocaleString('en-IN')}.`;
    } else if (rawQuantityByRisk <= 0) {
      reason = `Risk budget exceeded: Risk per share (₹${perShareRisk.toFixed(
        2
      )}) exceeds maximum allowed risk budget of ₹${maxAllowableRisk.toFixed(2)}.`;
    } else {
      reason = 'Position sizing calculation resulted in 0 allowable shares.';
    }

    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio,
      allowed: false,
      rejectReason: reason,
    };
  }

  const actualRiskRupees = Number((quantity * perShareRisk).toFixed(2));
  const capitalRequired = Number((quantity * entry).toFixed(2));

  // Secondary sanity guard
  if (capitalRequired > accountCapital) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio,
      allowed: false,
      rejectReason: `Order rejected: Required capital ₹${capitalRequired.toLocaleString(
        'en-IN'
      )} exceeds account capital ₹${accountCapital.toLocaleString('en-IN')}.`,
    };
  }

  if (actualRiskRupees > effectiveHardCap) {
    return {
      quantity: 0,
      riskRupees: 0,
      capitalRequired: 0,
      rewardRiskRatio,
      allowed: false,
      rejectReason: `Order rejected: Total risk ₹${actualRiskRupees} exceeds hard limit of ₹${effectiveHardCap}.`,
    };
  }

  return {
    quantity,
    riskRupees: actualRiskRupees,
    capitalRequired,
    rewardRiskRatio,
    allowed: true,
  };
}

/**
 * CENTRALIZED RISK GATE:
 * No paper order can EVER be created without passing through this gate.
 * Validates:
 * 1. Setup Status (rejects Invalidated, Blocked, or Expired setups)
 * 2. Daily Loss Limit (both realized + open unrealized losses)
 * 3. Max Open Positions (max 3)
 * 4. Available Free Capital (accountCapital minus capital tied up in active open positions)
 * 5. Position Sizing & Capital Affordability
 * 6. Hard ₹2,000 Per-Trade Cap & Minimum 1:2 R:R Ratio
 */
export function validateOrderAgainstCentralRiskGate(params: {
  accountCapital: number;
  riskSettings: RiskSettings;
  currentOpenPositions: PaperPosition[];
  dailyRealizedPnL: number;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  setupStatus?: SetupStatus;
}): OrderValidationResult {
  const {
    accountCapital,
    riskSettings,
    currentOpenPositions,
    dailyRealizedPnL,
    direction,
    entryPrice,
    stopLoss,
    target1,
    setupStatus,
  } = params;

  // Gate 1: Check Setup Status
  if (setupStatus === 'Invalidated') {
    return {
      allowed: false,
      rejectReason: 'BLOCKED BY RISK GATE: Setup is marked as INVALIDATED. Order execution is strictly forbidden.',
    };
  }
  if (setupStatus === 'Blocked') {
    return {
      allowed: false,
      rejectReason: 'BLOCKED BY RISK GATE: Setup is BLOCKED by risk guardrails. Order execution denied.',
    };
  }
  if (setupStatus === 'Expired') {
    return {
      allowed: false,
      rejectReason: 'BLOCKED BY RISK GATE: Setup has EXPIRED. Order execution denied.',
    };
  }

  // Gate 2: Max Open Positions check
  const activeOpenPositions = currentOpenPositions.filter((p) => p.status === 'OPEN');
  const activeOpenCount = activeOpenPositions.length;
  const maxOpenAllowed = Math.min(riskSettings.maxOpenPositions, HARD_CODED_MAX_OPEN_POSITIONS);

  if (activeOpenCount >= maxOpenAllowed) {
    return {
      allowed: false,
      rejectReason: `BLOCKED BY RISK GATE: Maximum ${maxOpenAllowed} open positions already active. You must close an active position before opening a new one.`,
    };
  }

  // Gate 3: Daily Loss Limit check (Realized + Open Unrealized Losses)
  const openUnrealizedLosses = activeOpenPositions
    .filter((p) => p.unrealizedPnL < 0)
    .reduce((sum, p) => sum + p.unrealizedPnL, 0);

  const totalCurrentDailyPnL = dailyRealizedPnL + openUnrealizedLosses;
  const dailyLossLimit = Math.min(riskSettings.dailyLossLimitRupees, HARD_CODED_DAILY_LOSS_LIMIT_RUPEES);

  if (totalCurrentDailyPnL <= -dailyLossLimit) {
    return {
      allowed: false,
      rejectReason: `BLOCKED BY RISK GATE: Daily Loss Limit (-₹${dailyLossLimit.toLocaleString(
        'en-IN'
      )}) breached. Total daily net: -₹${Math.abs(totalCurrentDailyPnL).toFixed(
        2
      )}. Trading is frozen for the day.`,
    };
  }

  // Gate 4: Available Capital Check (Free capital after open positions)
  const lockedCapitalInOpenPositions = activeOpenPositions.reduce(
    (sum, p) => sum + (p.remainingQuantity ?? p.quantity) * p.entryPrice,
    0
  );
  const availableFreeCapital = Math.max(0, accountCapital - lockedCapitalInOpenPositions);

  if (availableFreeCapital <= 0) {
    return {
      allowed: false,
      rejectReason: `BLOCKED BY RISK GATE: Insufficient available capital. All ₹${accountCapital.toLocaleString(
        'en-IN'
      )} is currently locked in active open positions.`,
    };
  }

  // Gate 5: Position Sizing, Capital Affordability, ₹2,000 Hard Cap, and 1:2 R:R
  const sizeCalc = calculateRobustPositionSize(
    availableFreeCapital,
    riskSettings.maxRiskPerTradePct,
    entryPrice,
    stopLoss,
    target1,
    direction,
    Math.min(riskSettings.maxRiskPerTradeRupees, HARD_CODED_MAX_RISK_PER_TRADE_RUPEES),
    HARD_CODED_MIN_RR_RATIO
  );

  if (!sizeCalc.allowed) {
    return {
      allowed: false,
      rejectReason: `BLOCKED BY RISK GATE: ${sizeCalc.rejectReason}`,
    };
  }

  return {
    allowed: true,
    sanitizedQuantity: sizeCalc.quantity,
    riskAmountRupees: sizeCalc.riskRupees,
    capitalRequiredRupees: sizeCalc.capitalRequired,
    rewardRiskRatio: sizeCalc.rewardRiskRatio,
  };
}
