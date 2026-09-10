import React, { useState, useEffect } from 'react';
import { CameraPreset, WellState } from '../../types/simulation';
import { ChevronDown, Camera, HelpCircle, Activity, Tag, BarChart3, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface HeaderBarProps {
  wellState: WellState;
  activeCameraPreset: CameraPreset;
  showSpatialTags: boolean;
  isRightPanelOpen: boolean;
  isAnalyticsDrawerOpen: boolean;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onToggleSpatialTags: () => void;
  onToggleRightPanel: () => void;
  onToggleAnalyticsDrawer: () => void;
  onOpenLegend: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  wellState,
  activeCameraPreset,
  showSpatialTags,
  isRightPanelOpen,
  isAnalyticsDrawerOpen,
  onSelectCameraPreset,
  onToggleSpatialTags,
  onToggleRightPanel,
  onToggleAnalyticsDrawer,
  onOpenLegend
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 select-none shadow-xs">
      {/* BRAND & WELL SELECTOR */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          WT
        </div>
        <div>
          <h1 className="text-xs font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>WELLTWIN AI</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-semibold">Baghewala Field</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-900 text-[11px]">BGW-07</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">CSS + Sucker Rod Pump 3D Digital Twin</p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LIVE</span>
        </div>
      </div>

      {/* CENTER: CAMERA PRESET CONTROL PILLS */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center gap-1">
          <Camera className="w-3 h-3" /> CAM:
        </span>
        {(['overview', 'pumpjack', 'wellbore', 'reservoir'] as CameraPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => onSelectCameraPreset(preset)}
            className={`text-xs font-semibold px-2.5 py-1 rounded capitalize transition-all ${
              activeCameraPreset === preset
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* RIGHT ACTION BUTTONS */}
      <div className="flex items-center gap-2">
        {/* Spatial Tags Toggle */}
        <button
          onClick={onToggleSpatialTags}
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
            showSpatialTags
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{showSpatialTags ? '3D Tags: ON' : '3D Tags: OFF'}</span>
        </button>

        {/* Analytics Toggle */}
        <button
          onClick={onToggleAnalyticsDrawer}
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
            isAnalyticsDrawerOpen
              ? 'bg-blue-600 text-white border-blue-600 font-bold'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        {/* Right Panel Toggle */}
        <button
          onClick={onToggleRightPanel}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          title={isRightPanelOpen ? 'Hide Insights Panel' : 'Show Insights Panel'}
        >
          {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        {/* Legend Button */}
        <button
          onClick={onOpenLegend}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
          <span>Legend</span>
        </button>

        {/* Timestamp */}
        <div className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:block">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
