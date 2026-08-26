export type CyclePhase = 'INJECTION' | 'SOAK' | 'PRODUCTION';

export type CameraPreset = 'overview' | 'pumpjack' | 'wellbore' | 'reservoir';

export interface DynamometerPoint {
  position: number; // Normalized 0 to 1 (0 = bottom of stroke, 1 = top)
  load: number;     // Kilo-pounds (klb)
}

export interface WellState {
  // Phase state
  phase: CyclePhase;
  phaseTime: number;         // Seconds into current phase
  phaseDuration: number;     // Total duration of current phase in sec
  isPaused: boolean;
  speedMultiplier: 1 | 5 | 20;

  // Pump operational parameters
  spm: number;                // Strokes Per Minute (e.g. 8.0)
  strokeLength: number;       // Meters (e.g. 2.8m)
  targetSpm: number;          // Target after AI recommendation applied
  targetStrokeLength: number; // Target stroke length after AI recommendation

  // Reservoir & Wellbore Telemetry
  reservoirTemp: number;      // °C (CSS injection ~280°C down to reservoir ~46°C)
  heatedZoneRadius: number;   // Meters (0m to 35m)
  fluidViscosityIndex: number;// Normalized 0.0 (hot/mobile) to 1.0 (cold/viscous)
  viscositycP: number;        // Actual fluid viscosity in cP (e.g. 35 to 450 cP)
  minRodLoad: number;         // Minimum rod load (klb)
  maxRodLoad: number;         // Maximum rod load (klb)
  productionRate: number;     // Barrels per day (bpd)
  sor: number;                // Steam-to-Oil Ratio (m³/m³)

  // Dynamometer & Anomaly state
  liveDynoCard: DynamometerPoint[];
  normalDynoCard: DynamometerPoint[];
  anomalyDetected: boolean;
  anomalyMessage: string | null;
  aiRecommendationApplied: boolean;

  // 3D Animation state
  crankAngle: number;         // Current crank angle in radians
  polishedRodPos: number;     // 0 (top stroke) to 1 (bottom stroke)
  activeSelectedComponent: string | null;
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  phase: CyclePhase;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionTaken?: string;
}
