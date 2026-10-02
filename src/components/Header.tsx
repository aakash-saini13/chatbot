import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Radio,
  Cpu,
  Globe2,
  HardDrive,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { RiskSettings } from '../types/trading';

interface HeaderProps {
  language: 'Hinglish' | 'English';
  setLanguage: (lang: 'Hinglish' | 'English') => void;
  riskSettings: RiskSettings;
  dailyRealizedPnL: number;
  openPositionsCount: number;
  marketSession: {
    isOpen: boolean;
    istTimeString: string;
    istDateString: string;
    statusText: string;
    feedDelay: string;
    source: string;
  };
  onOpenPaidDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  riskSettings,
  dailyRealizedPnL,
  openPositionsCount,
  marketSession,
  onOpenPaidDataModal,
}) => {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 3600000 * 5.5);
      setIstTime(ist.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDailyLossBreached = dailyRealizedPnL <= -riskSettings.dailyLossLimitRupees;
  const isLossApproaching =
    dailyRealizedPnL < -riskSettings.dailyLossLimitRupees * 0.7 && !isDailyLossBreached;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none sticky top-0 z-30">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wide text-white font-mono">
              TradeMitra<span className="text-emerald-400">.AI</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              DESKTOP v1.0 · SRS BASELINE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>User: <strong className="text-slate-200">Aakash</strong></span>
            <span>•</span>
            <span className="text-amber-400/90 font-medium">Paper Trading Only</span>
          </div>
        </div>
      </div>

      {/* Center status meters: Market Clock + Free Data Notice */}
      <div className="hidden lg:flex items-center space-x-4 bg-slate-950/70 px-3.5 py-1.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-emerald-400 font-medium">{istTime || marketSession.istTimeString} IST</span>
          <span
            className={`w-2 h-2 rounded-full ${
              marketSession.isOpen ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-300 font-medium text-[11px]">
            {marketSession.isOpen ? 'Market Active' : 'Off-Hours Research'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-800" />

        <div className="flex items-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Data Feed:</span>
          <span className="text-cyan-300 font-medium text-[11px]">Free NSE Bhavcopy (15m Delay)</span>
          <button
            onClick={onOpenPaidDataModal}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 transition"
            title="Paid data policy requires your approval"
          >
            Feed Policy
          </button>
        </div>
      </div>

      {/* Right controls: Risk Guardrail Indicator, Gemini Pro Thinking & Language */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Daily Risk Limit Guardrail Status */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
            isDailyLossBreached
              ? 'bg-rose-950/80 border-rose-600 text-rose-200 animate-pulse'
              : isLossApproaching
              ? 'bg-amber-950/60 border-amber-600 text-amber-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>DAILY LIMIT:</span>
              <span className="text-rose-400 font-bold">-₹{riskSettings.dailyLossLimitRupees.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] font-semibold">
              Today: <span className={dailyRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {dailyRealizedPnL >= 0 ? `+₹${dailyRealizedPnL.toFixed(2)}` : `-₹${Math.abs(dailyRealizedPnL).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini Thinking Badge */}
        <div className="flex items-center space-x-1.5 bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 px-2.5 py-1.5 rounded-lg">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <div className="text-left">
            <div className="text-[9px] text-indigo-400/80 uppercase tracking-wider font-semibold">Thinking Mode</div>
            <div className="text-[11px] font-mono font-medium">gemini-3.1-pro · HIGH</div>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'Hinglish' ? 'English' : 'Hinglish')}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          title="Toggle Hinglish / English"
        >
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language}</span>
        </button>
      </div>
    </header>
  );
};
