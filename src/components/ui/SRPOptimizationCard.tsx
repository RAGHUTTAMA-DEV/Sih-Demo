import React from 'react';
import { WellState } from '../../types/simulation';
import { Activity } from 'lucide-react';
import { DynamometerCard2D } from './DynamometerCard2D';

interface SRPOptimizationCardProps {
  wellState: WellState;
}

export const SRPOptimizationCard: React.FC<SRPOptimizationCardProps> = ({ wellState }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 mb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" />
          SRP Optimization
        </h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
          Normal
        </span>
      </div>

      {/* PARAMETERS GRID */}
      <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
        <div>
          <div className="text-slate-500 text-[10px]">Stroke Length</div>
          <div className="text-sm font-bold text-slate-900">100 in</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">Current SPM</div>
          <div className="text-sm font-bold text-slate-900">{wellState.spm.toFixed(1)}</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">Recommended SPM</div>
          <div className="text-sm font-bold text-amber-600">4.7</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">VFD Frequency</div>
          <div className="text-sm font-bold text-slate-900">{wellState.vfdFrequencyHz} Hz</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">Pump Fillage</div>
          <div className="text-sm font-bold text-slate-900">{wellState.pumpFillagePercent}%</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">Rod Load</div>
          <div className="text-sm font-bold text-slate-900">Normal</div>
        </div>

        <div>
          <div className="text-slate-500 text-[10px]">Rod Float Risk</div>
          <div className="text-sm font-bold text-slate-900">{wellState.rodFailureRiskPercent}%</div>
        </div>
      </div>

      {/* DYNAMOMETER CARD 2D PLOT */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-500 mb-1">Dynamometer Card</div>
        <DynamometerCard2D wellState={wellState} />
      </div>
    </div>
  );
};
