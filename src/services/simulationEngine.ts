import { CyclePhase, WellState, DynamometerPoint, AnomalyEvent } from '../types/simulation';

export const PHASE_DURATIONS: Record<CyclePhase, number> = {
  INJECTION: 30, // 30 seconds
  SOAK: 20,      // 20 seconds
  PRODUCTION: 90 // 90 seconds
};

// Initial state creator
export function getInitialState(): WellState {
  return {
    phase: 'PRODUCTION',
    phaseTime: 15,
    phaseDuration: PHASE_DURATIONS.PRODUCTION,
    isPaused: false,
    speedMultiplier: 1,

    spm: 8.0,
    strokeLength: 2.8,
    targetSpm: 8.0,
    targetStrokeLength: 2.8,

    reservoirTemp: 185,
    heatedZoneRadius: 26.5,
    fluidViscosityIndex: 0.25,
    viscositycP: 110,
    minRodLoad: 5.2,
    maxRodLoad: 18.4,
    productionRate: 210,
    sor: 2.9,

    liveDynoCard: [],
    normalDynoCard: [],
    anomalyDetected: false,
    anomalyMessage: null,
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
  const strokeFeet = strokeMeters * 3.28084;
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
  const distortionFactor = isAnomaly ? Math.min(1.8, (viscosityIndex - 0.5) * (spm / 5.0) * 2.5) : 0;

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
          dynamicStretch += distortionFactor * 7.5; // Severe impact spike up to ~27 klb
        }
      }
      load += fluidWeight + dynamicStretch;
    } else {
      // Downstroke
      let valveRelease = Math.abs(Math.sin(t)) * 6.8;
      if (isAnomaly) {
        // Rod floating: drag forces hold rod string up, causing line tension drop to ~1.5 klb
        valveRelease += distortionFactor * 6.0;
        load = Math.max(1.2, load + fluidWeight - valveRelease);
      } else {
        load += Math.max(0.5, fluidWeight - valveRelease);
      }
    }

    // Add subtle real-time noise
    const noise = (Math.random() - 0.5) * 0.15;
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
      // Reset AI recommendation application for next cycle demo
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
    // Temperature decays exponentially during production
    const decay = Math.exp(-phaseProgress * 2.2);
    temp = 48 + (230 - 48) * decay;
    radius = 8 + (32 - 8) * decay;

    // Fluid viscosity index rises as near-wellbore oil cools (17-19° API heavy crude)
    viscosityIdx = Math.min(0.95, 0.08 + (1 - decay) * 0.88);

    // If AI recommendation applied, lower SPM reduces viscous heating/frictional resistance
    if (currentState.aiRecommendationApplied) {
      viscosityIdx = Math.min(0.62, viscosityIdx * 0.85);
    }

    productionRate = Math.max(25, 260 * decay + (spm / 8.0) * 40);
    sor = 2.1 + (1 - decay) * 1.8;
  }

  const viscositycP = Math.round(35 + Math.pow(viscosityIdx, 2.5) * 445); // 35 cP up to 480 cP

  // Anomaly evaluation: Rod floating occurs when crude viscosity is high (>0.68) AND SPM is high (>6.5)
  const isViscous = viscosityIdx > 0.68;
  const isHighSpeed = spm > 6.5;
  const shouldTriggerAnomaly = currentPhase === 'PRODUCTION' && isViscous && isHighSpeed && !currentState.aiRecommendationApplied;

  let anomalyDetected = currentState.anomalyDetected;
  let anomalyMessage = currentState.anomalyMessage;

  if (shouldTriggerAnomaly && !anomalyDetected) {
    anomalyDetected = true;
    anomalyMessage = `CRITICAL: Viscosity reached ${viscositycP} cP. High SPM (${spm.toFixed(1)}) causing severe Rod Floating & Impact Loading!`;
    newEvents.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      phase: 'PRODUCTION',
      severity: 'critical',
      message: `ANOMALY: High fluid drag (${viscositycP} cP) causing rod string floating on downstroke. Peak rod load spike detected!`
    });
  } else if (!shouldTriggerAnomaly && anomalyDetected) {
    // Cleared!
    anomalyDetected = false;
    anomalyMessage = null;
    newEvents.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      phase: 'PRODUCTION',
      severity: 'info',
      message: 'OPTIMIZATION CLEARED: Sucker rod kinematics restored to normal. Impact loading eliminated.'
    });
  }

  // Update Pumpjack Kinematic Angle for 3D animation
  const spmRadsPerSec = (spm * 2 * Math.PI) / 60;
  const newCrankAngle = (currentState.crankAngle + spmRadsPerSec * scaledDelta) % (2 * Math.PI);
  // Polished rod position: 0 (top stroke) to 1 (bottom stroke)
  const polishedRodPos = 0.5 * (1 - Math.cos(newCrankAngle));

  // Dynamometer cards calculation
  const normalDynoCard = generateNormalDynoCard(strokeLength);
  const liveDynoCard = generateLiveDynoCard(strokeLength, anomalyDetected, viscosityIdx, spm);

  // Compute min/max rod load
  const loads = liveDynoCard.map(p => p.load);
  const minRodLoad = Math.min(...loads);
  const maxRodLoad = Math.max(...loads);

  const nextState: WellState = {
    ...currentState,
    phase: currentPhase,
    phaseTime: newPhaseTime,
    phaseDuration: PHASE_DURATIONS[currentPhase],
    spm: parseFloat(spm.toFixed(2)),
    strokeLength: parseFloat(strokeLength.toFixed(2)),
    reservoirTemp: Math.round(temp),
    heatedZoneRadius: parseFloat(radius.toFixed(1)),
    fluidViscosityIndex: parseFloat(viscosityIdx.toFixed(3)),
    viscositycP,
    minRodLoad: parseFloat(minRodLoad.toFixed(1)),
    maxRodLoad: parseFloat(maxRodLoad.toFixed(1)),
    productionRate: Math.round(productionRate),
    sor: parseFloat(sor.toFixed(2)),
    normalDynoCard,
    liveDynoCard,
    anomalyDetected,
    anomalyMessage,
    crankAngle: newCrankAngle,
    polishedRodPos
  };

  return { nextState, newEvents };
}
