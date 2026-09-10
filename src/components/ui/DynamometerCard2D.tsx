import React from 'react';
import { WellState, DynamometerPoint } from '../../types/simulation';
import { Activity, AlertTriangle } from 'lucide-react';

interface DynamometerCard2DProps {
  wellState: WellState;
}

export const DynamometerCard2D: React.FC<DynamometerCard2DProps> = ({ wellState }) => {
  const width = 300;
  const height = 140;
  const maxLoad = 30; // Max load 30 klb
  const strokeFeet = (wellState.strokeLength * 3.28084).toFixed(1);
  const isAnomaly = wellState.anomalyDetected;

  // Generate SVG path strings
  const getSvgPath = (points: DynamometerPoint[]) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      const x = (p.position * (width - 40) + 30).toFixed(1);
      const y = (height - 25 - (p.load / maxLoad) * (height - 40)).toFixed(1);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '') + ' Z';
  };

  const livePath = getSvgPath(wellState.liveDynoCard);
  const normalPath = getSvgPath(wellState.normalDynoCard);

  return (
    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
        <span className="text-slate-600 text-[11px]">Dynamometer Card</span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-slate-400 font-mono">
            <span className="w-2 h-0.5 bg-slate-400 inline-block"></span> Base
          </span>
          <span className="flex items-center gap-1 text-slate-900 font-bold font-mono">
            <span className="w-2 h-0.5 bg-slate-900 inline-block"></span> Live
          </span>
        </div>
      </div>

      {/* SVG GRAPH CANVAS */}
      <div className="relative bg-white rounded-lg p-1 border border-slate-200 shadow-inner">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid Lines */}
          {[0, 10, 20, 30].map((val) => {
            const y = height - 25 - (val / maxLoad) * (height - 40);
            return (
              <g key={val}>
                <line x1="30" y1={y} x2={width - 10} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="24" y={y + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Normal Twin Baseline Card */}
          <path d={normalPath} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Live Dynamometer Card */}
          <path 
            d={livePath} 
            fill={isAnomaly ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.05)'} 
            stroke={isAnomaly ? '#ef4444' : '#0f172a'} 
            strokeWidth="2" 
          />
        </svg>
      </div>
    </div>
  );
};
