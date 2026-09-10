import React from 'react';
import { WellState } from '../../types/simulation';
import { Zap, TrendingUp } from 'lucide-react';

interface CSSOptimizationCardProps {
  wellState: WellState;
}

export const CSSOptimizationCard: React.FC<CSSOptimizationCardProps> = ({ wellState }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 mb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          CSS Optimization
        </h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
          Cycle 14
        </span>
      </div>

      {/* COMPARISON METRICS GRID */}
      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            CURRENT
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Steam Vol</span>
              <span className="font-bold text-slate-800">120 m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inj. Pressure</span>
              <span className="font-bold text-slate-800">8.4 bar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Soak Time</span>
              <span className="font-bold text-slate-800">36 hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Prod. Cut-off</span>
              <span className="font-bold text-slate-800">18 BOPD</span>
            </div>
          </div>
        </div>

        <div className="border-l border-slate-100 pl-3">
          <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider mb-2">
            AI OPTIMIZED
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Steam Vol</span>
              <span className="font-bold text-emerald-600">105 m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inj. Pressure</span>
              <span className="font-bold text-emerald-600">8.1 bar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Soak Time</span>
              <span className="font-bold text-emerald-600">30 hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exp. SOR</span>
              <span className="font-bold text-emerald-600">-11%</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT BOX */}
      <div className="p-2.5 rounded-xl bg-[#E6F7ED] border border-[#B8EBD0] text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <span>↑ Expected Production: +8% · SOR: -11%</span>
      </div>

      {/* COMPARISON BAR CHART */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-end justify-around h-16 px-4">
          {/* SV m3 */}
          <div className="flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-1 h-12">
              <div className="w-3 bg-slate-300 rounded-t h-[90%]" title="Current: 120 m³"></div>
              <div className="w-3 bg-emerald-500 rounded-t h-[75%]" title="Optimized: 105 m³"></div>
            </div>
            <span className="text-[9px] font-mono text-slate-500">SV m³</span>
          </div>

          {/* IP bar */}
          <div className="flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-1 h-12">
              <div className="w-3 bg-slate-300 rounded-t h-[70%]" title="Current: 8.4 bar"></div>
              <div className="w-3 bg-emerald-500 rounded-t h-[65%]" title="Optimized: 8.1 bar"></div>
            </div>
            <span className="text-[9px] font-mono text-slate-500">IP bar</span>
          </div>

          {/* Soak hr */}
          <div className="flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-1 h-12">
              <div className="w-3 bg-slate-300 rounded-t h-[80%]" title="Current: 36 hr"></div>
              <div className="w-3 bg-emerald-500 rounded-t h-[60%]" title="Optimized: 30 hr"></div>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Soak hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
