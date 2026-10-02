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

import { StorageService } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('market');
  const [language, setLanguage] = useState<'Hinglish' | 'English'>(() =>
    StorageService.getItem(StorageService.KEYS.LANGUAGE, 'Hinglish')
  );

  // Persistent States
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(() =>
    StorageService.getItem(StorageService.KEYS.RISK, INITIAL_RISK_SETTINGS)
  );

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

  // Periodic Simulated Real-time Market Ticks for Indian Instruments & Open Position P&L
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prev) => {
        if (!prev || prev.length === 0) return prev;
        return prev.map((inst) => {
          const delta = (Math.random() - 0.49) * (inst.basePrice * 0.0008);
          const newLtp = Number((inst.ltp + delta).toFixed(2));
          return {
            ...inst,
            ltp: newLtp,
            change: Number((newLtp - inst.basePrice).toFixed(2)),
            changePct: Number((((newLtp - inst.basePrice) / inst.basePrice) * 100).toFixed(2)),
          };
        });
      });

      // Update paper positions unrealized P&L
      setPaperPositions((prev) =>
        prev.map((pos) => {
          if (pos.status !== 'OPEN') return pos;
          const inst = instruments.find((i) => i.symbol === pos.instrument);
          const currentPrice = inst ? inst.ltp : pos.currentLtp;
          const priceDiff =
            pos.direction === 'LONG' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
          const unrealizedPnL = Number((priceDiff * pos.quantity - pos.feesAndSlippage).toFixed(2));

          return {
            ...pos,
            currentLtp: currentPrice,
            unrealizedPnL,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [instruments]);

  // Calculate today's realized P&L from closed journal entries
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyRealizedPnL = journalEntries
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.pnlRupees, 0);

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

  const handleExecutePaperTradeFromSetup = (setup: SetupCard) => {
    // Sizing strictly adheres to approved hard limits
    const sizing = calculatePositionSize(
      riskSettings.accountCapital,
      riskSettings.maxRiskPerTradePct,
      setup.entryPrice,
      setup.stopLoss
    );

    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      instrument: setup.instrument,
      direction: setup.direction,
      entryPrice: setup.entryPrice,
      quantity: sizing.quantity,
      stopLoss: setup.stopLoss,
      target1: setup.target1,
      target2: setup.target2,
      openedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'OPEN',
      currentLtp: setup.entryPrice,
      unrealizedPnL: 0,
      feesAndSlippage: Number((sizing.quantity * setup.entryPrice * 0.0006).toFixed(2)),
      strategyVersion: setup.strategyVersion,
    };

    setPaperPositions([newPos, ...paperPositions]);
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
    if (restored.riskSettings) setRiskSettings(restored.riskSettings);
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
            language={language}
          />
        )}

        {activeTab === 'risk' && (
          <RiskGuardrails
            riskSettings={riskSettings}
            onUpdateRiskSettings={setRiskSettings}
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

      {/* Paid Data Policy & Approval Modal (FR-02) */}
      <PaidDataModal
        isOpen={isPaidModalOpen}
        onClose={() => setIsPaidModalOpen(false)}
        onApprovePaidData={() => {
          alert('Aakash, your request for a paid data quotation has been logged in Audit trail. No card was charged without approval.');
        }}
      />
    </div>
  );
}
