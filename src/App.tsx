import React, { useState, useEffect, useRef } from 'react';
import { WellState, CameraPreset, AnomalyEvent, ViewMode } from './types/simulation';
import { getInitialState, stepSimulation } from './services/simulationEngine';
import { HeaderBar } from './components/ui/HeaderBar';
import { TopMetricsRow } from './components/ui/TopMetricsRow';
import { DigitalTwinScene } from './components/3d/DigitalTwinScene';
import { ViewModeToolbar } from './components/ui/ViewModeToolbar';
import { LiveDataOverlay } from './components/ui/LiveDataOverlay';
import { TimelineScrubber } from './components/ui/TimelineScrubber';
import { AIDigitalTwinInsights } from './components/ui/AIDigitalTwinInsights';
import { CSSOptimizationCard } from './components/ui/CSSOptimizationCard';
import { SRPOptimizationCard } from './components/ui/SRPOptimizationCard';
import { RodFailurePredictionCard } from './components/ui/RodFailurePredictionCard';
import { AnalyticsChartsGrid } from './components/ui/AnalyticsChartsGrid';
import { WhatIfModal } from './components/ui/WhatIfModal';
import { LegendModal } from './components/ui/LegendModal';
import { ComponentDetailModal } from './components/ui/ComponentDetailModal';

