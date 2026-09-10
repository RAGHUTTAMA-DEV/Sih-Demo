// Physically consistent What-If Simulation Engine for CSS + Sucker Rod Pump

export interface WhatIfInputParams {
  steamVol: number;     // m3, e.g. 60 - 200 (nominal 120)
  injPressure: number;  // bar, e.g. 6.0 - 14.0 (nominal 8.4)
  soakTime: number;     // hours, e.g. 12 - 72 (nominal 36)
  strokeLen: number;    // inches, e.g. 64 - 144 (nominal 100)
  spm: number;          // strokes per min, e.g. 2.0 - 8.5 (nominal 5.2)
  vfd: number;          // Hz, e.g. 30 - 60 (nominal 42)
}

export interface WhatIfPredictionResult {
  productionBOPD: number;
  productionDelta: number;
  tempC: number;
  tempDelta: number;
  viscositycP: number;
  viscosityDelta: number;
  sor: number;
  sorDelta: number;
  energyKWhPerBbl: number;
  energyDelta: number;
  rodFailureRiskPercent: number;
  rodRiskDelta: number;
  pumpFillagePercent: number;
  heatedPlumeRadiusM: number;
  motorAmps: number;
  peakRodLoadKN: number;
}

// Baseline reference values at nominal state (120m3, 8.4 bar, 36h, 100", 5.2 SPM, 42 Hz)
export const NOMINAL_BASELINE = {
  productionBOPD: 48.6,
  tempC: 62.4,
  viscositycP: 18700,
  sor: 4.8,
  energyKWhPerBbl: 21.4,
  rodFailureRiskPercent: 7.0,
};

export function calculateWhatIfPrediction(params: WhatIfInputParams): WhatIfPredictionResult {
  const { steamVol, injPressure, soakTime, strokeLen, spm, vfd } = params;

  // 1. Thermodynamic Reservoir Temperature (°C)
  // Latent heat injected vs conductive dissipation into cap/base rock
  const steamFactor = (steamVol - 120) * 0.085;
  const pressFactor = (injPressure - 8.4) * 0.95;
  const soakCooling = Math.max(0, soakTime - 40) * 0.07;
  const tempC = Math.max(52.0, Math.min(76.0, +(58.5 + steamFactor + pressFactor - soakCooling).toFixed(1)));

  // 2. Heated Plume Radius (m)
  const heatedPlumeRadiusM = +(14.2 + (steamVol - 100) * 0.065 + (soakTime / 36) * 1.1).toFixed(1);

  // 3. Fluid Viscosity (cP) via Arrhenius/Andrade Equation for Heavy Crude
  // Heavy crude at Baghewala: ~28,000 cP at 52°C down to ~12,000 cP at 72°C
  const rawVisc = 85000 * Math.exp(-0.0245 * tempC);
  const viscositycP = Math.max(9500, Math.min(32000, Math.round(rawVisc)));

  // 4. Pump Fillage Efficiency (%)
  // Restricted by high viscosity at suction valve and high SPM (incomplete cylinder fill)
  const viscFillagePenalty = ((viscositycP - 12000) / 10000) * 4.2;
  const speedFillagePenalty = Math.max(0, spm - 5.5) * 5.0;
  const pumpFillagePercent = Math.max(50, Math.min(95, Math.round(86 - viscFillagePenalty - speedFillagePenalty)));

  // 5. Liquid Production Rate (BOPD)
  // Q = Theoretical displacement * fillage * reservoir mobility factor
  const displacementFactor = (strokeLen / 100) * (spm / 5.2);
  const fillageFactor = pumpFillagePercent / 78.0;
  const mobilityFactor = 1.0 + (tempC - 58.0) * 0.018;
  const productionBOPD = Math.max(18.0, Math.min(68.0, +(44.0 * displacementFactor * fillageFactor * mobilityFactor).toFixed(1)));

  // 6. Steam-Oil Ratio (SOR, m3 steam / bbl oil equivalent)
  const sor = +(steamVol / (productionBOPD * 0.21)).toFixed(2);

  // 7. Electrical Energy Consumption (kWh/bbl)
  // Dependent on motor load, stroke rate, fluid drag
  const fluidDragFactor = (viscositycP / 18000) * 1.8;
  const energyKWhPerBbl = Math.max(15.0, Math.min(32.0, +(16.5 + (spm / 5.2) * 2.8 + fluidDragFactor + (vfd - 42) * 0.12).toFixed(1)));

  // 8. Rod Stress & Failure Risk (%)
  // Fluid friction on downstroke causes rod float / compression; fast upstroke causes high peak tension
  const spmRiskFactor = Math.pow(spm / 5.2, 1.8) * 3.5;
  const viscDragRisk = ((viscositycP - 14000) / 10000) * 4.0;
  const fillagePoundingRisk = Math.max(0, 75 - pumpFillagePercent) * 0.35;
  const rodFailureRiskPercent = Math.max(2, Math.min(48, Math.round(spmRiskFactor + viscDragRisk + fillagePoundingRisk)));

  // Additional engineering outputs
  const motorAmps = +(30 + (vfd / 42) * 6 + (spm / 5.2) * 3 + (viscositycP / 20000) * 2.5).toFixed(1);
  const peakRodLoadKN = +(15.0 + (strokeLen / 100) * 2.5 + (spm / 5.2) * 1.8 + (viscositycP / 20000) * 1.5).toFixed(1);

  return {
    productionBOPD,
    productionDelta: +(productionBOPD - NOMINAL_BASELINE.productionBOPD).toFixed(1),
    tempC,
    tempDelta: +(tempC - NOMINAL_BASELINE.tempC).toFixed(1),
    viscositycP,
    viscosityDelta: viscositycP - NOMINAL_BASELINE.viscositycP,
    sor,
    sorDelta: +(sor - NOMINAL_BASELINE.sor).toFixed(2),
    energyKWhPerBbl,
    energyDelta: +(energyKWhPerBbl - NOMINAL_BASELINE.energyKWhPerBbl).toFixed(1),
    rodFailureRiskPercent,
    rodRiskDelta: +(rodFailureRiskPercent - NOMINAL_BASELINE.rodFailureRiskPercent).toFixed(1),
    pumpFillagePercent,
    heatedPlumeRadiusM,
    motorAmps,
    peakRodLoadKN,
  };
}
