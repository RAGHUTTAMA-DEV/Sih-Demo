import React from 'react';
import { WellState } from '../../types/simulation';
import { Bot, AlertTriangle, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIDigitalTwinInsightsProps {
  wellState: WellState;
  onApplyRecommendation: () => void;
  onOpenWhatIf: () => void;
}

export const AIDigitalTwinInsights: React.FC<AIDigitalTwinInsightsProps> = ({
  wellState,
  onApplyRecommendation,
  onOpenWhatIf
}) => {
  const handleApply = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b']
    });
    onApplyRecommendation();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mb-4">
      {/* DARK HEADER CARD */}
      <div className="bg-[#0F172A] text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <h2 className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            AI Digital Twin Insights
          </h2>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          BGW-07 · Updated 14s ago
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {/* CURRENT STATE VS PREDICTED (72H) TABLE */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current State</div>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Temp</span>
                <span className="font-bold text-slate-800">{wellState.reservoirTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visc</span>
                <span className="font-bold text-slate-800">{wellState.viscositycP.toLocaleString()} cP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prod</span>
                <span className="font-bold text-slate-800">{wellState.productionRate.toFixed(1)} BOPD</span>
              </div>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-2.5">
            <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">Predicted (72h)</div>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Temp</span>
                <span className="font-bold text-amber-700">58.1°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visc</span>
                <span className="font-bold text-amber-700">20,900 cP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prod</span>
                <span className="font-bold text-amber-700">44.2 BOPD</span>
              </div>
            </div>
          </div>
        </div>

        {/* RISK DETECTION BANNER (YELLOW BOX) */}
        <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#B45309] mb-1">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>Risk Detection</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#92400E]">
            Reservoir cooling detected. Predicted viscosity increase of 12% over the next 72 hours. Oil mobility reduction expected.
          </p>
        </div>

        {/* RECOMMENDED ACTION CARD (BLUE BOX) */}
        <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-2.5">
          <div className="text-[11px] font-bold text-[#1E40AF]">
            Recommended Action
          </div>
          <p className="text-[11px] leading-relaxed text-[#1E3A8A]">
            Reduce SRP speed from <strong className="text-slate-900">5.2 → 4.7 SPM</strong> to maintain pump efficiency and reduce rod loading. Consider advancing CSS Cycle 15 by 3 days.
          </p>

          {wellState.aiRecommendationApplied ? (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Optimization Applied (4.7 SPM Active)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleApply}
                className="flex-1 py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <span>Apply</span>
              </button>
              <button
                onClick={onOpenWhatIf}
                className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#BFDBFE] hover:bg-slate-50 text-[#1D4ED8] font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>Simulate</span>
              </button>
            </div>
          )}

          <div className="text-center pt-0.5">
            <button
              onClick={onOpenWhatIf}
              className="text-[11px] text-[#2563EB] font-semibold hover:underline inline-flex items-center gap-1"
            >
              View Explanation <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
