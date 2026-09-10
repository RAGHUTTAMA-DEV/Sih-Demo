import React, { useState } from "react";

export function DigitalTwinViz({ mode }: { mode: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const tips: Record<string, string> = {
    pump: "Downhole Pump | Fillage: 78% | SPM: 5.2 | 310m depth",
    "temp-deep": "Temp Sensor | 68.2°C | Depth: 280m",
    "temp-mid": "Temp Sensor | 62.4°C | Depth: 180m",
    "press-down": "Pressure Sensor | BHP: 14.2 bar | Depth: 310m",
    "press-surf": "Wellhead Pressure | 8.4 bar | Surface",
    "fluid-level": "Dynamic Fluid Level | 142m | Annular",
  };
  const showThermal = mode === "thermal" || mode === "twin";
  const showFlow = mode === "flow" || mode === "twin";

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-white rounded-xl overflow-hidden">
      {hovered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl font-mono whitespace-nowrap pointer-events-none border border-slate-700">
          {tips[hovered] || hovered}
        </div>
      )}
      <svg width="100%" height="100%" viewBox="0 0 320 560" preserveAspectRatio="xMidYMid meet" className="max-h-[560px]">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
          <radialGradient id="thermalZ" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="aD" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
          </marker>
          <marker id="aU" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#fbbf24" />
          </marker>
          <marker id="aS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" />
          </marker>
        </defs>

        {/* Atmosphere & Geology Strata */}
        <rect x="0" y="0" width="320" height="90" fill="url(#skyG)" />
        <rect x="0" y="90" width="320" height="470" fill="#f5f0e8" />
        <rect x="0" y="90" width="320" height="60" fill="#d1c5a8" opacity="0.5" />
        <text x="8" y="126" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Cap Rock / Shale</text>
        <rect x="0" y="150" width="320" height="100" fill="#c9b99a" opacity="0.4" />
        <text x="8" y="205" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Sandstone Formation</text>
        <rect x="0" y="250" width="320" height="170" fill="#b8996a" opacity="0.4" />
        {[...Array(8)].map((_, i) => (
          <ellipse key={i} cx={20 + i * 36} cy={340 + (i % 3) * 12} rx={14} ry={6} fill="#92400e" opacity={0.18 + (i % 3) * 0.06} />
        ))}
        {showThermal && <ellipse cx="160" cy="360" rx="92" ry="68" fill="url(#thermalZ)" opacity="0.85" />}
        {showThermal && (
          <>
            <ellipse cx="160" cy="360" rx="74" ry="52" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
            <ellipse cx="160" cy="360" rx="52" ry="36" fill="none" stroke="#ea580c" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          </>
        )}
        <rect x="0" y="420" width="320" height="140" fill="#9c7c5e" opacity="0.5" />
        <text x="8" y="450" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Base Rock</text>
        <line x1="0" y1="90" x2="320" y2="90" stroke="#78716c" strokeWidth="1.5" />
        {[...Array(20)].map((_, i) => (
          <line key={i} x1={i * 16} y1="90" x2={i * 16 - 8} y2="98" stroke="#78716c" strokeWidth="0.8" opacity="0.5" />
        ))}

        {/* Wellbore and Tubing Strings */}
        <rect x="146" y="88" width="28" height="360" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="150" y="88" width="20" height="360" fill="none" stroke="#64748b" strokeWidth="1" />
        <rect x="154" y="88" width="12" height="350" fill="none" stroke="#0ea5e9" strokeWidth="1.2" />
        <line x1="160" y1="0" x2="160" y2="340" stroke="#475569" strokeWidth="2.5" strokeDasharray="12 4" />

        {/* Downhole SRP Pump */}
        <rect
          x="153"
          y="338"
          width="14"
          height="28"
          rx="2"
          fill="#0a1628"
          stroke="#22d3ee"
          strokeWidth="2"
          filter="url(#glow)"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHovered("pump")}
          onMouseLeave={() => setHovered(null)}
        />
        <text x="160" y="355" textAnchor="middle" fill="#22d3ee" fontSize="7" fontFamily="JetBrains Mono">PUMP</text>
        <line x1="143" y1="220" x2="177" y2="220" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
        <circle cx="142" cy="220" r="3" fill="#3b82f6" />

        {/* Animated Fluid Flow Lines */}
        {showFlow && (
          <>
            <line x1="157" y1="366" x2="157" y2="100" stroke="#fbbf24" strokeWidth="1.5" className="flow-line-up" markerEnd="url(#aU)" opacity="0.8" />
            <line x1="163" y1="366" x2="163" y2="100" stroke="#fbbf24" strokeWidth="1.5" className="flow-line-up" opacity="0.6" style={{ animationDelay: "0.9s" }} />
            <path d="M 60 310 Q 100 330 145 350" fill="none" stroke="#f97316" strokeWidth="2.5" className="flow-line-down" markerEnd="url(#aS)" opacity="0.85" />
            <path d="M 75 300 Q 105 320 145 345" fill="none" stroke="#fb923c" strokeWidth="1.5" className="flow-line-down" opacity="0.5" style={{ animationDelay: "1.2s" }} />
          </>
        )}

        {/* Steam Injection Line */}
        <rect x="55" y="88" width="10" height="240" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
        <rect x="57" y="80" width="6" height="14" rx="1" fill="#f97316" opacity="0.8" />

        {/* Heavy Oil Inflow arrows */}
        {showFlow && [[70, 340], [100, 355], [120, 345], [200, 350], [220, 340], [245, 355]].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} L ${x + 12} ${y - 3}`} stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#aU)" opacity="0.6" className="flow-line-up" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}

        {/* SCADA Sensor Markers */}
        {[
          { id: "temp-deep", x: 179, y: 320, color: "#f97316", label: "T" },
          { id: "temp-mid", x: 179, y: 220, color: "#fb923c", label: "T" },
          { id: "press-down", x: 179, y: 360, color: "#22d3ee", label: "P" },
          { id: "press-surf", x: 179, y: 115, color: "#22d3ee", label: "P" },
          { id: "fluid-level", x: 139, y: 220, color: "#3b82f6", label: "FL" },
        ].map(({ id, x, y, color, label }) => (
          <g key={id} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}>
            <circle cx={x} cy={y} r={6} fill={color} opacity="0.2" className="sensor-pulse" />
            <circle cx={x} cy={y} r={4} fill={color} opacity="0.9" filter="url(#glow)" />
            <text x={x + 9} y={y + 3} fontSize="6" fill={color} fontFamily="JetBrains Mono" fontWeight="600">{label}</text>
          </g>
        ))}

        {/* Surface Equipment */}
        <rect x="126" y="80" width="68" height="10" rx="2" fill="#334155" />
        <rect x="128" y="62" width="64" height="6" rx="2" fill="#1e293b" />
        <rect x="157" y="62" width="6" height="20" fill="#1e293b" />
        <circle cx="186" cy="74" r="10" fill="none" stroke="#334155" strokeWidth="3" />
        <line x1="186" y1="68" x2="186" y2="80" stroke="#64748b" strokeWidth="2" />
        <path d="M 128 62 Q 125 55 130 48 L 148 48 Q 152 58 148 62 Z" fill="#0a1628" stroke="#22d3ee" strokeWidth="1.5" />
        <line x1="138" y1="54" x2="160" y2="54" stroke="#94a3b8" strokeWidth="2" />
        <rect x="188" y="68" width="28" height="20" rx="3" fill="#0f2040" stroke="#3b6cc8" strokeWidth="1.5" />
        <text x="202" y="81" textAnchor="middle" fill="#5a8cdd" fontSize="7" fontFamily="JetBrains Mono" fontWeight="600">VFD</text>
        <rect x="152" y="82" width="16" height="10" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

        {/* Labels & Depth scales */}
        {showThermal && <text x="224" y="308" fill="#ea580c" fontSize="8" fontFamily="Inter" fontWeight="600">Thermal Zone</text>}
        <text x="205" y="375" fill="#92400e" fontSize="8" fontFamily="Inter" fontWeight="600">Heavy Oil</text>
        <text x="205" y="390" fill="#78716c" fontSize="7" fontFamily="Inter">Reservoir · 310m</text>
        {showFlow && <text x="30" y="295" fill="#f97316" fontSize="8" fontFamily="Inter" fontWeight="600">Steam Inj.</text>}
        <text x="182" y="352" fill="#22d3ee" fontSize="7" fontFamily="Inter">Dnhole Pump</text>
        <text x="182" y="224" fill="#3b82f6" fontSize="7" fontFamily="Inter">Fluid Level</text>
        {mode === "twin" && (
          <>
            <rect x="2" y="2" width="316" height="556" rx="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
            <text x="160" y="18" textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">2D SCHEMATIC · BGW-07</text>
          </>
        )}
        <text x="290" y="108" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−100m</text>
        <text x="290" y="178" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−180m</text>
        <text x="290" y="233" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−240m</text>
        <text x="290" y="355" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−360m</text>
      </svg>
    </div>
  );
}
