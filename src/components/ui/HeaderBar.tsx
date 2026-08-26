import React, { useState, useEffect } from 'react';
import { CameraPreset, WellState } from '../../types/simulation';
import { Activity, Camera, HelpCircle, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HeaderBarProps {
  wellState: WellState;
  activeCameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onOpenLegend: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  wellState,
  activeCameraPreset,
  onSelectCameraPreset,
  onOpenLegend
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toTimeString().split(' ')[0] + '.' + Math.floor(d.getMilliseconds() / 100));
    };
    updateTime();
    const timer = setInterval(updateTime, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-scada-panel border-b border-scada-border px-4 flex items-center justify-between z-20 select-none shadow-lg">
      {/* LEFT: FIELD & WELL TITLE */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider font-mono text-slate-100 uppercase">
              BAGHEWALA FIELD — WELL BW-04
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              JODHPUR SANDSTONE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
              17-19° API CRUDE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>CSS + Sucker Rod Pump Digital Twin</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              SCADA LIVE TELEMETRY
            </span>
          </p>
        </div>
      </div>

      {/* CENTER: CAMERA PRESET QUICK CONTROLS */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <span className="text-[10px] font-mono text-slate-500 px-2 flex items-center gap-1">
          <Camera className="w-3 h-3" /> CAM:
        </span>
        {(['overview', 'pumpjack', 'wellbore', 'reservoir'] as CameraPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => onSelectCameraPreset(preset)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all capitalize ${
              activeCameraPreset === preset
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* RIGHT: SYSTEM STATUS & LEGEND */}
      <div className="flex items-center gap-3">
        {/* Anomaly Badge */}
        {wellState.anomalyDetected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-500/60 animate-pulse text-xs font-mono font-bold">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>ANOMALY ALERT</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OPTIMAL OPERATION</span>
          </div>
        )}

        {/* Live Clock */}
        <div className="font-mono text-xs text-amber-400 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          {timeStr}
        </div>

        {/* Legend Button */}
        <button
          onClick={onOpenLegend}
          className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Explain visual legend"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Legend</span>
        </button>
      </div>
    </header>
  );
};
