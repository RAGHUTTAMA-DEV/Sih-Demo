import React from 'react';
import { SidebarTab } from '../../types/simulation';
import {
  LayoutDashboard,
  Box,
  Flame,
  Zap,
  Activity,
  HeartPulse,
  TrendingUp,
  Gauge,
  AlertTriangle,
  Bot,
  History,
  Settings,
  Circle
} from 'lucide-react';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuItems: { id: SidebarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital_twin', label: 'Digital Twin', icon: Box },
    { id: 'reservoir', label: 'Reservoir', icon: Flame },
    { id: 'css_opt', label: 'CSS Optimization', icon: Zap },
    { id: 'srp_opt', label: 'SRP Optimization', icon: Activity },
    { id: 'rod_health', label: 'Rod Health', icon: HeartPulse },
    { id: 'production', label: 'Production', icon: TrendingUp },
    { id: 'energy', label: 'Energy & SOR', icon: Gauge },
    { id: 'pred_maint', label: 'Pred. Maintenance', icon: AlertTriangle },
    { id: 'ai_rec', label: 'AI Recommendations', icon: Bot },
    { id: 'history', label: 'Historical Data', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const fieldStatus = [
    { name: 'BGW-07', status: 'PROD', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { name: 'BGW-09', status: 'SOAK', badgeColor: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'BGW-12', status: 'STEAM', badgeColor: 'bg-orange-100 text-orange-700 border-orange-300' },
    { name: 'BGW-15', status: 'IDLE', badgeColor: 'bg-slate-100 text-slate-600 border-slate-300' }
  ];

  return (
    <aside className="w-56 h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0 select-none z-20">
      {/* BRAND / LOGO HEADER */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
          WT
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1">
            WELLTWIN AI
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Well-to-Surface Digital Twin</p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* FIELD STATUS SECTION */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          FIELD STATUS
        </div>
        <div className="space-y-1.5">
          {fieldStatus.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Circle className="w-2 h-2 fill-current text-slate-400" />
                {item.name}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
