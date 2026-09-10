import React from 'react';
import { Html } from '@react-three/drei';
import { DynamometerPoint } from '../../types/simulation';

interface DynamometerGhostOverlayProps {
  liveCard: DynamometerPoint[];
  normalCard: DynamometerPoint[];
  isAnomaly: boolean;
}

export const DynamometerGhostOverlay: React.FC<DynamometerGhostOverlayProps> = ({
  liveCard,
  normalCard,
  isAnomaly
}) => {
  const width = 170;
  const height = 95;

  const getPath = (points: DynamometerPoint[]) => {
    if (!points || points.length === 0) return '';
    const maxLoad = 28.0; // Scale 0-28 klb
    return points.reduce((acc, p, idx) => {
      const x = (p.position * (width - 20) + 10).toFixed(1);
      const y = (height - 10 - (p.load / maxLoad) * (height - 20)).toFixed(1);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '') + ' Z';
  };

  const livePath = getPath(liveCard);
  const normalPath = getPath(normalCard);

  return (
    <group position={[3.8, 3.8, 0]}>
      {/* Non-mirrored billboarding HTML HUD */}
      <Html center distanceFactor={11} zIndexRange={[100, 0]}>
        <div className={`p-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 w-56 select-none ${
          isAnomaly 
            ? 'bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50' 
            : 'bg-slate-900/90 border-slate-700 text-slate-100'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10">
            <span className="text-[10px] font-mono tracking-wider text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`}></span>
              3D Dyno Ghost HUD
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isAnomaly ? 'bg-red-600 text-white' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isAnomaly ? 'ANOMALY' : 'NORMAL'}
            </span>
          </div>

          {/* SVG Dynamometer Curve */}
          <div className="relative bg-slate-950/90 rounded-lg border border-white/10 p-1.5">
            <svg width={width} height={height} className="overflow-visible">
              {/* Grid Lines */}
              <line x1="10" y1="10" x2={width-10} y2="10" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="10" y1={height/2} x2={width-10} y2={height/2} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="10" y1={height-10} x2={width-10} y2={height-10} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Twin Baseline Card (Dashed Cyan) */}
              <path d={normalPath} fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Live Dyno Card (Solid Amber or Red) */}
              <path 
                d={livePath} 
                fill={isAnomaly ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.15)'} 
                stroke={isAnomaly ? '#ef4444' : '#f59e0b'} 
                strokeWidth="2.2" 
              />
            </svg>

            {/* Labels */}
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-1">
              <span>Bottom Stroke</span>
              <span className="text-amber-400 font-bold">Position vs Load</span>
              <span>Top Stroke</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};
