import React from 'react';
import { DynamometerPoint } from '../../types/simulation';
import { Activity, AlertTriangle } from 'lucide-react';

interface DynamometerCard2DProps {
  liveCard: DynamometerPoint[];
  normalCard: DynamometerPoint[];
  isAnomaly: boolean;
  strokeLength: number;
}

export const DynamometerCard2D: React.FC<DynamometerCard2DProps> = ({
  liveCard,
  normalCard,
  isAnomaly,
  strokeLength
}) => {
  const width = 320;
  const height = 160;
  const maxLoad = 30; // Max load 30 klb
  const strokeFeet = (strokeLength * 3.28084).toFixed(1);

  // Generate SVG path strings
  const getSvgPath = (points: DynamometerPoint[]) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      const x = (p.position * (width - 40) + 30).toFixed(1);
      const y = (height - 25 - (p.load / maxLoad) * (height - 40)).toFixed(1);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '') + ' Z';
  };

  const livePath = getSvgPath(liveCard);
  const normalPath = getSvgPath(normalCard);

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      isAnomaly 
        ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50 animate-pulse-border' 
        : 'bg-scada-card border-scada-border'
    }`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-scada-border">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isAnomaly ? 'text-red-400' : 'text-amber-400'}`} />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
            Dynamometer Card (Load vs Stroke)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block border-t border-dashed"></span> Twin Base
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-mono ${isAnomaly ? 'text-red-400 font-bold' : 'text-amber-400'}`}>
            <span className={`w-2.5 h-1 inline-block rounded ${isAnomaly ? 'bg-red-500' : 'bg-amber-400'}`}></span> Live Card
          </span>
        </div>
      </div>

      {/* SVG GRAPH CANVAS */}
      <div className="relative bg-slate-950 rounded p-1 border border-slate-800">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid Lines */}
          {[0, 10, 20, 30].map((val) => {
            const y = height - 25 - (val / maxLoad) * (height - 40);
            return (
              <g key={val}>
                <line x1="30" y1={y} x2={width - 10} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <text x="24" y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Stroke Position Markers */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((pos) => {
            const x = pos * (width - 40) + 30;
            return (
              <g key={pos}>
                <line x1={x} y1="15" x2={x} y2={height - 25} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <text x={x} y={height - 12} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {(pos * parseFloat(strokeFeet)).toFixed(1)}'
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x="6" y={height / 2} fill="#94a3b8" fontSize="8" fontFamily="monospace" transform={`rotate(-90 6 ${height/2})`} textAnchor="middle">
            ROD LOAD (klb)
          </text>
          <text x={width / 2} y={height - 2} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            POLISHED ROD POSITION ({strokeFeet} ft)
          </text>

          {/* Normal Twin Baseline Card */}
          <path d={normalPath} fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Live Dynamometer Card */}
          <path 
            d={livePath} 
            fill={isAnomaly ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.15)'} 
            stroke={isAnomaly ? '#ef4444' : '#f59e0b'} 
            strokeWidth="2.5" 
          />
        </svg>

        {/* Anomaly Gap Banner Overlay */}
        {isAnomaly && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-950/90 text-red-300 border border-red-500/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold animate-bounce">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>CARD DISTORTION DETECTED</span>
          </div>
        )}
      </div>

      {/* FOOTER METRICS */}
      <div className="flex justify-between items-center text-[11px] font-mono mt-2 pt-1 border-t border-slate-800 text-slate-400">
        <div>Downstroke Load Lag: <span className={isAnomaly ? 'text-red-400 font-bold' : 'text-slate-200'}>{isAnomaly ? 'HIGH (-6.8 klb)' : 'Normal (0.2 klb)'}</span></div>
        <div>Twin Correlation: <span className={isAnomaly ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{isAnomaly ? '71.2%' : '98.6%'}</span></div>
      </div>
    </div>
  );
};
