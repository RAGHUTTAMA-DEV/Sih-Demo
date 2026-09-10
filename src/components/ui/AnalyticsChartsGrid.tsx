import React from 'react';
import { WellState } from '../../types/simulation';

interface AnalyticsChartsGridProps {
  wellState: WellState;
}

export const AnalyticsChartsGrid: React.FC<AnalyticsChartsGridProps> = ({ wellState }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50">
      {/* 1. RESERVOIR TEMPERATURE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">Reservoir Temperature</h4>
          <span className="text-[10px] font-mono text-slate-400">°C over time</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 10 40 Q 60 15 100 25 T 190 35 L 190 55 L 10 55 Z"
              fill="url(#tempGrad)"
            />
            <path
              d="M 10 40 Q 60 15 100 25 T 190 35"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2"
            />
            {/* Dotted Now Indicator */}
            <line x1="160" y1="5" x2="160" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="160" y="5" fill="#64748b" fontSize="7" textAnchor="middle">Now</text>
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day 30</span>
        </div>
      </div>

      {/* 2. OIL PRODUCTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">Oil Production</h4>
          <span className="text-[10px] font-mono text-slate-400">BOPD over time</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 10 45 Q 60 30 100 22 T 190 32 L 190 55 L 10 55 Z"
              fill="url(#prodGrad)"
            />
            <path
              d="M 10 45 Q 60 30 100 22 T 190 32"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <line x1="160" y1="5" x2="160" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day 30</span>
        </div>
      </div>

      {/* 3. OIL VISCOSITY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">Oil Viscosity</h4>
          <span className="text-[10px] font-mono text-slate-400">cP over time</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
            <path
              d="M 10 25 Q 70 45 120 30 T 190 28"
              fill="none"
              stroke="#854d0e"
              strokeWidth="2"
            />
            <line x1="160" y1="5" x2="160" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day 30</span>
        </div>
      </div>

      {/* 4. SOR VS CSS CYCLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">SOR vs CSS Cycle</h4>
          <span className="text-[10px] font-mono text-slate-400">Steam-Oil Ratio</span>
        </div>
        <div className="h-20 w-full flex items-end justify-between px-2 pt-3">
          {[4.2, 3.8, 3.5, 4.0, 3.2, 4.8].map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-4 bg-purple-600 rounded-t"
                style={{ height: `${val * 9}px` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day 30</span>
        </div>
      </div>

      {/* 5. ENERGY VS PRODUCTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">Energy vs Production</h4>
          <span className="text-[10px] font-mono text-slate-400">kWh/bbl · BOPD</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
            {/* Line 1 Green */}
            <path d="M 10 20 Q 80 18 190 22" fill="none" stroke="#10b981" strokeWidth="2" />
            {/* Line 2 Blue */}
            <path d="M 10 38 Q 80 40 190 38" fill="none" stroke="#3b82f6" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>Wk2</span>
          <span>Wk3</span>
          <span>Wk4</span>
          <span>Wk5</span>
        </div>
      </div>

      {/* 6. ROD FAILURE RISK TREND */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-bold text-slate-800">Rod Failure Risk Trend</h4>
          <span className="text-[10px] font-mono text-slate-400">% probability</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
            {/* Alert threshold */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
            <text x="120" y="16" fill="#ef4444" fontSize="7" fontFamily="monospace">-- Alert --</text>

            <path d="M 10 45 Q 60 42 120 38 T 190 32" fill="none" stroke="#f59e0b" strokeWidth="2" />
            {[[10, 45], [50, 42], [90, 40], [130, 38], [190, 32]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="#f59e0b" />
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
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
