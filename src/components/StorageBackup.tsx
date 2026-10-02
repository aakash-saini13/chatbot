import React, { useState } from 'react';
import { StorageService } from '../utils/storage';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  HardDrive,
  Shield,
  FileCheck,
  Trash2,
} from 'lucide-react';

interface StorageBackupProps {
  onExportAllData: () => any;
  onRestoreAllData: (data: any) => void;
  language: 'Hinglish' | 'English';
}

export const StorageBackup: React.FC<StorageBackupProps> = ({
  onExportAllData,
  onRestoreAllData,
  language,
}) => {
  const [askScreenshots, setAskScreenshots] = useState(true);
  const [askSensitiveNotes, setAskSensitiveNotes] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const bytesUsed = StorageService.getStorageUsageBytes();
  const kbUsed = (bytesUsed / 1024).toFixed(2);

  const handleExport = () => {
    const payload = onExportAllData();
    const jsonStr = StorageService.exportBackup(payload);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trademitra-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const validation = StorageService.validateAndRestoreBackup(text);
      if (validation.success && validation.data) {
        onRestoreAllData(validation.data);
        setImportStatus('Backup restored successfully! All strategies and trades verified.');
        setImportError(null);
      } else {
        setImportError(validation.error || 'Backup verification failed.');
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Persistent Memory, Storage & Backup (FR-11)</span>
          </h2>
          <p className="text-slate-400 mt-0.5 max-w-2xl font-sans">
            Local-first storage system. Tumhara data tumhare laptop par safe rehta hai. Backup user ke control me rehta hai.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Encrypted Backup JSON</span>
        </button>
      </div>

      {/* Main Grid: Storage Meter & Backup Actions + Privacy Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Storage Usage & Restore */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Local Storage Usage & Integrity
            </h3>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Local Storage Used:</span>
              <strong className="text-emerald-400 font-bold">{kbUsed} KB / 5,120 KB</strong>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (Number(kbUsed) / 5120) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-sans pt-1">
              Includes: Approved Strategy rules, Experimental versions, Paper positions, Trading journal logs, Risk settings.
            </div>
          </div>

          {/* Restore / Import Section */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-white font-mono block">Restore Backup File:</span>
            <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">Select .json backup file to restore</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">Checksum integrity verification included</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>

            {importStatus && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Privacy Permissions & Safeguards */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Privacy Safeguards & Consent Rules (FR-08 & FR-11)
              </h3>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-mono">Screenshot Storage Permission</strong>
                  <span className="text-[11px] text-slate-400 font-sans">
                    TradingView / broker screenshot save karne se pehle permission poochhein.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={askScreenshots}
                  onChange={(e) => setAskScreenshots(e.target.checked)}
                  className="rounded text-emerald-500 h-4 w-4"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-mono">Sensitive Notes Permission</strong>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Personal psychological thoughts aur emotional tags save karne se pehle consent lein.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={askSensitiveNotes}
                  onChange={(e) => setAskSensitiveNotes(e.target.checked)}
                  className="rounded text-emerald-500 h-4 w-4"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                <strong className="text-amber-300">Local-First Guarantee:</strong> Koi bhi screenshot ya sensitive notes kisi external server par silently upload nahi hote. System Aakash ke local laptop par autonomous operate karta hai.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Current App Session:</span>
            <span className="text-emerald-400 font-bold">16 GB RAM Optimized Desktop SPA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
