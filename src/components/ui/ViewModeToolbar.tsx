import React from 'react';
import { ViewMode } from '../../types/simulation';

interface ViewModeToolbarProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const ViewModeToolbar: React.FC<ViewModeToolbarProps> = ({ viewMode, onChangeViewMode }) => {
  const modes: { id: ViewMode; label: string }[] = [
    { id: 'digital_twin', label: 'Digital Twin' },
    { id: 'physical', label: 'Physical' },
    { id: 'thermal', label: 'Thermal' },
    { id: 'flow', label: 'Flow' }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChangeViewMode(mode.id)}
          className={`text-xs font-semibold px-3 py-1 rounded transition-all ${
            viewMode === mode.id
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};
