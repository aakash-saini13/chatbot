import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { MarketOverview } from './components/MarketOverview';
import { SetupAlerts } from './components/SetupAlerts';
import { SetupDetail } from './components/SetupDetail';
import { StrategyEngine } from './components/StrategyEngine';
import { PaperTrading } from './components/PaperTrading';
import { TradingJournal } from './components/TradingJournal';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { MistakeAnalysis } from './components/MistakeAnalysis';
import { BacktestEngine } from './components/BacktestEngine';
import { RiskGuardrails } from './components/RiskGuardrails';
import { DataHealth } from './components/DataHealth';
import { StorageBackup } from './components/StorageBackup';
import { PaidDataModal } from './components/PaidDataModal';

import {
  Instrument,
  SetupCard,
  StrategyRule,
  PaperPosition,
  JournalEntry,
  RiskSettings,
} from './types/trading';

import {
  INITIAL_RISK_SETTINGS,
  INITIAL_STRATEGIES,
  INITIAL_SETUPS,
  INITIAL_PAPER_POSITIONS,
  INITIAL_JOURNAL_ENTRIES,
  calculatePositionSize,
} from './utils/mockMarket';

import {
  validateOrderAgainstCentralRiskGate,
  enforceImmutableRiskLimits,
  HARD_CODED_MAX_RISK_PER_TRADE_RUPEES,
  HARD_CODED_DAILY_LOSS_LIMIT_RUPEES,
} from './utils/riskEngine';
import { ShieldAlert, XCircle, AlertTriangle } from 'lucide-react';


