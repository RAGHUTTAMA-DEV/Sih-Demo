import React from 'react';
import { WellState } from '../../types/simulation';

interface LiveDataOverlayProps {
  wellState: WellState;
}

export const LiveDataOverlay: React.FC<LiveDataOverlayProps> = ({ wellState }) => {
  const items = [
    { label: 'WHP', value: `${wellState.whpBar.toFixed(1)} bar` },
    { label: 'BHP', value: `${wellState.bhpBar.toFixed(1)} bar` },
    { label: 'Inj. Press', value: `${wellState.injPressureBar.toFixed(1)} bar`, color: 'text-amber-600' },
    { label: 'Fluid Level', value: `${wellState.fluidLevelM} m` },
    { label: 'Rod Load', value: `${wellState.rodLoadKn.toFixed(1)} kN` },
    { label: 'Motor Amps', value: `${wellState.motorAmps.toFixed(1)} A` },
    { label: 'Stroke Rate', value: `${wellState.spm.toFixed(1)} SPM` },
    { label: 'Prod. Rate', value: `${wellState.productionRate.toFixed(1)} BOPD`, color: 'text-emerald-600' }
  ];

  return (
    <div className="absolute top-4 right-4 z-10 p-3 rounded-xl bg-white/90 border border-slate-200 backdrop-blur-md shadow-lg max-w-[170px] text-xs select-none pointer-events-auto">
      <div className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-2">
        LIVE DATA
      </div>
      <div className="space-y-2 font-mono">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="text-[10px] text-slate-500 font-semibold">{item.label}</div>
            <div className={`text-sm font-bold ${item.color || 'text-cyan-700'}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
