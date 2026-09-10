import React from 'react';
import { WellState } from '../../types/simulation';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface RodFailurePredictionCardProps {
  wellState: WellState;
}

export const RodFailurePredictionCard: React.FC<RodFailurePredictionCardProps> = ({ wellState }) => {
  const isHighRisk = wellState.rodFailureRiskPercent > 30;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5 mb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Rod Failure Prediction
        </h3>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isHighRisk
              ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]'
              : 'bg-[#E6F7ED] text-[#0E623B] border-[#B8EBD0]'
          }`}
        >
          {isHighRisk ? 'MED RISK' : 'LOW RISK'}
        </span>
      </div>

      {/* RISK LEVEL BAR */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-black text-emerald-600">{wellState.rodFailureRiskPercent}%</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Risk Level</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${wellState.rodFailureRiskPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* RISK CONTRIBUTORS */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          Risk Contributors
        </div>
        <div className="space-y-1.5 text-xs font-medium">
          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-600">Increasing viscosity</span>
              <span className="font-bold text-amber-600">35%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[35%]"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-600">Elevated rod loading</span>
              <span className="font-bold text-amber-600">28%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[28%]"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-600">Reduced pump fillage</span>
              <span className="font-bold text-amber-600">22%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[22%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* RISK TREND SPARKLINE */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
          Risk Trend (5 Wks)
        </div>
        <div className="relative h-14 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
            {/* Dotted Alert Line */}
            <line x1="0" y1="12" x2="200" y2="12" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
            <text x="195" y="10" fill="#ef4444" fontSize="7" textAnchor="end" fontFamily="monospace">Alert</text>

            {/* Line Trend */}
            <path
              d="M 10 32 L 50 30 L 90 28 L 130 26 L 180 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Nodes */}
            {[[10, 32], [50, 30], [90, 28], [130, 26], [180, 24]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="#f59e0b" />
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1 px-1">
          <span>W1</span>
          <span>W2</span>
          <span>W3</span>
          <span>W4</span>
          <span>+72h</span>
        </div>
      </div>
    </div>
  );
};