export const App: React.FC = () => {
  const [wellState, setWellState] = useState<WellState>(getInitialState());
  const [events, setEvents] = useState<AnomalyEvent[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      phase: 'PRODUCTION',
      severity: 'info',
      message: 'SCADA Digital Twin connected to Well BGW-07 telemetry stream.'
    }
  ]);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('overview');
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [isAnalyticsDrawerOpen, setIsAnalyticsDrawerOpen] = useState<boolean>(false);
  const [showSpatialTags, setShowSpatialTags] = useState<boolean>(false); // Default OFF for clean 3D view
  const [selectedComponentName, setSelectedComponentName] = useState<string | null>(null);

  // Physics animation loop reference
  const lastTimeRef = useRef<number>(performance.now());
  const stateRef = useRef<WellState>(wellState);
  stateRef.current = wellState;

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const deltaSeconds = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (!stateRef.current.isPaused) {
        const { nextState, newEvents } = stepSimulation(stateRef.current, deltaSeconds);
        setWellState(nextState);
        if (newEvents.length > 0) {
          setEvents((prev) => [...prev, ...newEvents]);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleChangeViewMode = (mode: ViewMode) => {
    setWellState((prev) => ({ ...prev, viewMode: mode }));
  };

  const handleTogglePause = () => {
    setWellState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleTimelineChange = (day: number) => {
    setWellState((prev) => ({ ...prev, timelineDay: day }));
  };

  const handleApplyAIRecommendation = () => {
    setWellState((prev) => ({
      ...prev,
      spm: 4.7,
      targetSpm: 4.7,
      aiRecommendationApplied: true,
      anomalyDetected: false,
      anomalyMessage: null,
      pumpFillagePercent: 86,
      rodFailureRiskPercent: 3
    }));

    setEvents((prev) => [
      ...prev,
      {
        id: `ai-opt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: wellState.phase,
        severity: 'info',
        message: 'AI PRESCRIPTIVE ACTION EXECUTED: Reduced SPM to 4.7. Kinematics & fluid fall rate normalized.'
      }
    ]);
  };

  const handleApplyWhatIfParams = (spm: number, steamVol: number, soakHours: number) => {
    setWellState((prev) => ({
      ...prev,
      spm: spm,
      targetSpm: spm,
      sor: parseFloat((4.8 * (steamVol / 120)).toFixed(1)),
      aiRecommendationApplied: true
    }));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f4f7fa] text-slate-900 overflow-hidden font-sans select-none">
      {/* 1. SINGLE UNIFIED TOP SCADA HEADER BAR */}
      <HeaderBar
        wellState={wellState}
        activeCameraPreset={activeCameraPreset}
        showSpatialTags={showSpatialTags}
        isRightPanelOpen={isRightPanelOpen}
        isAnalyticsDrawerOpen={isAnalyticsDrawerOpen}
        onSelectCameraPreset={setActiveCameraPreset}
        onToggleSpatialTags={() => setShowSpatialTags(!showSpatialTags)}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        onToggleAnalyticsDrawer={() => setIsAnalyticsDrawerOpen(!isAnalyticsDrawerOpen)}
        onOpenLegend={() => setIsLegendOpen(true)}
      />

      {/* 2. TOP 8 KPI METRIC CARDS ROW */}
      <TopMetricsRow wellState={wellState} />

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* CENTER SECTION: 3D DIGITAL TWIN VIEWPORT */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {/* 3D CANVAS CONTAINER (Expands to fill 100% available height) */}
          <div className="flex-1 w-full relative bg-[#090d16] overflow-hidden">
            {/* TOP-LEFT VIEW MODE PILLS */}
            <div className="absolute top-4 left-4 z-10">
              <ViewModeToolbar
                viewMode={wellState.viewMode}
                onChangeViewMode={handleChangeViewMode}
              />
            </div>

            {/* OVERLAID LIVE DATA READOUT COLUMN (RIGHT EDGE) */}
            <LiveDataOverlay wellState={wellState} />

            {/* THREE.JS 3D SCENE */}
            <DigitalTwinScene
              wellState={wellState}
              activeCameraPreset={activeCameraPreset}
              showSpatialTags={showSpatialTags}
              onSelectComponent={(name) => setSelectedComponentName(name)}
            />

            {/* BOTTOM-LEFT 3D LEGEND OVERLAY */}
            <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md max-w-xs text-xs font-mono text-slate-200 shadow-2xl pointer-events-auto">
              <div className="text-amber-400 font-bold mb-1 flex items-center justify-between">
                <span>💡 3D TWIN LEGEND</span>
                <button
                  onClick={() => setIsLegendOpen(true)}
                  className="text-[10px] text-cyan-400 underline hover:text-cyan-300"
                >
                  Full Guide
                </button>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-300">
                <div>• <strong>Heated Zone Radius</strong> = {wellState.heatedZoneRadius}m</div>
                <div>• <strong>Fluid Viscosity</strong> = {wellState.viscositycP.toLocaleString()} cP</div>
                <div>• <strong>Stroke Rate</strong> = {wellState.spm.toFixed(1)} SPM</div>
              </div>
            </div>
          </div>

          {/* ANALYTICAL CHARTS DRAWER (COLLAPSIBLE) */}
          {isAnalyticsDrawerOpen && (
            <div className="border-t border-slate-200 bg-white max-h-[220px] overflow-y-auto animate-in slide-in-from-bottom duration-200">
              <AnalyticsChartsGrid wellState={wellState} />
            </div>
          )}

          {/* TIMELINE SCRUBBER & WHAT-IF SIMULATION BAR */}
          <TimelineScrubber
            wellState={wellState}
            onTimelineChange={handleTimelineChange}
            onTogglePause={handleTogglePause}
            onOpenWhatIf={() => setIsWhatIfOpen(true)}
          />
        </div>

        {/* RIGHT SIDEBAR: INSIGHTS & OPTIMIZATION DASHBOARD PANEL */}
        {isRightPanelOpen && (
          <div className="w-80 lg:w-[360px] xl:w-[390px] h-full bg-white border-l border-slate-200 p-4 overflow-y-auto flex-shrink-0 animate-in slide-in-from-right duration-200">
            {/* AI DIGITAL TWIN INSIGHTS */}
            <AIDigitalTwinInsights
              wellState={wellState}
              onApplyRecommendation={handleApplyAIRecommendation}
              onOpenWhatIf={() => setIsWhatIfOpen(true)}
            />

            {/* CSS OPTIMIZATION CARD */}
            <CSSOptimizationCard wellState={wellState} />

            {/* SRP OPTIMIZATION CARD */}
            <SRPOptimizationCard wellState={wellState} />

            {/* ROD FAILURE PREDICTION CARD */}
            <RodFailurePredictionCard wellState={wellState} />
          </div>
        )}
      </div>

      {/* MODALS */}
      <WhatIfModal
        isOpen={isWhatIfOpen}
        wellState={wellState}
        onClose={() => setIsWhatIfOpen(false)}
        onApplyParams={handleApplyWhatIfParams}
      />

      <LegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      <ComponentDetailModal
        componentName={selectedComponentName}
        wellState={wellState}
        onClose={() => setSelectedComponentName(null)}
      />
    </div>
  );
};

export default App;
