import React from 'react';
import {
  TrendingUp,
  Bell,
  Crosshair,
  GitBranch,
  PlaySquare,
  BookOpen,
  BarChart3,
  AlertOctagon,
  History,
  ShieldCheck,
  Activity,
  Database,
} from 'lucide-react';

export type NavTab =
  | 'market'
  | 'alerts'
  | 'detail'
  | 'strategies'
  | 'paper'
  | 'journal'
  | 'analytics'
  | 'mistakes'
  | 'backtest'
  | 'risk'
  | 'health'
  | 'backup';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertsCount: number;
  openPositionsCount: number;
  violationsCount: number;
  language: 'Hinglish' | 'English';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeAlertsCount,
  openPositionsCount,
  violationsCount,
  language,
}) => {
  const tabs = [
    {
      id: 'market' as NavTab,
      label: language === 'Hinglish' ? 'Market Overview' : 'Market Overview',
      subtitle: 'Nifty, Bank Nifty & Stocks',
      icon: TrendingUp,
    },
    {
      id: 'alerts' as NavTab,
      label: language === 'Hinglish' ? 'Setup Alerts' : 'Setup Alerts',
      subtitle: 'SRS Cards & Signals',
      icon: Bell,
      badge: activeAlertsCount,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'detail' as NavTab,
      label: language === 'Hinglish' ? 'Deep Evidence' : 'Deep Evidence',
      subtitle: 'Gemini High Thinking',
      icon: Crosshair,
    },
    {
      id: 'strategies' as NavTab,
      label: language === 'Hinglish' ? 'Strategy Rules' : 'Strategy Rules',
      subtitle: 'Active vs Experimental',
      icon: GitBranch,
    },
    {
      id: 'paper' as NavTab,
      label: language === 'Hinglish' ? 'Paper Trading' : 'Paper Trading',
      subtitle: 'Virtual Fills & P&L',
      icon: PlaySquare,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
      badgeColor: 'bg-cyan-500',
    },
    {
      id: 'journal' as NavTab,
      label: language === 'Hinglish' ? 'Trading Journal' : 'Trading Journal',
      subtitle: 'Trade Log & Lessons',
      icon: BookOpen,
    },
    {
      id: 'analytics' as NavTab,
      label: language === 'Hinglish' ? 'Performance' : 'Performance',
      subtitle: 'Expectancy & Metrics',
      icon: BarChart3,
    },
    {
      id: 'mistakes' as NavTab,
      label: language === 'Hinglish' ? 'Mistake Analysis' : 'Mistake Analysis',
      subtitle: 'Rules & Psychology',
      icon: AlertOctagon,
      badge: violationsCount > 0 ? violationsCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'backtest' as NavTab,
      label: language === 'Hinglish' ? 'Backtesting' : 'Backtesting',
      subtitle: 'Walk-Forward Engine',
      icon: History,
    },
    {
      id: 'risk' as NavTab,
      label: language === 'Hinglish' ? 'Risk Guardrails' : 'Risk Guardrails',
      subtitle: 'Hard Limits Locked',
      icon: ShieldCheck,
    },
    {
      id: 'health' as NavTab,
      label: language === 'Hinglish' ? 'Data Feasibility' : 'Data Health',
      subtitle: 'Free vs Paid Policy',
      icon: Activity,
    },
    {
      id: 'backup' as NavTab,
      label: language === 'Hinglish' ? 'Memory & Backup' : 'Memory & Backup',
      subtitle: 'Local Storage & Export',
      icon: Database,
    },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 px-3 py-1 flex items-center overflow-x-auto no-scrollbar gap-1 text-xs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5 leading-tight">
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-normal leading-none hidden xl:block">
                {tab.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
