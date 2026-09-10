export type CyclePhase = 'INJECTION' | 'SOAK' | 'PRODUCTION';

export type CameraPreset = 'overview' | 'pumpjack' | 'wellbore' | 'reservoir';

export type ViewMode = 'digital_twin' | 'physical' | 'thermal' | 'flow';

export type SidebarTab =
  | 'overview'
  | 'digital_twin'
  | 'reservoir'
  | 'css_opt'
  | 'srp_opt'
  | 'rod_health'
  | 'production'
  | 'energy'
  | 'pred_maint'
  | 'ai_rec'
  | 'history'
  | 'settings';

export interface DynamometerPoint {
  position: number; // Normalized 0 to 1 (0 = bottom of stroke, 1 = top)
  load: number;     // Kilo-pounds (klb)
}

export interface WellState {
  // Navigation & View Mode
  activeTab: SidebarTab;
  viewMode: ViewMode;
  timelineDay: number; // -30 to +72

  // Phase state
  phase: CyclePhase;
  phaseTime: number;         // Seconds into current phase
  phaseDuration: number;     // Total duration of current phase in sec
  isPaused: boolean;
  speedMultiplier: 1 | 5 | 20;

  // Pump operational parameters
  spm: number;                // Strokes Per Minute (e.g. 5.2)
  strokeLength: number;       // Meters (e.g. 2.5m)
  targetSpm: number;          // Target after AI recommendation applied
  targetStrokeLength: number; // Target stroke length after AI recommendation
  vfdFrequencyHz: number;     // VFD Motor frequency (Hz) e.g. 42 Hz

  // Reservoir & Wellbore Telemetry
  reservoirTemp: number;      // °C (CSS injection ~280°C down to reservoir ~62.4°C)
  heatedZoneRadius: number;   // Meters (0m to 35m)
  fluidViscosityIndex: number;// Normalized 0.0 (hot/mobile) to 1.0 (cold/viscous)
  viscositycP: number;        // Actual fluid viscosity in cP (e.g. 18,700 cP)
  minRodLoad: number;         // Minimum rod load (klb or kN)
  maxRodLoad: number;         // Maximum rod load (klb or kN)
  productionRate: number;     // Barrels per day (BOPD)
  sor: number;                // Steam-to-Oil Ratio (m³/m³)
  energyKwhPerBbl: number;    // Energy consumption per barrel (kWh/bbl)
  pumpFillagePercent: number; // Pump fillage % (e.g. 78%)
  rodFailureRiskPercent: number; // Rod failure probability % (e.g. 7%)
  twinHealthPercent: number;  // Digital twin health % (e.g. 96%)

  // Surface & Subsurface SCADA Pressures & Levels
  whpBar: number;             // Wellhead pressure (bar)
  bhpBar: number;             // Bottomhole pressure (bar)
  injPressureBar: number;     // Injection pressure (bar)
  fluidLevelM: number;        // Subsurface fluid level (m)
  rodLoadKn: number;          // Peak rod load (kN)
  motorAmps: number;          // Motor electrical current (A)

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

export interface FieldWellStatus {
  id: string;
  name: string;
  status: 'PROD' | 'SOAK' | 'STEAM' | 'IDLE';
  bopd: number;
  temp: number;
}
