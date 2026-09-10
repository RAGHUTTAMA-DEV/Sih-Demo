import React from 'react';
import { WellState, CyclePhase, AnomalyEvent } from '../../types/simulation';
import { DynamometerCard2D } from './DynamometerCard2D';
import { AIRecommendationCard } from './AIRecommendationCard';
import { AnomalyLogPanel } from './AnomalyLogPanel';
import { 
  Play, Pause, FastForward, Flame, Droplets, Thermometer, Gauge, Sliders, ArrowUpRight, RotateCcw
} from 'lucide-react';

interface TelemetryPanelProps {
  wellState: WellState;
  events: AnomalyEvent[];
  onTogglePause: () => void;
  onChangeSpeed: (multiplier: 1 | 5 | 20) => void;
  onStepPhase: () => void;
  onSetTargetSpm: (spm: number) => void;
  onSetTargetStroke: (stroke: number) => void;
  onApplyAIRecommendation: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  wellState,
  events,
  onTogglePause,
  onChangeSpeed,
  onStepPhase,
  onSetTargetSpm,
  onSetTargetStroke,
  onApplyAIRecommendation
}) => {
  const phaseProgress = (wellState.phaseTime / wellState.phaseDuration) * 100;

  return (
    <aside className="w-full h-full bg-scada-panel border-l border-scada-border flex flex-col overflow-y-auto select-none p-3 space-y-3">
      {/* 1. CYCLE PHASE BANNER & CONTROLS */}
      <div className="p-3 rounded-lg bg-scada-card border border-scada-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CSS CYCLE PHASE:</span>
            {/* Phase Badge */}
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider shadow-md ${
              wellState.phase === 'INJECTION'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-cyan-950/50'
                : wellState.phase === 'SOAK'
                  ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-amber-950/50'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-emerald-950/50'
            }`}>
              {wellState.phase}
            </span>
          </div>

          {/* SIMULATION CLOCK CONTROLS */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              onClick={onTogglePause}
              className={`p-1.5 rounded text-xs font-mono font-bold border transition-all ${
                wellState.isPaused 
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500 hover:bg-emerald-800' 
                  : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={wellState.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {wellState.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Step Phase */}
            <button
              onClick={onStepPhase}
              className="p-1.5 rounded text-xs font-mono border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              title="Next Phase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Toggle (1x, 5x, 20x) */}
            <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800">
              {([1, 5, 20] as (1 | 5 | 20)[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                    wellState.speedMultiplier === spd
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PHASE PROGRESS BAR */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              wellState.phase === 'INJECTION' 
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' 
                : wellState.phase === 'SOAK' 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, phaseProgress)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
          <span>Elapsed: {wellState.phaseTime.toFixed(0)}s</span>
          <span>Phase Duration: {wellState.phaseDuration}s</span>
        </div>
      </div>

      {/* 2. NUMERIC TELEMETRY METRIC GRID */}
      <div className="grid grid-cols-2 gap-2">
        {/* Reservoir Temp */}
        <div className="p-2.5 rounded bg-scada-card border border-scada-border">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>RESERVOIR TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400 glow-amber flex items-baseline gap-1">
            <span>{wellState.reservoirTemp}</span>
            <span className="text-xs text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Base: 48°C | Steam: 280°C
          </div>
        </div>

        {/* Heated Zone Radius */}
        <div className="p-2.5 rounded bg-scada-card border border-scada-border">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>HEATED RADIUS</span>
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 glow-cyan flex items-baseline gap-1">
            <span>{wellState.heatedZoneRadius}</span>
            <span className="text-xs text-slate-400 font-normal">m</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Thermal front decay
          </div>
        </div>

        {/* Crude Viscosity */}
        <div className={`p-2.5 rounded border transition-colors ${
          wellState.fluidViscosityIndex > 0.68 ? 'bg-red-950/40 border-red-500/60' : 'bg-scada-card border-scada-border'
        }`}>
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>CRUDE VISCOSITY</span>
            <Droplets className={`w-3.5 h-3.5 ${wellState.fluidViscosityIndex > 0.68 ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <div className={`text-lg font-bold font-mono flex items-baseline gap-1 ${
            wellState.fluidViscosityIndex > 0.68 ? 'text-red-400 glow-red' : 'text-amber-300'
          }`}>
            <span>{wellState.viscositycP}</span>
            <span className="text-xs text-slate-400 font-normal">cP</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Index: {wellState.fluidViscosityIndex.toFixed(2)} (17° API)
          </div>
        </div>

        {/* Peak Rod Load */}
        <div className={`p-2.5 rounded border transition-colors ${
          wellState.maxRodLoad > 22.0 ? 'bg-red-950/40 border-red-500/60' : 'bg-scada-card border-scada-border'
        }`}>
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>MAX ROD LOAD</span>
            <Gauge className={`w-3.5 h-3.5 ${wellState.maxRodLoad > 22.0 ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <div className={`text-lg font-bold font-mono flex items-baseline gap-1 ${
            wellState.maxRodLoad > 22.0 ? 'text-red-400 glow-red' : 'text-emerald-400'
          }`}>
            <span>{wellState.maxRodLoad}</span>
            <span className="text-xs text-slate-400 font-normal">klb</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Min: {wellState.minRodLoad} klb
          </div>
        </div>

        {/* Production Rate */}
        <div className="p-2.5 rounded bg-scada-card border border-scada-border">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>PROD RATE</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 flex items-baseline gap-1">
            <span>{wellState.productionRate}</span>
            <span className="text-xs text-slate-400 font-normal">bpd</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Heavy crude volume
          </div>
        </div>

        {/* SOR (Steam Oil Ratio) */}
        <div className="p-2.5 rounded bg-scada-card border border-scada-border">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-1">
            <span>SOR RATIO</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400 flex items-baseline gap-1">
            <span>{wellState.sor}</span>
            <span className="text-xs text-slate-400 font-normal">m³/m³</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            Steam economy efficiency
          </div>
        </div>
      </div>

      {/* 3. MANUAL CONTROL SLIDERS FOR PUMP SPEED & STROKE */}
      <div className="p-3 rounded-lg bg-scada-card border border-scada-border space-y-2.5">
        <div className="flex items-center justify-between border-b border-scada-border pb-1">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Manual Override Controls
            </h3>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
            REAL-TIME
          </span>
        </div>

        {/* SPM Slider */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-300">PUMP SPEED (SPM):</span>
            <span className="font-bold text-amber-400">{wellState.spm.toFixed(1)} SPM</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="12.0"
            step="0.5"
            value={wellState.targetSpm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetTargetSpm(parseFloat(e.target.value))}
            className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
            <span>1.0 SPM (Min)</span>
            <span>Recommended: 5.5 SPM</span>
            <span>12.0 SPM (Max)</span>
          </div>
        </div>

        {/* Stroke Length Slider */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-300">STROKE LENGTH:</span>
            <span className="font-bold text-cyan-400">{wellState.strokeLength.toFixed(1)} m ({(wellState.strokeLength * 3.28).toFixed(1)} ft)</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="3.8"
            step="0.1"
            value={wellState.targetStrokeLength}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetTargetStroke(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 4. DYNAMOMETER CARD CHART */}
      <DynamometerCard2D wellState={wellState} />

      {/* 5. AI RECOMMENDATION CARD */}
      <AIRecommendationCard 
        isAnomaly={wellState.anomalyDetected}
        anomalyMessage={wellState.anomalyMessage}
        currentSpm={wellState.spm}
        currentStroke={wellState.strokeLength}
        viscositycP={wellState.viscositycP}
        aiApplied={wellState.aiRecommendationApplied}
        onApplyRecommendation={onApplyAIRecommendation}
      />

      {/* 6. ANOMALY LOG PANEL */}
      <AnomalyLogPanel events={events} />
    </aside>
  );
};
