import React from 'react';
import { WellState } from '../../types/simulation';
import { Play, Pause, RotateCcw, Sliders } from 'lucide-react';

interface TimelineScrubberProps {
  wellState: WellState;
  onTimelineChange: (day: number) => void;
  onTogglePause: () => void;
  onOpenWhatIf: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  wellState,
  onTimelineChange,
  onTogglePause,
  onOpenWhatIf
}) => {
  return (
    <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs z-10 select-none shadow-sm">
      {/* TIMELINE SLIDER CONTROL */}
      <div className="flex items-center gap-3 flex-1 min-w-[280px]">
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          title={wellState.isPaused ? 'Play Physics' : 'Pause Physics'}
        >
          {wellState.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        <span className="font-bold text-slate-700 text-xs">Timeline</span>

        {/* Range Slider */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="-30"
            max="72"
            value={wellState.timelineDay}
            onChange={(e) => onTimelineChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="font-mono font-semibold text-slate-600 text-[11px] whitespace-nowrap min-w-[140px]">
            {wellState.timelineDay === 0
              ? 'Now'
              : wellState.timelineDay < 0
              ? `Day ${wellState.timelineDay}`
              : `+${wellState.timelineDay}h (Predicted)`}
          </span>
        </div>
      </div>

      {/* CSS PHASE LEGEND */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
        <span className="text-slate-400 font-bold">CSS PHASE:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Steam Inj.
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Soak
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Production
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300"></span> Cooling
        </span>
      </div>

      {/* WHAT-IF SIMULATION BUTTON */}
      <button
        onClick={onOpenWhatIf}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors shadow-xs"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>What-If Simulation</span>
      </button>
    </div>
  );
};
