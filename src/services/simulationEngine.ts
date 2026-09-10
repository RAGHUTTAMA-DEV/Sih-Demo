import { CyclePhase, WellState, DynamometerPoint, AnomalyEvent } from '../types/simulation';

export const PHASE_DURATIONS: Record<CyclePhase, number> = {
  INJECTION: 30, // 30 seconds
  SOAK: 20,      // 20 seconds
  PRODUCTION: 90 // 90 seconds
};

// Initial state creator matching Screenshot parameters (BGW-07)
export function getInitialState(): WellState {
  return {
    activeTab: 'digital_twin',
    viewMode: 'digital_twin',
    timelineDay: 0,

    phase: 'PRODUCTION',
    phaseTime: 25,
    phaseDuration: PHASE_DURATIONS.PRODUCTION,
    isPaused: false,
    speedMultiplier: 1,

    spm: 5.2,
    strokeLength: 2.5,
    targetSpm: 4.7,
    targetStrokeLength: 2.5,
    vfdFrequencyHz: 42,

    reservoirTemp: 62.4,
    heatedZoneRadius: 26.5,
    fluidViscosityIndex: 0.72,
    viscositycP: 18700,
    minRodLoad: 4.2,
    maxRodLoad: 18.4,
    productionRate: 48.6,
    sor: 4.8,
    energyKwhPerBbl: 21.4,
    pumpFillagePercent: 78,
    rodFailureRiskPercent: 7,
    twinHealthPercent: 96,

    whpBar: 8.4,
    bhpBar: 14.2,
    injPressureBar: 8.4,
    fluidLevelM: 142,
    rodLoadKn: 18.4,
    motorAmps: 38.2,

    liveDynoCard: [],
    normalDynoCard: [],
    anomalyDetected: true,
    anomalyMessage: "Reservoir cooling detected. Viscosity increased to 18,700 cP. SPM 5.2 exceeding fall rate.",
    aiRecommendationApplied: false,

    crankAngle: 0,
    polishedRodPos: 0.5,
    activeSelectedComponent: null
  };
}

// Generate ideal dynamometer card (Load in klb vs Position 0..1)
export function generateNormalDynoCard(strokeMeters: number): DynamometerPoint[] {
  const points: DynamometerPoint[] = [];
  const N = 60;
  const baseStaticLoad = 7.5; // klb fluid + rod weight
  const fluidWeight = 8.5;    // klb

  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    // Harmonic position: 0 (bottom) to 1 (top)
    const position = 0.5 * (1 - Math.cos(t));

    // Elastic rod stretch & fluid load transfer curve
    let load = baseStaticLoad;
    if (Math.sin(t) > 0) {
      // Upstroke: full fluid load + rod acceleration
      const dynamicStretch = Math.sin(t) * 2.8;
      load += fluidWeight + dynamicStretch;
    } else {
      // Downstroke: fluid load transfers to standing valve
      const valveRelease = Math.abs(Math.sin(t)) * 6.8;
      load += Math.max(0.5, fluidWeight - valveRelease);
    }

    points.push({
      position: parseFloat(position.toFixed(3)),
      load: parseFloat(load.toFixed(2))
    });
  }
  return points;
}

// Generate live dynamometer card with potential viscosity distortion / rod floating
export function generateLiveDynoCard(
  strokeMeters: number,
  isAnomaly: boolean,
  viscosityIndex: number,
  spm: number
): DynamometerPoint[] {
  const points: DynamometerPoint[] = [];
  const N = 60;
  const baseStatic = 7.5;
  const fluidWeight = 8.5;

  // Severity multiplier based on viscosity & SPM
  const distortionFactor = isAnomaly ? Math.min(1.8, (viscosityIndex - 0.4) * (spm / 4.5) * 2.2) : 0;

  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const position = 0.5 * (1 - Math.cos(t));

    let load = baseStatic;
    if (Math.sin(t) > 0) {
      // Upstroke
      let dynamicStretch = Math.sin(t) * 2.8;
      if (isAnomaly) {
        // Impact loading spike on upstroke pick-up after rod float!
        if (t < Math.PI * 0.4) {
          dynamicStretch += distortionFactor * 6.5; // Impact spike
        }
      }
      load += fluidWeight + dynamicStretch;
    } else {
      // Downstroke
      let valveRelease = Math.abs(Math.sin(t)) * 6.8;
      if (isAnomaly) {
        // Rod floating: drag forces hold rod string up
        valveRelease += distortionFactor * 5.5;
        load = Math.max(1.2, load + fluidWeight - valveRelease);
      } else {
        load += Math.max(0.5, fluidWeight - valveRelease);
      }
    }

    // Add subtle real-time noise
    const noise = (Math.random() - 0.5) * 0.12;
    points.push({
      position: parseFloat(position.toFixed(3)),
      load: parseFloat(Math.max(1.0, load + noise).toFixed(2))
    });
  }
  return points;
}

