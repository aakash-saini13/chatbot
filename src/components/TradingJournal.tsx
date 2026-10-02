import React, { useState } from 'react';
import { JournalEntry } from '../types/trading';
import {
  BookOpen,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Flame,
  CheckCircle,
  Eye,
  Camera,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

interface TradingJournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  language: 'Hinglish' | 'English';
}

export const TradingJournal: React.FC<TradingJournalProps> = ({
  entries,
  onAddEntry,
  language,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [filterViolation, setFilterViolation] = useState<string>('ALL');

  // Form states for manual or reconciled log
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    instrument: 'RELIANCE',
    tradingStyle: 'Intraday',
    timeframe: '15m',
    strategyVersion: 'v1.2-APPROVED',
    direction: 'LONG',
    entryPrice: 2940,
    exitPrice: 2980,
    quantity: 50,
    stopLoss: 2920,
    target: 2980,
    plannedRiskRupees: 1000,
    actualRiskRupees: 1000,
    pnlRupees: 2000,
    rMultiple: 2.0,
    emotions: 'Disciplined',
    ruleViolations: [],
    reasoning: 'Clean bounce off 20 EMA + VWAP support confluence.',
    reviewAndLessons: 'Maintained patience. Trailed remaining position.',
    sensitiveNotesApproved: false,
  });

  // Explicit Consent state for screenshots and sensitive notes (FR-08 & FR-11)
  const [askConsentModal, setAskConsentModal] = useState(false);
  const [pendingEntryToSave, setPendingEntryToSave] = useState<JournalEntry | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plannedRisk = Math.abs((formData.entryPrice || 0) - (formData.stopLoss || 0)) * (formData.quantity || 1);
    const pnl = ((formData.exitPrice || 0) - (formData.entryPrice || 0)) * (formData.quantity || 1) * (formData.direction === 'LONG' ? 1 : -1);
    const rMultiple = plannedRisk > 0 ? Number((pnl / plannedRisk).toFixed(2)) : 0;

    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      instrument: formData.instrument || 'RELIANCE',
      tradingStyle: formData.tradingStyle as any,
      timeframe: formData.timeframe || '15m',
      strategyVersion: formData.strategyVersion || 'v1.2-APPROVED',
      direction: formData.direction as any,
      entryPrice: Number(formData.entryPrice),
      exitPrice: Number(formData.exitPrice),
      quantity: Number(formData.quantity),
      stopLoss: Number(formData.stopLoss),
      target: Number(formData.target),
      plannedRiskRupees: plannedRisk,
      actualRiskRupees: plannedRisk,
      pnlRupees: pnl,
      rMultiple,
      ruleViolations: formData.ruleViolations || [],
      emotions: formData.emotions as any,
      reasoning: formData.reasoning || '',
      reviewAndLessons: formData.reviewAndLessons || '',
      sensitiveNotesApproved: false,
    };

    // Trigger explicit consent prompt per FR-08/FR-11
    setPendingEntryToSave(newEntry);
    setAskConsentModal(true);
    setShowAddModal(false);
  };

  const confirmConsentAndSave = (allowSensitive: boolean) => {
    if (pendingEntryToSave) {
      onAddEntry({
        ...pendingEntryToSave,
        sensitiveNotesApproved: allowSensitive,
      });
      setPendingEntryToSave(null);
      setAskConsentModal(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterViolation === 'ALL') return true;
    if (filterViolation === 'VIOLATIONS_ONLY') return e.ruleViolations.length > 0;
    if (filterViolation === 'DISCIPLINED_ONLY') return e.ruleViolations.length === 0;
    return true;
  });

  const getEmotionBadge = (emotion: string) => {
    switch (emotion) {
      case 'Disciplined':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'FOMO':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Revenge':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Greed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Trading Journal & Trade Memory (FR-08)</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({entries.length} Logged Trades)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Entries, exits, R-multiples, emotional tags, rule violations, aur private screenshots privacy safeguard ke saath.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Violation filter */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterViolation('ALL')}
              className={`px-3 py-1 rounded font-medium ${
                filterViolation === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setFilterViolation('DISCIPLINED_ONLY')}
              className={`px-3 py-1 rounded font-medium ${
                filterViolation === 'DISCIPLINED_ONLY' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              100% Disciplined
            </button>
            <button
              onClick={() => setFilterViolation('VIOLATIONS_ONLY')}
              className={`px-3 py-1 rounded font-medium ${
                filterViolation === 'VIOLATIONS_ONLY' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Violations
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Manual / Paper Trade</span>
          </button>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-slate-800">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Date & Symbol</th>
                <th className="py-3 px-3">Style & Version</th>
                <th className="py-3 px-3">Entry → Exit</th>
                <th className="py-3 px-3">Qty</th>
                <th className="py-3 px-3">P&L (₹)</th>
                <th className="py-3 px-3">R-Multiple</th>
                <th className="py-3 px-3">Emotions</th>
                <th className="py-3 px-3">Rule Violations</th>
                <th className="py-3 px-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEntries.map((entry) => {
                const isProfitable = entry.pnlRupees >= 0;
                const hasViolations = entry.ruleViolations.length > 0;

                return (
                  <tr key={entry.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{entry.instrument}</div>
                      <div className="text-[10px] text-slate-400">{entry.date} · {entry.timeframe}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium">{entry.tradingStyle}</div>
                      <div className="text-[10px] text-slate-400">{entry.strategyVersion}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>₹{entry.entryPrice} → ₹{entry.exitPrice}</div>
                      <div className="text-[10px] text-slate-400">SL: ₹{entry.stopLoss} | TP: ₹{entry.target}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold">{entry.quantity}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          isProfitable ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfitable ? '+' : ''}₹{entry.pnlRupees.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[11px] ${
                          entry.rMultiple >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {entry.rMultiple >= 0 ? `+${entry.rMultiple}R` : `${entry.rMultiple}R`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getEmotionBadge(entry.emotions)}`}>
                        {entry.emotions}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {hasViolations ? (
                        <span className="text-rose-400 text-[10px] flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{entry.ruleViolations.length} Violations</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Followed Rules</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                      >
                        View Notes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Detail Drawer / Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white font-mono">
                {selectedEntry.instrument} · Trade Deep Review
              </h3>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Result & Expectancy:</span>
                  <strong className={selectedEntry.pnlRupees >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {selectedEntry.pnlRupees >= 0 ? '+' : ''}₹{selectedEntry.pnlRupees} ({selectedEntry.rMultiple}R)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strategy Version:</span>
                  <span className="text-slate-200">{selectedEntry.strategyVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reported Emotion:</span>
                  <span className="text-amber-300 font-semibold">{selectedEntry.emotions}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Trade Reasoning:</span>
                <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed">
                  {selectedEntry.reasoning}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Post-Trade Review & Lessons:</span>
                <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed">
                  {selectedEntry.reviewAndLessons}
                </p>
              </div>

              {selectedEntry.ruleViolations.length > 0 && (
                <div className="bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40 text-rose-300">
                  <span className="font-bold block mb-1">Rule Violations Logged:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedEntry.ruleViolations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Consent Privacy Dialog (FR-08 & FR-11) */}
      {askConsentModal && pendingEntryToSave && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Privacy Safeguard Consent (FR-11)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Aakash, SRS privacy requirements ke according: <strong className="text-amber-300">Screenshots aur sensitive personal trading notes ko save karne se pehle tumhari explicit consent required hai.</strong>
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Instrument: <strong className="text-white">{pendingEntryToSave.instrument}</strong></div>
              <div>Emotion: <strong className="text-amber-300">{pendingEntryToSave.emotions}</strong></div>
              <div>Notes preview: "{pendingEntryToSave.reasoning.slice(0, 60)}..."</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => confirmConsentAndSave(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Save Trade Numbers Only (Skip Sensitive Notes)
              </button>
              <button
                onClick={() => confirmConsentAndSave(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md"
              >
                Consent & Save Full Journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Log Trade to Journal (FR-08)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Instrument</label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Emotions Experienced</label>
                  <select
                    value={formData.emotions}
                    onChange={(e) => setFormData({ ...formData, emotions: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Disciplined">Disciplined (Rules Followed)</option>
                    <option value="FOMO">FOMO (Chased Trade)</option>
                    <option value="Anxious">Anxious (Scared to Hold)</option>
                    <option value="Revenge">Revenge Trading</option>
                    <option value="Greed">Greed (Oversized Position)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Entry (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Exit (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-rose-400 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Rule Violations (Leave empty if disciplined)</label>
                <div className="space-y-1">
                  {[
                    'Moved Stop Loss further away',
                    'Exited prematurely before T1',
                    'Oversized position beyond 1% limit',
                    'Entered without 15m candle close confirmation',
                  ].map((v) => {
                    const checked = formData.ruleViolations?.includes(v);
                    return (
                      <label key={v} className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const cur = formData.ruleViolations || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, ruleViolations: [...cur, v] });
                            } else {
                              setFormData({ ...formData, ruleViolations: cur.filter((x) => x !== v) });
                            }
                          }}
                          className="rounded text-rose-500"
                        />
                        <span>{v}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Setup Reasoning</label>
                <textarea
                  value={formData.reasoning}
                  onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs resize-none"
                  placeholder="Kyu entry li? Key levels, VWAP, EMA bounce..."
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Post-Trade Review & Lessons</label>
                <textarea
                  value={formData.reviewAndLessons}
                  onChange={(e) => setFormData({ ...formData, reviewAndLessons: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs resize-none"
                  placeholder="Trade se kya seekha? Execution kesi thi..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition"
                >
                  Save to Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
