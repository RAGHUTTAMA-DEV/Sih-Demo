import React from 'react';
import { Html } from '@react-three/drei';
import { CyclePhase } from '../../types/simulation';

interface SpatialAnnotationsProps {
  phase: CyclePhase;
  spm: number;
  strokeLength: number;
  viscositycP: number;
  reservoirTemp: number;
  heatedZoneRadius: number;
  productionRate: number;
  maxRodLoad: number;
  sor: number;
  onSelectComponent: (name: string) => void;
}

export const SpatialAnnotations: React.FC<SpatialAnnotationsProps> = ({
  phase,
  spm,
  strokeLength,
  viscositycP,
  reservoirTemp,
  heatedZoneRadius,
  productionRate,
  maxRodLoad,
  sor,
  onSelectComponent
}) => {
  const wellheadX = -5.4;

  // Calculated live values
  const motorKw = (spm * maxRodLoad * 0.32).toFixed(1);
  const flowlinePsi = Math.round(160 + (spm / 8.0) * 45);
  const rodVelocity = ((spm * strokeLength * 2) / 60).toFixed(2);

  return (
    <group>
      {/* 1. PUMPJACK LIVE POWER & SPM HUD BADGE */}
      <group position={[0, 5.0, 0]}>
        <Html distanceFactor={13} center>
          <div 
            onClick={() => onSelectComponent('Sucker Rod Pumpjack (SRP)')}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-500/80 text-slate-100 text-[11px] font-mono shadow-2xl backdrop-blur-md hover:scale-105 transition-all"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <div>
              <div className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <span>SRP BEAM PUMP</span>
                <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  {spm.toFixed(1)} SPM
                </span>
              </div>
              <div className="text-[9px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Power: <strong className="text-cyan-400">{motorKw} kW</strong></span>
                <span>•</span>
                <span>Peak Load: <strong className="text-emerald-400">{maxRodLoad} klb</strong></span>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* 2. WELLHEAD SURFACE TELEMETRY BADGE */}
      <group position={[wellheadX, 1.4, 0]}>
        <Html distanceFactor={13} center>
          <div
            onClick={() => onSelectComponent('Surface Wellhead & Stuffing Box')}
            className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/95 border border-cyan-500/70 text-slate-100 text-[10px] font-mono shadow-xl backdrop-blur-md hover:border-cyan-400 transition-all"
          >
            <span className="text-cyan-400 text-xs">⚡</span>
            <div>
              <div className="font-bold text-cyan-300 uppercase">Surface Wellhead</div>
              <div className="text-[9px] text-slate-300 flex gap-2">
                <span>Pres: <strong className="text-amber-400">{flowlinePsi} psi</strong></span>
                <span>Flow: <strong className="text-emerald-400">{productionRate} bpd</strong></span>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* 3. DOWNHOLE TUBING & LIVE VISCOSITY BADGE (DEPTH -300M) */}
      <group position={[wellheadX, -4.5, 0]}>
        <Html distanceFactor={13} center>
          <div
            onClick={() => onSelectComponent('Downhole Tubing & Heavy Crude')}
            className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/95 border border-amber-500/70 text-slate-100 text-[10px] font-mono shadow-xl backdrop-blur-md hover:border-amber-400 transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${viscositycP > 300 ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`}></span>
            <div>
              <div className="font-bold text-amber-300 uppercase">Tubing (-300m Depth)</div>
              <div className="text-[9px] text-slate-300 flex gap-2">
                <span>Viscosity: <strong className={viscositycP > 300 ? 'text-red-400 font-bold' : 'text-amber-400'}>{viscositycP} cP</strong></span>
                <span>API: <strong className="text-cyan-400">17.4°</strong></span>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* 4. DOWNHOLE PLUNGER VELOCITY BADGE (DEPTH -800M) */}
      <group position={[wellheadX, -9.5, 0]}>
        <Html distanceFactor={13} center>
          <div
            onClick={() => onSelectComponent('Downhole Plunger & Traveling Valve')}
            className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/95 border border-slate-700 text-slate-100 text-[10px] font-mono shadow-lg backdrop-blur-md hover:border-slate-500 transition-all"
          >
            <span className="text-emerald-400">⚙️</span>
            <div>
              <div className="font-bold text-slate-200 uppercase">SRP Plunger (-800m Depth)</div>
              <div className="text-[9px] text-slate-300 flex gap-2">
                <span>Vel: <strong className="text-emerald-400">{rodVelocity} m/s</strong></span>
                <span>Stroke: <strong className="text-cyan-400">{strokeLength}m</strong></span>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* 5. RESERVOIR STEAM HEATED ZONE BADGE (DEPTH -1050M) */}
      <group position={[wellheadX, -14.2, 0]}>
        <Html distanceFactor={13} center>
          <div
            onClick={() => onSelectComponent('CSS Steam Heated Zone')}
            className="cursor-pointer group flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-red-500/80 text-slate-100 text-[11px] font-mono shadow-2xl backdrop-blur-md hover:scale-105 transition-all"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${phase === 'INJECTION' ? 'bg-cyan-400 animate-ping' : 'bg-red-500'}`}></span>
            <div>
              <div className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <span>CSS HEATED ZONE ({heatedZoneRadius}m)</span>
                <span className="text-[9px] px-1 rounded bg-red-950 text-red-300 border border-red-500/40">
                  {phase}
                </span>
              </div>
              <div className="text-[9px] text-slate-300 flex gap-2.5 mt-0.5">
                <span>Temp: <strong className="text-amber-400">{reservoirTemp}°C</strong></span>
                <span>•</span>
                <span>SOR: <strong className="text-cyan-400">{sor} m³/m³</strong></span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};