// Step function called frame by frame or on timer interval
export function stepSimulation(
  currentState: WellState,
  deltaSeconds: number
): { nextState: WellState; newEvents: AnomalyEvent[] } {
  if (currentState.isPaused) {
    return { nextState: currentState, newEvents: [] };
  }

  const scaledDelta = deltaSeconds * currentState.speedMultiplier;
  let newPhaseTime = currentState.phaseTime + scaledDelta;
  let currentPhase = currentState.phase;
  let newEvents: AnomalyEvent[] = [];

  // Phase transition logic
  if (newPhaseTime >= currentState.phaseDuration) {
    newPhaseTime = 0;
    if (currentPhase === 'INJECTION') {
      currentPhase = 'SOAK';
      newEvents.push({
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: 'SOAK',
        severity: 'info',
        message: 'Steam injection cycle completed. Entering thermal soak phase.'
      });
    } else if (currentPhase === 'SOAK') {
      currentPhase = 'PRODUCTION';
      newEvents.push({
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: 'PRODUCTION',
        severity: 'info',
        message: 'Soak phase complete. Resuming sucker rod pump production cycle.'
      });
    } else {
      currentPhase = 'INJECTION';
      newEvents.push({
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: 'INJECTION',
        severity: 'info',
        message: 'Production cycle finished. Initiating CSS high-pressure steam injection phase.'
      });
    }
  }

  const phaseProgress = newPhaseTime / PHASE_DURATIONS[currentPhase];

  // Calculate SPM & Stroke Length smooth interpolation towards target
  let spm = currentState.spm;
  let strokeLength = currentState.strokeLength;

  if (currentPhase === 'INJECTION') {
    spm = 0.5; // Well shut-in / minimum idle
  } else if (currentPhase === 'SOAK') {
    spm = 0.0; // Shut-in
  } else {
    // PRODUCTION
    // Transition towards target SPM smoothly
    spm += (currentState.targetSpm - spm) * Math.min(1, scaledDelta * 0.8);
    strokeLength += (currentState.targetStrokeLength - strokeLength) * Math.min(1, scaledDelta * 0.8);
  }

  // Calculate Reservoir & Fluid physics based on phase
  let temp = currentState.reservoirTemp;
  let radius = currentState.heatedZoneRadius;
  let viscosityIdx = currentState.fluidViscosityIndex;
  let productionRate = currentState.productionRate;
  let sor = currentState.sor;

  if (currentPhase === 'INJECTION') {
    temp = 48 + phaseProgress * (280 - 48); // Heat up to 280°C
    radius = 5 + phaseProgress * 30;         // Radius expands to 35m
    viscosityIdx = Math.max(0.02, 0.5 * (1 - phaseProgress)); // Highly mobile oil
    productionRate = 0;
    sor = 4.2 - phaseProgress * 0.8;
  } else if (currentPhase === 'SOAK') {
    temp = 280 - phaseProgress * 50;  // 280°C -> 230°C
    radius = 35 - phaseProgress * 3;  // Minor heat diffusion
    viscosityIdx = 0.05 + phaseProgress * 0.05;
    productionRate = 0;
    sor = 3.4;
  } else {
    // PRODUCTION
    const decay = Math.exp(-phaseProgress * 1.5);
    temp = 55 + (220 - 55) * decay;
    radius = 8 + (32 - 8) * decay;

    // Fluid viscosity rises as near-wellbore crude cools
    viscosityIdx = Math.min(0.92, 0.25 + (1 - decay) * 0.70);

    if (currentState.aiRecommendationApplied) {
      viscosityIdx = Math.min(0.55, viscosityIdx * 0.78);
    }

    productionRate = Math.max(15, 60 * decay + (spm / 5.2) * 35);
    sor = 3.5 + (1 - decay) * 1.3;
  }

  const viscositycP = Math.round(1500 + Math.pow(viscosityIdx, 2.2) * 22000); // Up to ~23,500 cP

  // Anomaly evaluation: Rod floating occurs when crude viscosity is high (>0.62) AND SPM is high (>4.9)
  const isViscous = viscosityIdx > 0.62;
  const isHighSpeed = spm > 4.9;
  const shouldTriggerAnomaly = currentPhase === 'PRODUCTION' && isViscous && isHighSpeed && !currentState.aiRecommendationApplied;

  let anomalyDetected = currentState.anomalyDetected;
  let anomalyMessage = currentState.anomalyMessage;

  if (shouldTriggerAnomaly && !anomalyDetected) {
    anomalyDetected = true;
    anomalyMessage = `Reservoir cooling detected. Viscosity increased to ${viscositycP.toLocaleString()} cP over 72h trend. Oil mobility reduction expected.`;
    newEvents.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      phase: 'PRODUCTION',
      severity: 'critical',
      message: `ANOMALY: High fluid drag (${viscositycP.toLocaleString()} cP) causing rod string floating on downstroke!`
    });
  } else if (!shouldTriggerAnomaly && anomalyDetected) {
    anomalyDetected = false;
    anomalyMessage = null;
    newEvents.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      phase: 'PRODUCTION',
      severity: 'info',
      message: 'OPTIMIZATION CLEARED: SRP speed reduced to 4.7 SPM. Kinematics normalized.'
    });
  }

  // Update Pumpjack Kinematic Angle for 3D animation
  const spmRadsPerSec = (spm * 2 * Math.PI) / 60;
  const newCrankAngle = (currentState.crankAngle + spmRadsPerSec * scaledDelta) % (2 * Math.PI);
  const polishedRodPos = 0.5 * (1 - Math.cos(newCrankAngle));

  // Dynamometer cards calculation
  const normalDynoCard = generateNormalDynoCard(strokeLength);
  const liveDynoCard = generateLiveDynoCard(strokeLength, anomalyDetected, viscosityIdx, spm);

  // Compute min/max rod load
  const loads = liveDynoCard.map(p => p.load);
  const minRodLoad = Math.min(...loads);
  const maxRodLoad = Math.max(...loads);

  // Calculate live SCADA telemetry numbers
  const vfdFrequencyHz = Math.round(spm * 8.07); // ~42 Hz at 5.2 SPM
  const energyKwhPerBbl = parseFloat((24.1 - (currentState.aiRecommendationApplied ? 2.7 : 0)).toFixed(1));
  const pumpFillagePercent = currentState.aiRecommendationApplied ? 86 : 78;
  const rodFailureRiskPercent = currentState.aiRecommendationApplied ? 3 : 7;
  const motorAmps = parseFloat((32.0 + (spm / 5.2) * 6.2).toFixed(1));
  const rodLoadKn = parseFloat((maxRodLoad * 4.448).toFixed(1)); // klb to kN

  const nextState: WellState = {
    ...currentState,
    phase: currentPhase,
    phaseTime: newPhaseTime,
    phaseDuration: PHASE_DURATIONS[currentPhase],
    spm: parseFloat(spm.toFixed(1)),
    strokeLength: parseFloat(strokeLength.toFixed(1)),
    vfdFrequencyHz,
    reservoirTemp: parseFloat(temp.toFixed(1)),
    heatedZoneRadius: parseFloat(radius.toFixed(1)),
    fluidViscosityIndex: parseFloat(viscosityIdx.toFixed(3)),
    viscositycP,
    minRodLoad: parseFloat(minRodLoad.toFixed(1)),
    maxRodLoad: parseFloat(maxRodLoad.toFixed(1)),
    productionRate: parseFloat(productionRate.toFixed(1)),
    sor: parseFloat(sor.toFixed(1)),
    energyKwhPerBbl,
    pumpFillagePercent,
    rodFailureRiskPercent,
    motorAmps,
    rodLoadKn,
    normalDynoCard,
    liveDynoCard,
    anomalyDetected,
    anomalyMessage,
    crankAngle: newCrankAngle,
    polishedRodPos
  };

  return { nextState, newEvents };
}
