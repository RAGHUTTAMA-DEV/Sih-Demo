import React, { useState } from 'react';
import { WellState } from '../../types/simulation';
import { X, Sliders, Play, RotateCcw, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhatIfModalProps {
  isOpen: boolean;
  wellState: WellState;
  onClose: () => void;
  onApplyParams: (spm: number, steamVol: number, soakHours: number) => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  isOpen,
  wellState,
  onClose,
  onApplyParams
}) => {
  const [simSpm, setSimSpm] = useState<number>(4.7);
  const [simSteamVol, setSimSteamVol] = useState<number>(105);
  const [simSoakHours, setSimSoakHours] = useState<number>(30);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  if (!isOpen) return null;

  // Predictive calculations for what-if scenario
  const predBopd = Math.round(48.6 * (simSpm / 5.2) * (120 / simSteamVol > 0.9 ? 1.08 : 0.95));
  const predViscosity = Math.round(18700 * (30 / simSoakHours > 0.9 ? 0.88 : 1.15));
  const predSor = (4.8 * (simSteamVol / 120)).toFixed(1);
  const predFailureRisk = simSpm < 4.9 ? 3 : 18;

  const handleRunSimulation = () => {
    setIsSimulated(true);
  };

  const handleApply = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#2563eb', '#10b981', '#f59e0b']
    });
    onApplyParams(simSpm, simSteamVol, simSoakHours);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden select-none animate-in fade-in zoom-in duration-200">
        {/* MODAL HEADER */}
        <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">What-If Predictive Simulation</h3>
              <p className="text-[11px] text-slate-400">Well BGW-07 · CSS Cycle 15 Parameter Modeling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4">
          {/* SLIDERS GRID */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* SRP Speed Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>SRP Speed (SPM)</span>
                <span className="font-mono text-blue-600 font-bold">{simSpm.toFixed(1)} SPM</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={simSpm}
                onChange={(e) => {
                  setSimSpm(parseFloat(e.target.value));
                  setIsSimulated(false);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>3.0</span>
                <span>4.7 (AI Rec)</span>
                <span>8.0</span>
              </div>
            </div>

            {/* Steam Volume Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Steam Injection Volume</span>
                <span className="font-mono text-emerald-600 font-bold">{simSteamVol} m³</span>
              </div>
              <input
                type="range"
                min="80"
                max="160"
                step="5"
                value={simSteamVol}
                onChange={(e) => {
                  setSimSteamVol(parseInt(e.target.value));
                  setIsSimulated(false);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>80 m³</span>
                <span>105 m³ (AI Rec)</span>
                <span>160 m³</span>
              </div>
            </div>

            {/* Soak Time Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Thermal Soak Time</span>
                <span className="font-mono text-amber-600 font-bold">{simSoakHours} Hours</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="2"
                value={simSoakHours}
                onChange={(e) => {
                  setSimSoakHours(parseInt(e.target.value));
                  setIsSimulated(false);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>12 hr</span>
                <span>30 hr (AI Rec)</span>
                <span>48 hr</span>
              </div>
            </div>
          </div>

          {/* SIMULATION PREDICTED OUTCOME CARD */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
            <div className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
              72-Hour Predicted Scenario Outcome
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 font-sans font-bold">PRODUCTION</div>
                <div className="text-sm font-black text-emerald-600">{predBopd} BOPD</div>
                <div className="text-[9px] text-emerald-700">+8.2% vs cur</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 font-sans font-bold font-mono">VISCOSITY</div>
                <div className="text-sm font-black text-slate-800">{predViscosity.toLocaleString()} cP</div>
                <div className="text-[9px] text-emerald-700">-12% reduced</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 font-sans font-bold">EXP. SOR</div>
                <div className="text-sm font-black text-blue-600">{predSor}</div>
                <div className="text-[9px] text-blue-700">-11% energy</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 font-sans font-bold">FAILURE RISK</div>
                <div className={`text-sm font-black ${predFailureRisk < 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {predFailureRisk}%
                </div>
                <div className="text-[9px] text-slate-500">Low Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Model Parameters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
