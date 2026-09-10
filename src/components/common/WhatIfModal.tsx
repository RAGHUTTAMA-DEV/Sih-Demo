import React, { useState } from "react";
import {
  WhatIfInputParams,
  calculateWhatIfPrediction,
  NOMINAL_BASELINE
} from "../../services/whatIfEngine";

interface WhatIfModalProps {
  onClose: () => void;
  onApplyToLiveTwin?: (params: {
    spm: number;
    steamVol: number;
    soakTime: number;
    strokeLen: number;
    injPressure: number;
    vfd: number;
    predTemp: number;
    predVisc: number;
    predProd: number;
    predPlumeRadius: number;
  }) => void;
}

export function WhatIfModal({ onClose, onApplyToLiveTwin }: WhatIfModalProps) {
  const [params, setParams] = useState<WhatIfInputParams>({
    steamVol: 120,
    injPressure: 8.4,
    soakTime: 36,
    strokeLen: 100,
    spm: 5.2,
    vfd: 42,
  });

  const pred = calculateWhatIfPrediction(params);

  const updateParam = (key: keyof WhatIfInputParams, val: number) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    if (onApplyToLiveTwin) {
      onApplyToLiveTwin({
        spm: params.spm,
        steamVol: params.steamVol,
        soakTime: params.soakTime,
        strokeLen: params.strokeLen,
        injPressure: params.injPressure,
        vfd: params.vfd,
        predTemp: pred.tempC,
        predVisc: pred.viscositycP,
        predProd: pred.productionBOPD,
        predPlumeRadius: pred.heatedPlumeRadiusM,
      });
    }
    onClose();
  };

  const resetDefaults = () => {
    setParams({
      steamVol: 120,
      injPressure: 8.4,
      soakTime: 36,
      strokeLen: 100,
      spm: 5.2,
      vfd: 42,
    });
  };

  const renderSlider = (
    label: string,
    key: keyof WhatIfInputParams,
    min: number,
    max: number,
    step: number,
    unit: string,
    description: string
  ) => (
    <div className="mb-3.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
      <div className="flex justify-between items-baseline text-xs mb-1">
        <div>
          <span className="text-slate-800 font-semibold">{label}</span>
          <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">({description})</span>
        </div>
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
          {params[key]} <span className="font-normal text-slate-400">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[key]}
        onChange={(e) => updateParam(key, parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-600 bg-slate-200 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              ∑
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What-If SCADA Predictive Simulation</h3>
              <p className="text-xs text-slate-500">Thermodynamic & Mechanical Kinematics Solver (BGW-07)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="text-xs text-slate-600 bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-blue-600 font-bold text-sm leading-none">ℹ</span>
            <span>
              Adjust input parameters below to simulate reservoir heating, fluid viscosity reduction, pump displacement, and rod string mechanical stress in real time.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderSlider("Steam Volume", "steamVol", 60, 200, 5, "m³", "Cyclic Steam Volume")}
            {renderSlider("Injection Pressure", "injPressure", 6.0, 14.0, 0.2, "bar", "Wellhead Steam Pressure")}
            {renderSlider("Soak Time", "soakTime", 12, 72, 2, "hrs", "Thermal Soak Period")}
            {renderSlider("Stroke Length", "strokeLen", 64, 144, 4, "in", "Surface Unit Polish Rod")}
            {renderSlider("Stroke Rate (SPM)", "spm", 2.0, 8.5, 0.1, "SPM", "SRP Pumping Speed")}
            {renderSlider("VFD Frequency", "vfd", 30, 60, 1, "Hz", "Motor Inverter Frequency")}
          </div>

          {/* Predictions Result Box */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Predicted Output Metrics vs Baseline
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Model: Multiphase CSS-SRP v2.4
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Production */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Oil Production</div>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                  {pred.productionBOPD} <span className="text-xs font-normal text-slate-400">BOPD</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${pred.productionDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {pred.productionDelta >= 0 ? `+${pred.productionDelta}` : pred.productionDelta} vs base
                </div>
              </div>

              {/* Reservoir Temp */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Reservoir Temp</div>
                <div className="text-base font-bold font-mono text-orange-600 mt-0.5">
                  {pred.tempC} <span className="text-xs font-normal text-slate-400">°C</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${pred.tempDelta >= 0 ? "text-orange-600" : "text-blue-600"}`}>
                  {pred.tempDelta >= 0 ? `+${pred.tempDelta}` : pred.tempDelta}°C vs base
                </div>
              </div>

              {/* Viscosity */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Fluid Viscosity</div>
                <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                  {pred.viscositycP.toLocaleString()} <span className="text-xs font-normal text-slate-400">cP</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${pred.viscosityDelta <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {pred.viscosityDelta <= 0 ? `${pred.viscosityDelta}` : `+${pred.viscosityDelta}`} cP
                </div>
              </div>

              {/* SOR */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Steam-Oil Ratio (SOR)</div>
                <div className="text-base font-bold font-mono text-purple-700 mt-0.5">
                  {pred.sor}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${pred.sorDelta <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {pred.sorDelta >= 0 ? `+${pred.sorDelta}` : pred.sorDelta} vs base
                </div>
              </div>

              {/* Energy */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Energy Consumption</div>
                <div className="text-base font-bold font-mono text-sky-700 mt-0.5">
                  {pred.energyKWhPerBbl} <span className="text-xs font-normal text-slate-400">kWh/bbl</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${pred.energyDelta <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {pred.energyDelta >= 0 ? `+${pred.energyDelta}` : pred.energyDelta} kWh
                </div>
              </div>

              {/* Rod Risk */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Rod Failure Risk</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${pred.rodFailureRiskPercent > 18 ? "text-red-600" : pred.rodFailureRiskPercent > 10 ? "text-amber-600" : "text-emerald-600"}`}>
                  {pred.rodFailureRiskPercent}%
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  PPRL: {pred.peakRodLoadKN} kN
                </div>
              </div>
            </div>

            {/* Extra detail strip */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-3 pt-2.5 border-t border-slate-200/70">
              <span>Pump Fillage: <strong className="text-slate-800">{pred.pumpFillagePercent}%</strong></span>
              <span>Heated Plume Radius: <strong className="text-slate-800">{pred.heatedPlumeRadiusM}m</strong></span>
              <span>Motor Current: <strong className="text-slate-800">{pred.motorAmps} A</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={resetDefaults}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Reset Defaults
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #0a1628, #1e3a6e)" }}
            >
              <span>⚡</span>
              <span>Apply to Live Digital Twin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
