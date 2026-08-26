import React, { useState, useEffect, useRef } from 'react';
import { WellState, CameraPreset, AnomalyEvent, CyclePhase } from './types/simulation';
import { getInitialState, stepSimulation, PHASE_DURATIONS } from './services/simulationEngine';
import { HeaderBar } from './components/ui/HeaderBar';
import { DigitalTwinScene } from './components/3d/DigitalTwinScene';
import { TelemetryPanel } from './components/ui/TelemetryPanel';
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
      message: 'SCADA Digital Twin connected to Well BW-04 physics telemetry stream.'
    }
  ]);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('overview');
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
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

  // Handlers for user interaction
  const handleTogglePause = () => {
    setWellState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleChangeSpeed = (multiplier: 1 | 5 | 20) => {
    setWellState((prev) => ({ ...prev, speedMultiplier: multiplier }));
  };

  const handleStepPhase = () => {
    const phases: CyclePhase[] = ['INJECTION', 'SOAK', 'PRODUCTION'];
    const nextIdx = (phases.indexOf(wellState.phase) + 1) % phases.length;
    const nextPhase = phases[nextIdx];

    setWellState((prev) => ({
      ...prev,
      phase: nextPhase,
      phaseTime: 0,
      phaseDuration: PHASE_DURATIONS[nextPhase]
    }));

    setEvents((prev) => [
      ...prev,
      {
        id: `manual-step-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: nextPhase,
        severity: 'info',
        message: `MANUAL OVERRIDE: User stepped simulation to ${nextPhase} phase.`
      }
    ]);
  };

  const handleSetTargetSpm = (spm: number) => {
    setWellState((prev) => ({
      ...prev,
      targetSpm: spm,
      spm: spm,
      aiRecommendationApplied: false
    }));
  };

  const handleSetTargetStroke = (stroke: number) => {
    setWellState((prev) => ({
      ...prev,
      targetStrokeLength: stroke,
      strokeLength: stroke,
      aiRecommendationApplied: false
    }));
  };

  const handleApplyAIRecommendation = () => {
    // Apply recommended SPM 5.5 and Stroke Length 2.4m
    setWellState((prev) => ({
      ...prev,
      targetSpm: 5.5,
      targetStrokeLength: 2.4,
      aiRecommendationApplied: true,
      anomalyDetected: false,
      anomalyMessage: null
    }));

    setEvents((prev) => [
      ...prev,
      {
        id: `ai-opt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: wellState.phase,
        severity: 'info',
        message: 'AI PRESCRIPTIVE ACTION EXECUTED: Reduced SPM to 5.5 and stroke to 2.4m. Rod floating & impact loading eliminated.'
      }
    ]);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#090d12] text-slate-100 overflow-hidden font-sans select-none">
      {/* TOP SCADA NAVIGATION BAR */}
      <HeaderBar 
        wellState={wellState}
        activeCameraPreset={activeCameraPreset}
        onSelectCameraPreset={setActiveCameraPreset}
        onOpenLegend={() => setIsLegendOpen(true)}
      />

      {/* SPLIT SCREEN MAIN VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT ~65%: 3D DIGITAL TWIN SCENE */}
        <div className="w-full lg:w-[65%] h-full relative">
          <DigitalTwinScene 
            wellState={wellState}
            activeCameraPreset={activeCameraPreset}
            onSelectComponent={(name) => setSelectedComponentName(name)}
          />

          {/* BOTTOM-LEFT SCADA IN-APP LEGEND CAPTION OVERLAY */}
          <div className="absolute bottom-4 left-4 z-10 p-2.5 rounded-lg bg-slate-950/85 border border-slate-800 backdrop-blur-md max-w-sm text-[11px] font-mono shadow-2xl pointer-events-auto">
            <div className="text-amber-400 font-bold mb-1 flex items-center justify-between">
              <span>💡 QUICK 3D LEGEND</span>
              <button 
                onClick={() => setIsLegendOpen(true)} 
                className="text-[9px] text-cyan-400 underline hover:text-cyan-300"
              >
                Full Guide
              </button>
            </div>
            <div className="space-y-1 text-slate-300 text-[10px]">
              <div>• <strong>Reservoir Sphere Size</strong> = Heated Zone Radius ({wellState.heatedZoneRadius}m)</div>
              <div>• <strong>Fluid Color</strong> = Viscosity ({wellState.viscositycP} cP, Orange=Hot, Dark=Cold)</div>
              <div>• <strong>Dynamometer Gap</strong> = Anomaly Severity (Rod Float Lag)</div>
            </div>
          </div>
        </div>

        {/* RIGHT ~35%: LIVE TELEMETRY & CONTROL DASHBOARD */}
        <div className="hidden lg:block lg:w-[35%] h-full">
          <TelemetryPanel 
            wellState={wellState}
            events={events}
            onTogglePause={handleTogglePause}
            onChangeSpeed={handleChangeSpeed}
            onStepPhase={handleStepPhase}
            onSetTargetSpm={handleSetTargetSpm}
            onSetTargetStroke={handleSetTargetStroke}
            onApplyAIRecommendation={handleApplyAIRecommendation}
          />
        </div>
      </div>

      {/* MODALS */}
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