import { StorageService } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('market');
  const [language, setLanguage] = useState<'Hinglish' | 'English'>(() =>
    StorageService.getItem(StorageService.KEYS.LANGUAGE, 'Hinglish')
  );

  // Persistent States
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(() =>
    enforceImmutableRiskLimits(StorageService.getItem(StorageService.KEYS.RISK, INITIAL_RISK_SETTINGS))
  );

  const [riskGateRejection, setRiskGateRejection] = useState<{
    show: boolean;
    instrument: string;
    reason: string;
  } | null>(null);


  const [strategies, setStrategies] = useState<StrategyRule[]>(() =>
    StorageService.getItem(StorageService.KEYS.STRATEGIES, INITIAL_STRATEGIES)
  );

  const [setups, setSetups] = useState<SetupCard[]>(() =>
    StorageService.getItem(StorageService.KEYS.SETUPS, INITIAL_SETUPS)
  );

  const [selectedSetup, setSelectedSetup] = useState<SetupCard | null>(() => setups[0] || null);

  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>(() =>
    StorageService.getItem(StorageService.KEYS.POSITIONS, INITIAL_PAPER_POSITIONS)
  );

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    StorageService.getItem(StorageService.KEYS.JOURNAL, INITIAL_JOURNAL_ENTRIES)
  );

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  const [marketSession, setMarketSession] = useState({
    isOpen: true,
    istTimeString: '11:30:00 AM',
    istDateString: 'Fri, Oct 2',
    statusText: 'Live Market (09:15 - 15:30 IST)',
    feedDelay: 'Free Feed · 15m Delay / Sim Mode',
    source: 'NSE Bhavcopy & Free Gateway',
  });

  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);

  // Sync to storage on state changes
  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.RISK, riskSettings);
  }, [riskSettings]);

  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.STRATEGIES, strategies);
  }, [strategies]);

  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.SETUPS, setups);
  }, [setups]);

  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.POSITIONS, paperPositions);
  }, [paperPositions]);

  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.JOURNAL, journalEntries);
  }, [journalEntries]);

  useEffect(() => {
    StorageService.setItem(StorageService.KEYS.LANGUAGE, language);
  }, [language]);

  // Fetch initial market overview data from server
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market/overview');
        if (res.ok) {
          const data = await res.json();
          setInstruments(data.instruments || []);
          if (!selectedInstrument && data.instruments?.length > 0) {
            setSelectedInstrument(data.instruments[0]);
          }
          if (data.session) {
            setMarketSession(data.session);
          }
        }
      } catch (err) {
        console.warn('Using local instruments fallback');
      }
    };

    fetchMarket();
  }, []);

  // Periodic Real-time Market Ticks & Automatic SL/TP Execution Engine
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Generate new tick updates
      let updatedInstruments: Instrument[] = [];
      setInstruments((prev) => {
        if (!prev || prev.length === 0) return prev;
        updatedInstruments = prev.map((inst) => {
          const delta = (Math.random() - 0.49) * (inst.basePrice * 0.0008);
          const newLtp = Number((inst.ltp + delta).toFixed(2));
          return {
            ...inst,
            ltp: newLtp,
            change: Number((newLtp - inst.basePrice).toFixed(2)),
            changePct: Number((((newLtp - inst.basePrice) / inst.basePrice) * 100).toFixed(2)),
          };
        });
        return updatedInstruments;
      });

      // 2. Automatic SL/TP and T1 Partial Exit Engine
      setPaperPositions((prevPositions) => {
        const newlyClosed: PaperPosition[] = [];
        const updated = prevPositions.map((pos) => {
          if (pos.status !== 'OPEN') return pos;
          const inst = updatedInstruments.find((i) => i.symbol === pos.instrument);
          const currentPrice = inst ? inst.ltp : pos.currentLtp;
          const isLong = pos.direction === 'LONG';
          const priceDiff = isLong ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
          const activeQty = pos.remainingQuantity || pos.quantity;
          const unrealizedPnL = Number((priceDiff * activeQty).toFixed(2));

          // Condition A: Stop Loss Hit! (Automated execution)
          const slHit = isLong ? currentPrice <= pos.stopLoss : currentPrice >= pos.stopLoss;
          if (slHit) {
            const exitP = pos.stopLoss;
            const gross = (isLong ? exitP - pos.entryPrice : pos.entryPrice - exitP) * activeQty;
            const closedPos: PaperPosition = {
              ...pos,
              status: 'CLOSED',
              exitPrice: exitP,
              closedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
              exitReason: 'STOP_LOSS',
              realizedPnL: Number((gross - pos.feesAndSlippage).toFixed(2)),
              rMultiple: pos.hitT1 ? 0.0 : -1.0,
            };
            newlyClosed.push(closedPos);
            return closedPos;
          }

          // Condition B: Target 1 Hit! (Strategy rule: Book 50% partial exit & trail SL to cost)
          const t1Hit = isLong ? currentPrice >= pos.target1 : currentPrice <= pos.target1;
          if (!pos.hitT1 && t1Hit) {
            const originalQty = pos.originalQuantity || pos.quantity;
            const halfQty = Math.floor(originalQty / 2) || 1;
            const remainQty = originalQty - halfQty;

            // Log partial 50% profit into journal
            const partialGain = Number(
              (
                (isLong ? pos.target1 - pos.entryPrice : pos.entryPrice - pos.target1) * halfQty -
                pos.feesAndSlippage / 2
              ).toFixed(2)
            );

            const partialJournal: JournalEntry = {
              id: `j-t1-${Date.now()}-${pos.id}`,
              date: new Date().toISOString().split('T')[0],
              instrument: pos.instrument,
              tradingStyle: 'Intraday',
              timeframe: '15m',
              strategyVersion: pos.strategyVersion,
              direction: pos.direction,
              entryPrice: pos.entryPrice,
              exitPrice: pos.target1,
              quantity: halfQty,
              stopLoss: pos.stopLoss,
              target: pos.target1,
              plannedRiskRupees: Math.abs(pos.entryPrice - pos.stopLoss) * halfQty,
              actualRiskRupees: Math.abs(pos.entryPrice - pos.stopLoss) * halfQty,
              pnlRupees: partialGain,
              rMultiple: 2.0,
              ruleViolations: [],
              emotions: 'Disciplined',
              reasoning: `Target 1 hit! Automatic 50% profit booked per strategy rule. SL of remaining ${remainQty} shares trailed to cost (₹${pos.entryPrice}).`,
              reviewAndLessons: 'Disciplined partial exit executed automatically. Remainder is risk-free at breakeven.',
              sensitiveNotesApproved: true,
            };

            setJournalEntries((prevJ) => [partialJournal, ...prevJ]);

            return {
              ...pos,
              currentLtp: currentPrice,
              unrealizedPnL: Number((priceDiff * remainQty).toFixed(2)),
              remainingQuantity: remainQty,
              stopLoss: pos.entryPrice, // Trailed to Cost (Breakeven)!
              hitT1: true,
            };
          }

          // Condition C: Target 2 Hit (for remainder after T1)
          if (pos.hitT1 && pos.target2) {
            const t2Hit = isLong ? currentPrice >= pos.target2 : currentPrice <= pos.target2;
            if (t2Hit) {
              const remainQty = pos.remainingQuantity || Math.floor(pos.quantity / 2) || 1;
              const exitP = pos.target2;
              const gross = (isLong ? exitP - pos.entryPrice : pos.entryPrice - exitP) * remainQty;
              const closedPos: PaperPosition = {
                ...pos,
                status: 'CLOSED',
                exitPrice: exitP,
                closedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
                exitReason: 'TARGET',
                realizedPnL: Number((gross - pos.feesAndSlippage / 2).toFixed(2)),
                rMultiple: 3.5,
              };
              newlyClosed.push(closedPos);
              return closedPos;
            }
          }

          return {
            ...pos,
            currentLtp: currentPrice,
            unrealizedPnL,
          };
        });

        if (newlyClosed.length > 0) {
          newlyClosed.forEach((c) => handlePositionClosed(c));
          return updated.filter((p) => p.status === 'OPEN');
        }
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [instruments]);

  // Calculate today's realized P&L from closed journal entries
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyRealizedPnL = journalEntries
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.pnlRupees, 0);

  // Daily Loss calculation includes open unrealized losses (Conservative Risk Protection)
  const openUnrealizedLosses = paperPositions
    .filter((p) => p.status === 'OPEN' && p.unrealizedPnL < 0)
    .reduce((acc, p) => acc + p.unrealizedPnL, 0);

  const dailyTotalPnL = dailyRealizedPnL + openUnrealizedLosses;

  const openPositionsCount = paperPositions.filter((p) => p.status === 'OPEN').length;
  const violationsCount = journalEntries.reduce(
    (acc, e) => acc + (e.ruleViolations?.length || 0),
    0
  );

  // Fast Navigation & Action Handlers
  const handleNavigateToSetup = (symbol: string) => {
    const match = setups.find((s) => s.instrument === symbol);
    if (match) {
      setSelectedSetup(match);
      setActiveTab('detail');
    } else {
      setActiveTab('alerts');
    }
  };

  // Centralized Risk Gate Order Placement (SRS FR-12 Enforcement)
  const handleExecutePaperTradeFromSetup = (setup: SetupCard) => {
    // 1. Pass through Centralized Risk Gate
    const validation = validateOrderAgainstCentralRiskGate({
      accountCapital: riskSettings.accountCapital,
      riskSettings,
      currentOpenPositions: paperPositions,
      dailyRealizedPnL,
      instrument: setup.instrument,
      direction: setup.direction,
      entryPrice: setup.entryPrice,
      stopLoss: setup.stopLoss,
      target1: setup.target1,
      setupStatus: setup.setupStatus,
    });

    if (!validation.allowed || !validation.sanitizedQuantity) {
      setRiskGateRejection({
        show: true,
        instrument: setup.instrument,
        reason: validation.rejectReason || 'Order rejected by Central Risk Engine',
      });
      return;
    }


    const qty = validation.sanitizedQuantity;

    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      instrument: setup.instrument,
      direction: setup.direction,
      entryPrice: setup.entryPrice,
      quantity: qty,
      originalQuantity: qty,
      remainingQuantity: qty,
      stopLoss: setup.stopLoss,
      target1: setup.target1,
      target2: setup.target2,
      openedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'OPEN',
      currentLtp: setup.entryPrice,
      unrealizedPnL: 0,
      feesAndSlippage: Number((qty * setup.entryPrice * 0.0006).toFixed(2)),
      strategyVersion: setup.strategyVersion,
      hitT1: false,
    };

    setPaperPositions((prev) => [newPos, ...prev]);
    setActiveTab('paper');
  };

  const handlePositionClosed = (closedPos: PaperPosition) => {
    // Automatically reconcile closed position into Trading Journal (FR-07 -> FR-08)
    const plannedRisk = Math.abs(closedPos.entryPrice - closedPos.stopLoss) * closedPos.quantity;
    const isWin = (closedPos.realizedPnL || 0) > 0;

    const newJournal: JournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      instrument: closedPos.instrument,
      tradingStyle: 'Intraday',
      timeframe: '15m',
      strategyVersion: closedPos.strategyVersion,
      direction: closedPos.direction,
      entryPrice: closedPos.entryPrice,
      exitPrice: closedPos.exitPrice || closedPos.currentLtp,
      quantity: closedPos.quantity,
      stopLoss: closedPos.stopLoss,
      target: closedPos.target1,
      plannedRiskRupees: plannedRisk,
      actualRiskRupees: plannedRisk,
      pnlRupees: closedPos.realizedPnL || 0,
      rMultiple: closedPos.rMultiple || 0,
      ruleViolations: [],
      emotions: 'Disciplined',
      reasoning: `Paper trade executed per strategy ${closedPos.strategyVersion}. Exit reason: ${closedPos.exitReason}.`,
      reviewAndLessons: isWin
        ? 'Target reached smoothly. Capital risk stayed strictly inside approved 1% rule.'
        : 'SL triggered as planned. No tampering with risk guardrail.',
      sensitiveNotesApproved: true,
    };

    setJournalEntries([newJournal, ...journalEntries]);
  };

  const handleExportAllData = () => {
    return {
      strategies,
      setups,
      paperPositions,
      journalEntries,
      riskSettings,
      privacySettings: {
        askBeforeSavingScreenshots: true,
        askBeforeSavingSensitiveNotes: true,
      },
    };
  };

  const handleRestoreAllData = (restored: any) => {
    if (restored.strategies) setStrategies(restored.strategies);
    if (restored.setups) setSetups(restored.setups);
    if (restored.paperPositions) setPaperPositions(restored.paperPositions);
    if (restored.journalEntries) setJournalEntries(restored.journalEntries);
    if (restored.riskSettings) setRiskSettings(enforceImmutableRiskLimits(restored.riskSettings));
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Desktop App Bar */}
      <Header
        language={language}
        setLanguage={setLanguage}
        riskSettings={riskSettings}
        dailyRealizedPnL={dailyRealizedPnL}
        openPositionsCount={openPositionsCount}
        marketSession={marketSession}
        onOpenPaidDataModal={() => setIsPaidModalOpen(true)}
      />

      {/* 12-Module Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAlertsCount={setups.filter((s) => s.setupStatus === 'Confirmed' || s.setupStatus === 'Needs confirmation').length}
        openPositionsCount={openPositionsCount}
        violationsCount={violationsCount}
        language={language}
      />

      {/* Main Module Content Area */}
      <main className="flex-1 p-4 max-w-[1680px] w-full mx-auto">
        {activeTab === 'market' && selectedInstrument && (
          <MarketOverview
            instruments={instruments}
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
            language={language}
            onNavigateToSetup={handleNavigateToSetup}
          />
        )}

        {activeTab === 'alerts' && (
          <SetupAlerts
            setups={setups}
            language={language}
            onExecutePaperTrade={handleExecutePaperTradeFromSetup}
            onDeepAnalyze={(setup) => {
              setSelectedSetup(setup);
              setActiveTab('detail');
            }}
          />
        )}

        {activeTab === 'detail' && (
          <SetupDetail
            selectedSetup={selectedSetup}
            allSetups={setups}
            onSelectSetup={setSelectedSetup}
            language={language}
            onExecutePaperTrade={handleExecutePaperTradeFromSetup}
          />
        )}

        {activeTab === 'strategies' && (
          <StrategyEngine
            strategies={strategies}
            onUpdateStrategies={setStrategies}
            language={language}
          />
        )}

        {activeTab === 'paper' && (
          <PaperTrading
            positions={paperPositions}
            onUpdatePositions={setPaperPositions}
            riskSettings={riskSettings}
            instruments={instruments}
            dailyRealizedPnL={dailyRealizedPnL}
            onPositionClosed={handlePositionClosed}
            language={language}
          />
        )}

        {activeTab === 'journal' && (
          <TradingJournal
            entries={journalEntries}
            onAddEntry={(entry) => setJournalEntries([entry, ...journalEntries])}
            language={language}
          />
        )}

        {activeTab === 'analytics' && (
          <PerformanceAnalytics
            entries={journalEntries}
            riskSettings={riskSettings}
            language={language}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeAnalysis
            entries={journalEntries}
            riskSettings={riskSettings}
            language={language}
          />
        )}

        {activeTab === 'backtest' && (
          <BacktestEngine
            strategies={strategies}
            instruments={instruments}
            language={language}
          />
        )}


        {activeTab === 'risk' && (
          <RiskGuardrails
            riskSettings={riskSettings}
            onUpdateRiskSettings={(newSettings) => setRiskSettings(enforceImmutableRiskLimits(newSettings))}
            language={language}
          />
        )}

        {activeTab === 'health' && (
          <DataHealth
            onOpenPaidDataModal={() => setIsPaidModalOpen(true)}
            language={language}
          />
        )}

        {activeTab === 'backup' && (
          <StorageBackup
            onExportAllData={handleExportAllData}
            onRestoreAllData={handleRestoreAllData}
            language={language}
          />
        )}
      </main>

      {/* Central Risk Gate Rejection Modal (FR-12 Strict Boundary Enforcement) */}
      {riskGateRejection?.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-rose-950/60 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-3 border-b border-rose-900/40">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>CENTRAL RISK ENGINE REJECTION</span>
                </h3>
                <span className="text-[11px] text-rose-300 font-mono">
                  Order execution strictly blocked by Risk Gate
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/50 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800">
                <span>Target Instrument:</span>
                <span className="text-white font-bold">{riskGateRejection.instrument}</span>
              </div>

              <div className="space-y-1">
                <span className="text-rose-400 font-bold block uppercase text-[10px]">
                  Rejection Reason:
                </span>
                <p className="text-rose-200 text-xs font-sans leading-relaxed">
                  {riskGateRejection.reason}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans space-y-1">
                <div>• <strong>Hard Limit Policy:</strong> Invalidated setups, daily loss limit breaches, or sizing errors cannot be bypassed under any circumstances.</div>
                <div>• <strong>Capital Protection:</strong> Order execution is halted to protect paper capital integrity.</div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setRiskGateRejection(null)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2 px-5 rounded-lg shadow-md transition"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paid Data Policy & Approval Modal (FR-02) */}
      <PaidDataModal
        isOpen={isPaidModalOpen}
        onClose={() => setIsPaidModalOpen(false)}
        onApprovePaidData={() => {
          setIsPaidModalOpen(false);
        }}
      />
    </div>
  );
}

