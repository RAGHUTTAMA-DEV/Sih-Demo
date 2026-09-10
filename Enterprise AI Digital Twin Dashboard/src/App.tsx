import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  Legend, RadialBarChart, RadialBar, ComposedChart,
} from "recharts";

// ─── HISTORICAL DATASETS ─────────────────────────────────────────────────────

const PERIODS = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
  "Last 6 Months": 180,
  "Last 1 Year": 365,
  "All Time": 730,
};

function genDailyData(days: number) {
  const arr = [];
  let temp = 58, prod = 38, visc = 22000, sor = 5.5, energy = 24.5, rod = 4, bhp = 13.2, wc = 18;
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    // simulate CSS cycles every ~20 days
    const cyclePhase = (days - i) % 22;
    if (cyclePhase < 3) { temp += 2.1; visc -= 1200; }
    else if (cyclePhase < 5) { temp += 0.5; }
    else if (cyclePhase < 12) { prod += 0.4; temp -= 0.3; sor -= 0.03; }
    else { temp -= 0.25; prod -= 0.2; visc += 180; sor += 0.04; }
    temp = Math.max(52, Math.min(70, temp + (Math.random() - 0.5) * 0.6));
    prod = Math.max(28, Math.min(56, prod + (Math.random() - 0.5) * 0.8));
    visc = Math.max(14000, Math.min(28000, visc + (Math.random() - 0.5) * 300));
    sor = Math.max(3.8, Math.min(6.5, sor + (Math.random() - 0.5) * 0.07));
    energy = Math.max(18, Math.min(28, 0.45 * (visc / 1000) + 10.5 + (Math.random() - 0.5) * 0.4));
    rod = Math.max(2, Math.min(22, rod + (Math.random() - 0.5) * 0.5 + (visc > 21000 ? 0.15 : -0.1)));
    bhp = Math.max(11, Math.min(17, 13.5 - (temp - 58) * 0.05 + (Math.random() - 0.5) * 0.2));
    wc = Math.max(10, Math.min(35, 18 + (days - i) * 0.02 + (Math.random() - 0.5) * 1.2));
    arr.push({
      date: label, day: days - i + 1,
      temp: +temp.toFixed(1), prod: +prod.toFixed(1),
      visc: Math.round(visc), sor: +sor.toFixed(2),
      energy: +energy.toFixed(1), rod: +rod.toFixed(1),
      bhp: +bhp.toFixed(1), wc: +wc.toFixed(1),
      fluidLevel: Math.round(130 + (visc - 18000) / 400 + Math.random() * 8),
    });
  }
  return arr;
}

function genCSSCycles() {
  return Array.from({ length: 14 }, (_, i) => ({
    cycle: `C${i + 1}`,
    steamVol: Math.round(110 + (Math.random() - 0.5) * 30),
    injPress: +(8.0 + (Math.random() - 0.5) * 1.2).toFixed(1),
    soakTime: Math.round(32 + (Math.random() - 0.5) * 10),
    peakProd: +(42 + i * 0.5 + (Math.random() - 0.5) * 4).toFixed(1),
    sor: +(5.2 - i * 0.03 + (Math.random() - 0.5) * 0.3).toFixed(2),
    duration: Math.round(18 + (Math.random() - 0.5) * 8),
  }));
}

function genRodHistory(days: number) {
  const arr = [];
  let risk = 4, load = 18.4, tension = 32, compression = 12;
  for (let i = days; i >= 0; i -= Math.ceil(days / 60)) {
    const d = new Date(); d.setDate(d.getDate() - i);
    risk = Math.max(2, Math.min(25, risk + (Math.random() - 0.45) * 0.8));
    load = Math.max(15, Math.min(24, load + (Math.random() - 0.5) * 0.4));
    tension = Math.max(28, Math.min(40, tension + (Math.random() - 0.5) * 0.8));
    compression = Math.max(8, Math.min(18, compression + (Math.random() - 0.5) * 0.5));
    arr.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      risk: +risk.toFixed(1), load: +load.toFixed(1),
      tension: +tension.toFixed(1), compression: +compression.toFixed(1),
    });
  }
  return arr;
}

function genSRPHistory(days: number) {
  const arr = [];
  let spm = 5.2, fillage = 78, vfd = 42, amps = 38;
  for (let i = days; i >= 0; i -= Math.ceil(days / 60)) {
    const d = new Date(); d.setDate(d.getDate() - i);
    spm = Math.max(3.5, Math.min(7, spm + (Math.random() - 0.5) * 0.15));
    fillage = Math.max(60, Math.min(95, fillage + (Math.random() - 0.5) * 1.5));
    vfd = Math.max(35, Math.min(55, vfd + (Math.random() - 0.5) * 1));
    amps = Math.max(30, Math.min(48, amps + (Math.random() - 0.5) * 1));
    arr.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      spm: +spm.toFixed(2), fillage: Math.round(fillage),
      vfd: Math.round(vfd), amps: +amps.toFixed(1),
    });
  }
  return arr;
}

const CSS_CYCLES = genCSSCycles();
const DYN_DATA = [
  { pos: 0, load: 18 }, { pos: 10, load: 21 }, { pos: 20, load: 27 },
  { pos: 30, load: 31 }, { pos: 40, load: 33.5 }, { pos: 50, load: 33.8 },
  { pos: 60, load: 30 }, { pos: 70, load: 24 }, { pos: 80, load: 20 },
  { pos: 90, load: 16.5 }, { pos: 100, load: 18 },
];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
}

function StatRow({ label, value, unit, color = "slate" }: { label: string; value: string | number; unit?: string; color?: string }) {
  const colors: Record<string, string> = {
    slate: "text-slate-800", green: "text-emerald-600", amber: "text-amber-600",
    red: "text-red-600", blue: "text-blue-700", orange: "text-orange-600", purple: "text-purple-700",
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-bold ${colors[color]}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}{unit && <span className="font-normal text-slate-400 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
      <div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {badge}
    </div>
  );
}

function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
      {Object.keys(PERIODS).map(p => <option key={p}>{p}</option>)}
    </select>
  );
}

function ChartCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

const ttStyle = { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", borderRadius: 8 };
const axTick = { fontSize: 8, fill: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" };

// ─── DIGITAL TWIN VIZ ────────────────────────────────────────────────────────

function DigitalTwinViz({ mode }: { mode: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const tips: Record<string, string> = {
    "pump": "Downhole Pump | Fillage: 78% | SPM: 5.2 | 310m depth",
    "temp-deep": "Temp Sensor | 68.2°C | Depth: 280m",
    "temp-mid": "Temp Sensor | 62.4°C | Depth: 180m",
    "press-down": "Pressure Sensor | BHP: 14.2 bar | Depth: 310m",
    "press-surf": "Wellhead Pressure | 8.4 bar | Surface",
    "fluid-level": "Dynamic Fluid Level | 142m | Annular",
  };
  const showThermal = mode === "thermal" || mode === "twin";
  const showFlow = mode === "flow" || mode === "twin";

  return (
    <div className="relative w-full h-full">
      {hovered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl font-mono whitespace-nowrap pointer-events-none">
          {tips[hovered] || hovered}
        </div>
      )}
      <svg width="100%" height="100%" viewBox="0 0 320 560" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e0f2fe" /><stop offset="100%" stopColor="#f0fdf4" /></linearGradient>
          <radialGradient id="thermalZ" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f97316" stopOpacity="0.45" /><stop offset="60%" stopColor="#f97316" stopOpacity="0.15" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <marker id="aD" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" /></marker>
          <marker id="aU" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#fbbf24" /></marker>
          <marker id="aS" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f97316" /></marker>
        </defs>
        <rect x="0" y="0" width="320" height="90" fill="url(#skyG)" />
        <rect x="0" y="90" width="320" height="470" fill="#f5f0e8" />
        <rect x="0" y="90" width="320" height="60" fill="#d1c5a8" opacity="0.5" />
        <text x="8" y="126" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Cap Rock / Shale</text>
        <rect x="0" y="150" width="320" height="100" fill="#c9b99a" opacity="0.4" />
        <text x="8" y="205" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Sandstone Formation</text>
        <rect x="0" y="250" width="320" height="170" fill="#b8996a" opacity="0.4" />
        {[...Array(8)].map((_, i) => <ellipse key={i} cx={20 + i * 36} cy={340 + (i % 3) * 12} rx={14} ry={6} fill="#92400e" opacity={0.18 + (i % 3) * 0.06} />)}
        {showThermal && <ellipse cx="160" cy="360" rx="92" ry="68" fill="url(#thermalZ)" opacity="0.85" />}
        {showThermal && <>
          <ellipse cx="160" cy="360" rx="74" ry="52" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          <ellipse cx="160" cy="360" rx="52" ry="36" fill="none" stroke="#ea580c" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        </>}
        <rect x="0" y="420" width="320" height="140" fill="#9c7c5e" opacity="0.5" />
        <text x="8" y="450" fill="#78716c" fontSize="8" fontFamily="JetBrains Mono">Base Rock</text>
        <line x1="0" y1="90" x2="320" y2="90" stroke="#78716c" strokeWidth="1.5" />
        {[...Array(20)].map((_, i) => <line key={i} x1={i * 16} y1="90" x2={i * 16 - 8} y2="98" stroke="#78716c" strokeWidth="0.8" opacity="0.5" />)}
        <rect x="146" y="88" width="28" height="360" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="150" y="88" width="20" height="360" fill="none" stroke="#64748b" strokeWidth="1" />
        <rect x="154" y="88" width="12" height="350" fill="none" stroke="#0ea5e9" strokeWidth="1.2" />
        <line x1="160" y1="0" x2="160" y2="340" stroke="#475569" strokeWidth="2.5" strokeDasharray="12 4" />
        <rect x="153" y="338" width="14" height="28" rx="2" fill="#0a1628" stroke="#22d3ee" strokeWidth="2" filter="url(#glow)" style={{ cursor: "pointer" }} onMouseEnter={() => setHovered("pump")} onMouseLeave={() => setHovered(null)} />
        <text x="160" y="355" textAnchor="middle" fill="#22d3ee" fontSize="7" fontFamily="JetBrains Mono">PUMP</text>
        <line x1="143" y1="220" x2="177" y2="220" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
        <circle cx="142" cy="220" r="3" fill="#3b82f6" />
        {showFlow && <>
          <line x1="157" y1="366" x2="157" y2="100" stroke="#fbbf24" strokeWidth="1.5" className="flow-line-up" markerEnd="url(#aU)" opacity="0.8" />
          <line x1="163" y1="366" x2="163" y2="100" stroke="#fbbf24" strokeWidth="1.5" className="flow-line-up" opacity="0.6" style={{ animationDelay: "0.9s" }} />
        </>}
        {showFlow && <>
          <path d="M 60 310 Q 100 330 145 350" fill="none" stroke="#f97316" strokeWidth="2.5" className="flow-line-down" markerEnd="url(#aS)" opacity="0.85" />
          <path d="M 75 300 Q 105 320 145 345" fill="none" stroke="#fb923c" strokeWidth="1.5" className="flow-line-down" opacity="0.5" style={{ animationDelay: "1.2s" }} />
        </>}
        <rect x="55" y="88" width="10" height="240" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
        <rect x="57" y="80" width="6" height="14" rx="1" fill="#f97316" opacity="0.8" />
        {showFlow && [[70, 340], [100, 355], [120, 345], [200, 350], [220, 340], [245, 355]].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} L ${x + 12} ${y - 3}`} stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#aU)" opacity="0.6" className="flow-line-up" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
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
        {/* Surface equipment */}
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
        {showThermal && <text x="224" y="308" fill="#ea580c" fontSize="8" fontFamily="Inter" fontWeight="600">Thermal Zone</text>}
        <text x="205" y="375" fill="#92400e" fontSize="8" fontFamily="Inter" fontWeight="600">Heavy Oil</text>
        <text x="205" y="390" fill="#78716c" fontSize="7" fontFamily="Inter">Reservoir · 310m</text>
        {showFlow && <text x="30" y="295" fill="#f97316" fontSize="8" fontFamily="Inter" fontWeight="600">Steam Inj.</text>}
        <text x="182" y="352" fill="#22d3ee" fontSize="7" fontFamily="Inter">Dnhole Pump</text>
        <text x="182" y="224" fill="#3b82f6" fontSize="7" fontFamily="Inter">Fluid Level</text>
        {mode === "twin" && <>
          <rect x="2" y="2" width="316" height="556" rx="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
          <text x="160" y="18" textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">DIGITAL TWIN · BGW-07</text>
        </>}
        <text x="290" y="108" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−100m</text>
        <text x="290" y="178" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−180m</text>
        <text x="290" y="233" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−240m</text>
        <text x="290" y="355" fill="#78716c" fontSize="7" textAnchor="end" fontFamily="Inter">−360m</text>
      </svg>
    </div>
  );
}

// ─── WHAT-IF MODAL ────────────────────────────────────────────────────────────

function WhatIfModal({ onClose }: { onClose: () => void }) {
  const [p, setP] = useState({ steamVol: 120, injPressure: 8.4, soakTime: 36, strokeLen: 100, spm: 5.2, vfd: 42 });
  const pred = {
    production: (p.steamVol * 0.38 + p.soakTime * 0.12).toFixed(1),
    temp: (55 + p.injPressure * 1.2).toFixed(1),
    visc: Math.max(14000, Math.round(25000 - p.steamVol * 30 - (p.injPressure - 7) * 800)),
    sor: (p.steamVol / (p.steamVol * 0.38 + p.soakTime * 0.12) * 2.4).toFixed(2),
    energy: (p.spm * 4.1 + 0.3).toFixed(1),
    rodRisk: Math.max(3, Math.round(p.spm * 1.5 + (10000 - p.soakTime * 100) / 1000)),
  };
  const sl = (label: string, key: keyof typeof p, min: number, max: number, step: number, unit: string) => (
    <div className="mb-3.5">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-mono font-bold text-blue-700">{p[key]} <span className="font-normal text-slate-400">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={p[key]}
        onChange={e => setP({ ...p, [key]: parseFloat(e.target.value) })}
        className="w-full h-1.5 rounded-full accent-blue-600 cursor-pointer" />
      <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>{min}</span><span>{max}</span></div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,13,26,0.7)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-base font-bold text-slate-900">What-If Simulation</div>
            <div className="text-xs text-slate-400 mt-0.5">Adjust parameters — AI model predicts outcomes · BGW-07</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors text-sm">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Input Parameters</div>
            {sl("Steam Volume", "steamVol", 80, 160, 5, "m³")}
            {sl("Injection Pressure", "injPressure", 6, 12, 0.1, "bar")}
            {sl("Soak Time", "soakTime", 18, 60, 1, "hr")}
            {sl("Stroke Length", "strokeLen", 72, 144, 4, "in")}
            {sl("SPM", "spm", 2, 8, 0.1, "SPM")}
            {sl("VFD Frequency", "vfd", 30, 60, 1, "Hz")}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Predicted Outcomes</div>
            {[
              { label: "Oil Production", value: pred.production, unit: "BOPD", color: parseFloat(pred.production) > 46 ? "text-emerald-600" : "text-amber-600" },
              { label: "Reservoir Temp", value: pred.temp, unit: "°C", color: "text-orange-600" },
              { label: "Oil Viscosity", value: pred.visc.toLocaleString(), unit: "cP", color: "text-amber-700" },
              { label: "SOR", value: pred.sor, unit: "", color: "text-purple-700" },
              { label: "Energy", value: pred.energy, unit: "kWh/bbl", color: "text-blue-700" },
              { label: "Rod Failure Risk", value: pred.rodRisk + "%", unit: "", color: pred.rodRisk > 15 ? "text-red-600" : pred.rodRisk > 10 ? "text-amber-600" : "text-emerald-600" },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`font-mono font-bold text-sm ${color}`}>{value} <span className="text-xs font-normal text-slate-400">{unit}</span></span>
              </div>
            ))}
            <div className="mt-4 bg-blue-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-blue-800 mb-1">AI Assessment</div>
              <div className="text-xs text-blue-700">
                {parseFloat(pred.production) > 46
                  ? "Favorable production conditions. Parameters within optimal range."
                  : "Production below target. Consider increasing steam volume or extending soak time."}
              </div>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "#0a1628" }}>
              Apply to Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: DIGITAL TWIN ───────────────────────────────────────────────────────

function PageDigitalTwin() {
  const [twinMode, setTwinMode] = useState("twin");
  const [timeSlider, setTimeSlider] = useState(7);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const data30 = genDailyData(30);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-8 gap-2.5">
        {[
          { label: "Oil Production", value: "48.6", unit: "BOPD", bg: "bg-emerald-50", border: "border-emerald-200", val: "text-emerald-600", delta: "↑ 2.1 vs yesterday" },
          { label: "Reservoir Temp", value: "62.4", unit: "°C", bg: "bg-orange-50", border: "border-orange-200", val: "text-orange-600", delta: "↓ 1.2°C vs peak" },
          { label: "Oil Viscosity", value: "18,700", unit: "cP", bg: "bg-amber-50", border: "border-amber-200", val: "text-amber-700", delta: "↑ Cooling trend" },
          { label: "Pump Fillage", value: "78%", unit: "", bg: "bg-blue-50", border: "border-blue-200", val: "text-blue-700", delta: "Target: 85%" },
          { label: "SOR", value: "4.8", unit: "", bg: "bg-purple-50", border: "border-purple-200", val: "text-purple-700", delta: "↓ 0.3 vs cycle avg" },
          { label: "Energy", value: "21.4", unit: "kWh/bbl", bg: "bg-sky-50", border: "border-sky-200", val: "text-sky-700", delta: "↓ from 24.1" },
          { label: "Rod Failure Risk", value: "LOW", unit: "", bg: "bg-emerald-50", border: "border-emerald-200", val: "text-emerald-600", delta: "7% probability" },
          { label: "Twin Health", value: "96%", unit: "", bg: "bg-emerald-50", border: "border-emerald-200", val: "text-emerald-600", delta: "98 sensors active" },
        ].map(({ label, value, unit, bg, border, val, delta }) => (
          <div key={label} className={`rounded-xl border p-3 ${bg} ${border}`}>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold font-mono ${val}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
              {unit && <span className="text-xs text-slate-400">{unit}</span>}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{delta}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Twin viz */}
        <div>
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" style={{ boxShadow: "0 0 6px #06b6d4" }} />
                <span className="text-sm font-bold text-slate-900">Digital Twin — BGW-07</span>
                <span className="text-xs text-slate-400 font-mono">Baghewala · 310m TD</span>
              </div>
              <div className="flex gap-1">
                {["twin", "physical", "thermal", "flow"].map(m => (
                  <button key={m} onClick={() => setTwinMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${twinMode === m ? "text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    style={twinMode === m ? { background: "#0a1628" } : {}}>
                    {m === "twin" ? "Digital Twin" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex">
              <div className="flex-1" style={{ minHeight: 520 }}>
                <DigitalTwinViz mode={twinMode} />
              </div>
              <div className="w-44 border-l border-slate-100 p-3 flex flex-col gap-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Data</div>
                {[
                  ["WHP", "8.4 bar", "#22d3ee"], ["BHP", "14.2 bar", "#22d3ee"],
                  ["Inj. Press", "8.4 bar", "#f97316"], ["Fluid Level", "142 m", "#3b82f6"],
                  ["Rod Load", "18.4 kN", "#64748b"], ["Motor Amps", "38.2 A", "#64748b"],
                  ["Stroke Rate", "5.2 SPM", "#0a1628"], ["Prod. Rate", "48.6 BOPD", "#10b981"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className="text-sm font-mono font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                  </div>
                ))}
                <div className="mt-auto">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">CSS Phase</div>
                  {[["Steam Inj.", true, false], ["Soak", true, false], ["Production", false, true], ["Cooling", false, false]].map(([phase, done, active]) => (
                    <div key={phase as string} className="flex items-center gap-1.5 mb-1">
                      <div className={`w-2 h-2 rounded-full ${active ? "bg-amber-500" : done ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <span className={`text-xs ${active ? "font-semibold text-amber-700" : done ? "text-slate-500" : "text-slate-300"}`}>{phase as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-4">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Timeline</span>
              <input type="range" min={1} max={10} value={timeSlider} onChange={e => setTimeSlider(+e.target.value)} className="flex-1 h-1.5 rounded-full accent-blue-600 cursor-pointer" />
              <div className="flex gap-2 text-xs text-slate-400 whitespace-nowrap">
                <span>Day −30</span><span>·</span><span>Now</span><span>·</span>
                <span className="text-blue-600 font-medium">+72h (Pred.)</span>
              </div>
              <button onClick={() => setShowWhatIf(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap">
                What-If Simulation
              </button>
            </div>
          </Card>

          {/* Mini charts */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { title: "Reservoir Temp", key: "temp", unit: "°C", color: "#f97316", domain: [50, 72] as [number,number] },
              { title: "Oil Production", key: "prod", unit: "BOPD", color: "#0a1628", domain: [25, 60] as [number,number] },
              { title: "Viscosity", key: "visc", unit: "cP", color: "#92400e", domain: [13000, 28000] as [number,number] },
            ].map(({ title, key, unit, color, domain }) => (
              <ChartCard key={title} title={title} subtitle={unit}>
                <div style={{ height: 90 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data30.slice(-15)}>
                      <defs>
                        <linearGradient id={`g${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={4} />
                      <YAxis hide domain={domain} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} fill={`url(#g${key})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            ))}
          </div>
        </div>

        {/* AI Panel */}
        <div className="flex flex-col gap-3">
          <Card>
            <div className="px-4 py-3 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#0a1628,#152a56)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">AI Digital Twin Insights</div>
                  <div className="text-xs text-blue-300 mt-0.5">Updated 14s ago</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 live-indicator" style={{ boxShadow: "0 0 8px #22d3ee" }} />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">Current</div>
                  {[["Temp","62.4°C"],["Visc","18,700 cP"],["Prod","48.6 BOPD"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-xs py-0.5"><span className="text-slate-400">{k}</span><span className="font-mono font-semibold text-slate-700">{v}</span></div>
                  ))}
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                  <div className="text-xs font-semibold text-amber-600 mb-1.5">Predicted 72h</div>
                  {([ ["Temp","58.1°C",true],["Visc","20,900 cP",true],["Prod","44.2 BOPD",true] ] as [string,string,boolean][]).map(([k,v,w]) => (
                    <div key={k} className="flex justify-between text-xs py-0.5"><span className="text-slate-400">{k}</span><span className={`font-mono font-semibold ${w ? "text-amber-700" : "text-slate-700"}`}>{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <div className="text-xs font-semibold text-amber-800 mb-1">⚠ Risk Detection</div>
                <div className="text-xs text-amber-700">Reservoir cooling detected. Predicted viscosity increase of <span className="font-semibold">12%</span> over the next 72 hours.</div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-xs font-semibold text-blue-800 mb-1.5">Recommended Action</div>
                <div className="text-xs text-blue-700 mb-2">Reduce SRP speed <span className="font-mono font-bold">5.2 → 4.7 SPM</span> to maintain efficiency. Consider advancing CSS Cycle 15 by 3 days.</div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors">Apply</button>
                  <button onClick={() => setShowWhatIf(true)} className="flex-1 py-1.5 border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">Simulate</button>
                </div>
              </div>
              {[["Model Confidence","94%","text-emerald-600"],["Data Freshness","14 sec","text-blue-600"],["Active Sensors","98 / 102","text-slate-700"]].map(([k,v,c]) => (
                <div key={k} className="flex items-center justify-between text-xs"><span className="text-slate-500">{k}</span><span className={`font-mono font-semibold ${c}`}>{v}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      {showWhatIf && <WhatIfModal onClose={() => setShowWhatIf(false)} />}
    </div>
  );
}

// ─── PAGE: RESERVOIR ──────────────────────────────────────────────────────────

function PageReservoir() {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period as keyof typeof PERIODS];
  const data = genDailyData(days);

  const statsNow = data[data.length - 1];
  const statsFirst = data[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Reservoir Analysis</h2>
          <p className="text-xs text-slate-400 mt-0.5">Baghewala Field · BGW-07 · Bikaner–Nagaur Formation · Heavy Oil</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Static reservoir stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Formation", value: "Bikaner–Nagaur", unit: "", color: "text-slate-800" },
          { label: "Reservoir Depth", value: "310", unit: "m TVD", color: "text-slate-800" },
          { label: "Net Pay", value: "22.4", unit: "m", color: "text-slate-800" },
          { label: "Porosity", value: "28.6", unit: "%", color: "text-blue-700" },
          { label: "Permeability", value: "1,240", unit: "mD", color: "text-blue-700" },
          { label: "Oil Saturation", value: "68", unit: "%", color: "text-amber-700" },
          { label: "STOIIP", value: "4.8", unit: "MMbbl", color: "text-slate-800" },
          { label: "Recovery Factor", value: "18.4", unit: "%", color: "text-emerald-600" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-xl font-bold font-mono ${color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value} <span className="text-xs font-normal text-slate-400">{unit}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Reservoir Temperature History" subtitle="°C at 280m depth">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gtRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[45, 75]} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fill="url(#gtRes)" dot={false} name="Temp °C" />
                <ReferenceLine y={62.4} stroke="#94a3b8" strokeDasharray="3 2" strokeWidth={1} label={{ value: "Current", fontSize: 8, fill: "#94a3b8" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Oil Viscosity History" subtitle="cP at reservoir conditions">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gvRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#92400e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#92400e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={ttStyle} formatter={(v: unknown) => [`${(v as number).toLocaleString()} cP`, "Viscosity"]} />
                <Area type="monotone" dataKey="visc" stroke="#92400e" strokeWidth={2} fill="url(#gvRes)" dot={false} name="Viscosity cP" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Bottomhole Pressure" subtitle="BHP bar">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[10, 18]} />
                <Tooltip contentStyle={ttStyle} />
                <Line type="monotone" dataKey="bhp" stroke="#0ea5e9" strokeWidth={2} dot={false} name="BHP bar" />
                <ReferenceLine y={14.2} stroke="#22d3ee" strokeDasharray="3 2" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Water Cut History" subtitle="% water in produced fluid">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gwc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 40]} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="wc" stroke="#3b82f6" strokeWidth={2} fill="url(#gwc)" dot={false} name="Water Cut %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Temp vs Viscosity correlation */}
      <ChartCard title="Temperature–Viscosity Correlation" subtitle="Live reservoir model · Bikaner-Nagaur Heavy Oil">
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
              <XAxis dataKey="temp" name="Temp °C" tick={axTick} axisLine={false} tickLine={false} label={{ value: "Temperature °C", fontSize: 9, fill: "#94a3b8", position: "insideBottom", offset: -4 }} />
              <YAxis dataKey="visc" name="Viscosity cP" tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: unknown, n: unknown) => [(n as string) === "visc" ? `${(v as number).toLocaleString()} cP` : `${v}°C`, (n as string) === "visc" ? "Viscosity" : "Temperature"]} />
              <Scatter data={data} fill="#f97316" opacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Period stats summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Period Statistics" subtitle={period} />
          <div className="p-4 space-y-0">
            <StatRow label="Avg. Reservoir Temp" value={(data.reduce((a,d)=>a+d.temp,0)/data.length).toFixed(1)} unit="°C" color="orange" />
            <StatRow label="Peak Temp" value={Math.max(...data.map(d=>d.temp)).toFixed(1)} unit="°C" color="orange" />
            <StatRow label="Min Temp" value={Math.min(...data.map(d=>d.temp)).toFixed(1)} unit="°C" />
            <StatRow label="Avg. Viscosity" value={(data.reduce((a,d)=>a+d.visc,0)/data.length).toFixed(0)} unit="cP" color="amber" />
            <StatRow label="Avg. BHP" value={(data.reduce((a,d)=>a+d.bhp,0)/data.length).toFixed(1)} unit="bar" color="blue" />
            <StatRow label="Avg. Water Cut" value={(data.reduce((a,d)=>a+d.wc,0)/data.length).toFixed(1)} unit="%" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Reservoir Health Index" />
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-emerald-600 font-mono" style={{ fontFamily: "'JetBrains Mono',monospace" }}>82</div>
              <div>
                <div className="text-sm font-semibold text-slate-700">Good</div>
                <div className="text-xs text-slate-400">Composite reservoir quality score</div>
              </div>
            </div>
            {[
              ["Thermal Efficiency", 78, "#f97316"],
              ["Pressure Support", 85, "#0ea5e9"],
              ["Sweep Efficiency", 74, "#92400e"],
              ["Fluid Mobility", 68, "#7c3aed"],
            ].map(([label, val, color]) => (
              <div key={label as string} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{label as string}</span>
                  <span className="font-mono font-semibold text-slate-700">{val as number}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${val as number}%`, background: color as string }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PAGE: CSS OPTIMIZATION ───────────────────────────────────────────────────

function PageCSS() {
  const [period, setPeriod] = useState("Last 6 Months");
  const [selectedCycle, setSelectedCycle] = useState(13);

  const cyc = CSS_CYCLES[selectedCycle];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cyclic Steam Stimulation (CSS) Optimization</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Current Cycle: 14 · Steam Injection Active</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Badge color="orange">Cycle 14 Active</Badge>
        </div>
      </div>

      {/* Current vs AI Optimized */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Current CSS Parameters" badge={<Badge color="blue">Active</Badge>} />
          <div className="p-4">
            <StatRow label="Steam Volume" value="120" unit="m³" />
            <StatRow label="Injection Pressure" value="8.4" unit="bar" />
            <StatRow label="Injection Rate" value="48" unit="m³/day" />
            <StatRow label="Soak Time" value="36" unit="hr" />
            <StatRow label="Prod. Cut-off" value="18" unit="BOPD" />
            <StatRow label="Steam Quality" value="0.80" unit="fraction" />
            <StatRow label="Injection Temp" value="182" unit="°C" />
            <StatRow label="Cycle Duration" value="21" unit="days" />
          </div>
        </Card>
        <Card>
          <CardHeader title="AI Optimized Parameters" badge={<Badge color="green">Recommended</Badge>} />
          <div className="p-4">
            <StatRow label="Steam Volume" value="105" unit="m³" color="green" />
            <StatRow label="Injection Pressure" value="8.1" unit="bar" color="green" />
            <StatRow label="Injection Rate" value="52" unit="m³/day" color="green" />
            <StatRow label="Soak Time" value="30" unit="hr" color="green" />
            <StatRow label="Prod. Cut-off" value="18" unit="BOPD" />
            <StatRow label="Steam Quality" value="0.82" unit="fraction" color="green" />
            <StatRow label="Injection Temp" value="185" unit="°C" color="green" />
            <StatRow label="Est. Cycle Duration" value="19" unit="days" color="green" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Expected Improvement" badge={<Badge color="purple">+8% Production</Badge>} />
          <div className="p-4">
            {[
              ["Oil Production", "+8.0%", "green", "48.6 → 52.5 BOPD"],
              ["SOR", "−11%", "green", "4.8 → 4.3"],
              ["Steam Volume", "−12.5%", "green", "120 → 105 m³"],
              ["Energy Cost", "−9.0%", "green", "21.4 → 19.5 kWh/bbl"],
              ["Cycle Duration", "−2 days", "green", "21 → 19 days"],
              ["Net Revenue", "+₹ 4,200/cycle", "green", "Est. annual ₹2.2L"],
            ].map(([k, v, c, d]) => (
              <div key={k as string} className="flex items-start justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-xs text-slate-600 font-medium">{k as string}</div>
                  <div className="text-xs text-slate-400">{d as string}</div>
                </div>
                <span className={`text-sm font-mono font-bold ${c === "green" ? "text-emerald-600" : "text-red-500"}`}>{v as string}</span>
              </div>
            ))}
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: "#0a1628" }}>Apply</button>
              <button className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">Schedule</button>
            </div>
          </div>
        </Card>
      </div>

      {/* Cycle history charts */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="SOR per CSS Cycle" subtitle="Steam-Oil Ratio trend">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="cycle" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[3.5, 6.5]} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="sor" fill="#7c3aed" opacity={0.7} radius={[2, 2, 0, 0]} name="SOR" />
                <Line type="monotone" dataKey="sor" stroke="#7c3aed" strokeWidth={2} dot={false} />
                <ReferenceLine y={4.8} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Target", fontSize: 8, fill: "#10b981" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Peak Production per Cycle" subtitle="BOPD at cycle peak">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="cycle" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="peakProd" fill="#0a1628" radius={[2, 2, 0, 0]} name="Peak Prod BOPD" />
                <ReferenceLine y={48.6} stroke="#10b981" strokeDasharray="3 2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Steam Volume vs SOR" subtitle="Volume–efficiency relationship">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="steamVol" name="Steam Vol m³" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis dataKey="sor" name="SOR" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Scatter data={CSS_CYCLES} fill="#f97316" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Soak Time vs Peak Production" subtitle="Optimal soak analysis">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="soakTime" name="Soak Time hr" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis dataKey="peakProd" name="Peak Prod BOPD" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Scatter data={CSS_CYCLES} fill="#0ea5e9" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Cycle detail table */}
      <Card>
        <CardHeader title="All CSS Cycles — Historical Record" subtitle="14 cycles · BGW-07" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Cycle","Steam Vol m³","Inj. Press bar","Soak hr","Peak Prod BOPD","SOR","Duration days","Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CSS_CYCLES.map((c, i) => (
                <tr key={c.cycle} className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${i === CSS_CYCLES.length - 1 ? "bg-amber-50" : ""}`}
                  onClick={() => setSelectedCycle(i)}>
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">{c.cycle}</td>
                  <td className="px-4 py-2.5 font-mono">{c.steamVol}</td>
                  <td className="px-4 py-2.5 font-mono">{c.injPress}</td>
                  <td className="px-4 py-2.5 font-mono">{c.soakTime}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700">{c.peakProd}</td>
                  <td className="px-4 py-2.5 font-mono">{c.sor}</td>
                  <td className="px-4 py-2.5 font-mono">{c.duration}</td>
                  <td className="px-4 py-2.5">
                    {i === CSS_CYCLES.length - 1
                      ? <Badge color="orange">Active</Badge>
                      : <Badge color="gray">Complete</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: SRP OPTIMIZATION ───────────────────────────────────────────────────

function PageSRP() {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period as keyof typeof PERIODS];
  const srp = genSRPHistory(days);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">SRP Optimization</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sucker Rod Pump · BGW-07 · API Unit 228-213-86</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Badge color="green">Normal Operation</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Stroke Length","100 in","text-slate-800"],["Stroke/Min (SPM)","5.2","text-blue-700"],
          ["Recommended SPM","4.7","text-amber-600"],["VFD Frequency","42 Hz","text-slate-800"],
          ["Pump Fillage","78%","text-blue-700"],["Rod Load","18.4 kN","text-slate-800"],
          ["Motor Current","38.2 A","text-slate-800"],["Rod Float Risk","7%","text-emerald-600"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label as string}</div>
            <div className={`text-xl font-bold font-mono ${color as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Dynamometer Card — Current" subtitle="Surface rod load vs position">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DYN_DATA}>
                <defs>
                  <linearGradient id="gdyn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="pos" tick={axTick} axisLine={false} tickLine={false} label={{ value: "Position (% stroke)", fontSize: 9, fill: "#94a3b8", position: "insideBottom", offset: -4 }} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} label={{ value: "Load kN", fontSize: 9, fill: "#94a3b8", angle: -90, position: "insideLeft" }} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="load" stroke="#0a1628" strokeWidth={2} fill="url(#gdyn)" name="Rod Load kN" />
                <ReferenceLine y={32} stroke="#f59e0b" strokeDasharray="3 2" label={{ value: "Max Load", fontSize: 8, fill: "#f59e0b" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Pump Fillage History" subtitle="% over selected period">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={srp}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(srp.length / 6)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[50, 100]} />
                <Tooltip contentStyle={ttStyle} />
                <Line type="monotone" dataKey="fillage" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Fillage %" />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Target", fontSize: 8, fill: "#10b981" }} />
                <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 2" label={{ value: "Low", fontSize: 8, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="SPM History" subtitle="Stroke rate over time">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={srp}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(srp.length / 6)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[3, 8]} />
                <Tooltip contentStyle={ttStyle} />
                <Line type="monotone" dataKey="spm" stroke="#0a1628" strokeWidth={2} dot={false} name="SPM" />
                <ReferenceLine y={4.7} stroke="#f59e0b" strokeDasharray="3 2" label={{ value: "Recommended", fontSize: 8, fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="VFD Frequency & Motor Current" subtitle="Hz and Amps">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={srp}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(srp.length / 6)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[30, 60]} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[25, 55]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Bar yAxisId="l" dataKey="vfd" fill="#7c3aed" opacity={0.6} radius={[2, 2, 0, 0]} name="VFD Hz" />
                <Line yAxisId="r" type="monotone" dataKey="amps" stroke="#f97316" strokeWidth={2} dot={false} name="Motor A" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader title="AI Recommendation" badge={<Badge color="amber">Action Required</Badge>} />
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-600">Reduce SPM from <span className="font-mono font-bold text-blue-700">5.2 → 4.7</span> to improve pump fillage and reduce rod loading given reservoir cooling trend.</div>
            <div className="space-y-2">
              {[["VFD Frequency","42 → 38 Hz"],["Expected Fillage","78 → 86%"],["Rod Load Reduction","−8%"],["Energy Saving","~1.2 kWh/bbl"]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-xs"><span className="text-slate-500">{k}</span><span className="font-mono font-semibold text-emerald-700">{v}</span></div>
              ))}
            </div>
            <button className="w-full py-2 text-xs font-semibold text-white rounded-xl hover:opacity-90" style={{ background: "#0a1628" }}>Apply SPM Change</button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Period Statistics" subtitle={period} />
          <div className="p-4">
            <StatRow label="Avg. SPM" value={(srp.reduce((a,d)=>a+d.spm,0)/srp.length).toFixed(2)} unit="SPM" color="blue" />
            <StatRow label="Avg. Fillage" value={Math.round(srp.reduce((a,d)=>a+d.fillage,0)/srp.length)} unit="%" color="blue" />
            <StatRow label="Avg. VFD" value={Math.round(srp.reduce((a,d)=>a+d.vfd,0)/srp.length)} unit="Hz" />
            <StatRow label="Avg. Motor Amps" value={(srp.reduce((a,d)=>a+d.amps,0)/srp.length).toFixed(1)} unit="A" />
            <StatRow label="Min Fillage" value={Math.min(...srp.map(d=>d.fillage))} unit="%" color="amber" />
            <StatRow label="Max SPM" value={Math.max(...srp.map(d=>d.spm)).toFixed(2)} unit="SPM" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Pump Performance Index" />
          <div className="p-4">
            {[["Volumetric Efficiency",78,"#0ea5e9"],["Mechanical Efficiency",88,"#10b981"],["Overall Efficiency",69,"#7c3aed"],["Fillage Factor",78,"#f97316"]].map(([label,val,color]) => (
              <div key={label as string} className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{label as string}</span><span className="font-mono font-semibold text-slate-700">{val as number}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${val as number}%`, background: color as string }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PAGE: ROD HEALTH ─────────────────────────────────────────────────────────

function PageRodHealth() {
  const [period, setPeriod] = useState("Last 90 Days");
  const days = PERIODS[period as keyof typeof PERIODS];
  const rodData = genRodHistory(days);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Rod Health & Failure Prediction</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · API Grade D Sucker Rods · String length: 310m · 24 sections</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Badge color="green">LOW RISK — 7%</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Failure Risk","7%","LOW","bg-emerald-50 border-emerald-200","text-emerald-600"],
          ["Max Rod Stress","186 MPa","61% of yield","bg-blue-50 border-blue-200","text-blue-700"],
          ["Fatigue Life","82%","remaining","bg-emerald-50 border-emerald-200","text-emerald-600"],
          ["Cumulative Cycles","1.84M","since last change","bg-slate-50 border-slate-200","text-slate-700"],
        ].map(([label, value, sub, bg, val]) => (
          <div key={label as string} className={`rounded-xl border p-3 ${bg as string}`}>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label as string}</div>
            <div className={`text-2xl font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub as string}</div>
          </div>
        ))}
      </div>

      {/* Risk breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Risk Contributors" />
          <div className="p-4 space-y-3">
            {[
              ["Increasing Viscosity",35,"#f59e0b"],
              ["Elevated Rod Loading",28,"#f97316"],
              ["Reduced Pump Fillage",22,"#0ea5e9"],
              ["Thermal Cycling",10,"#7c3aed"],
              ["Corrosion Factor",5,"#94a3b8"],
            ].map(([label,pct,color]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{label as string}</span><span className="font-mono font-semibold text-slate-700">{pct as number}%</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${pct as number}%`, background: color as string }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Rod String Status" subtitle="24 sections · API Grade D" />
          <div className="p-4">
            <div className="grid grid-cols-6 gap-1 mb-3">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="aspect-square rounded flex items-center justify-center text-xs font-mono"
                  style={{
                    background: i < 3 ? "#dcfce7" : i < 20 ? "#eff6ff" : "#fef9c3",
                    border: `1px solid ${i < 3 ? "#86efac" : i < 20 ? "#bfdbfe" : "#fde047"}`,
                    color: i < 3 ? "#166534" : i < 20 ? "#1e40af" : "#713f12",
                    fontSize: 8
                  }}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: "#dcfce7", border: "1px solid #86efac" }} /><span className="text-slate-500">New (1-3)</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }} /><span className="text-slate-500">Good (4-20)</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: "#fef9c3", border: "1px solid #fde047" }} /><span className="text-slate-500">Monitor (21-24)</span></div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Last inspection: 14 Sep 2026 · Next: 14 Dec 2026</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Failure Predictions" badge={<Badge color="blue">AI Model</Badge>} />
          <div className="p-4 space-y-2">
            {[
              ["30-day risk","7%","LOW","text-emerald-600"],
              ["60-day risk","12%","LOW","text-emerald-600"],
              ["90-day risk","18%","MEDIUM","text-amber-600"],
              ["Critical threshold","≥25%","HIGH","text-red-600"],
            ].map(([k,v,level,c]) => (
              <div key={k as string} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-500">{k as string}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold ${c as string}`}>{v as string}</span>
                  <Badge color={level === "LOW" ? "green" : level === "MEDIUM" ? "amber" : "red"}>{level as string}</Badge>
                </div>
              </div>
            ))}
            <div className="mt-3 bg-blue-50 rounded-lg p-2.5">
              <div className="text-xs font-semibold text-blue-800 mb-1">Recommended Action</div>
              <div className="text-xs text-blue-700">Schedule rod inspection at Day 75. Reduce SPM to 4.7 to limit fatigue loading.</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Rod Failure Risk Trend" subtitle={period}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rodData}>
                <defs>
                  <linearGradient id="grisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(rodData.length / 6)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 30]} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} fill="url(#grisk)" name="Risk %" dot={{ r: 2, fill: "#f59e0b" }} />
                <ReferenceLine y={15} stroke="#f97316" strokeDasharray="3 2" label={{ value: "Medium Risk", fontSize: 8, fill: "#f97316" }} />
                <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 2" label={{ value: "High Risk", fontSize: 8, fill: "#ef4444" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rod Load History" subtitle="kN surface measurement">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rodData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(rodData.length / 6)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Line type="monotone" dataKey="tension" stroke="#0a1628" strokeWidth={1.5} dot={false} name="Max Tension kN" />
                <Line type="monotone" dataKey="load" stroke="#0ea5e9" strokeWidth={1.5} dot={false} name="Avg Load kN" />
                <Line type="monotone" dataKey="compression" stroke="#f97316" strokeWidth={1.5} dot={false} name="Compression kN" strokeDasharray="4 2" />
                <ReferenceLine y={36} stroke="#ef4444" strokeDasharray="3 2" label={{ value: "Design Max", fontSize: 8, fill: "#ef4444" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Maintenance log */}
      <Card>
        <CardHeader title="Rod Maintenance History" subtitle="BGW-07 sucker rod events" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date","Event","Section(s)","Action Taken","Depth m","Result","Engineer"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["14 Sep 2026","Scheduled Inspection","All","Visual + MPI check","0–310","No defects found","R. Sharma"],
                ["02 Jul 2026","Routine Inspection","21-24","Micrometer check","240–310","Minor wear on #22","P. Mehta"],
                ["18 Apr 2026","Rod Replacement","1-3","Replaced Grade D rods","0–30","Completed OK","R. Sharma"],
                ["05 Jan 2026","Rod Failure","22","Emergency workover","268m","Replaced + inspection","A. Singh"],
                ["12 Oct 2025","Scheduled Inspection","All","Visual + RT check","0–310","1 crack on #21, tagged","P. Mehta"],
              ].map(([date,...rest], i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{date}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: PRODUCTION ─────────────────────────────────────────────────────────

function PageProduction() {
  const [period, setPeriod] = useState("Last 90 Days");
  const days = PERIODS[period as keyof typeof PERIODS];
  const data = genDailyData(days);

  const totalOil = data.reduce((a, d) => a + d.prod, 0);
  const avgProd = totalOil / data.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Production Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Baghewala Field · All fluid rates and volumes</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Today's Production","48.6 BOPD","text-emerald-600","bg-emerald-50 border-emerald-200"],
          ["Period Cumulative",`${totalOil.toFixed(0)} bbl`,"text-slate-800","bg-slate-50 border-slate-200"],
          ["Avg. Daily Rate",`${avgProd.toFixed(1)} BOPD`,"text-blue-700","bg-blue-50 border-blue-200"],
          ["Peak Production",`${Math.max(...data.map(d=>d.prod)).toFixed(1)} BOPD`,"text-purple-700","bg-purple-50 border-purple-200"],
          ["Avg. Water Cut",`${(data.reduce((a,d)=>a+d.wc,0)/data.length).toFixed(1)}%`,"text-blue-600","bg-blue-50 border-blue-200"],
          ["Gross Fluid Rate","62.4 BFPD","text-slate-800","bg-slate-50 border-slate-200"],
          ["Net Oil Entitlement","38.2 BOPD","text-amber-700","bg-amber-50 border-amber-200"],
          ["Facility Uptime","97.4%","text-emerald-600","bg-emerald-50 border-emerald-200"],
        ].map(([label,value,val,bg]) => (
          <div key={label as string} className={`rounded-xl border p-3 ${bg as string}`}>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label as string}</div>
            <div className={`text-xl font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Daily Oil Production" subtitle="BOPD with CSS cycle markers">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gprod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="prod" stroke="#0a1628" strokeWidth={2} fill="url(#gprod)" name="Oil BOPD" />
                <ReferenceLine y={avgProd} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Avg", fontSize: 8, fill: "#10b981" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Oil + Water Rates" subtitle="BOPD and water cut %">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 50]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Bar yAxisId="l" dataKey="prod" fill="#0a1628" opacity={0.8} radius={[1, 1, 0, 0]} name="Oil BOPD" maxBarSize={8} />
                <Line yAxisId="r" type="monotone" dataKey="wc" stroke="#3b82f6" strokeWidth={2} dot={false} name="WC %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Cumulative Oil Production" subtitle="bbls">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.map((d, i) => ({ ...d, cum: data.slice(0, i + 1).reduce((a, x) => a + x.prod, 0) }))}>
                <defs>
                  <linearGradient id="gcum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v.toFixed(0)}`} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="cum" stroke="#7c3aed" strokeWidth={2} fill="url(#gcum)" name="Cum. Oil bbl" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Temp vs Production Correlation" subtitle="Thermal effect on recovery">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="temp" name="Temp °C" tick={axTick} axisLine={false} tickLine={false} label={{ value: "Reservoir Temp °C", fontSize: 9, fill: "#94a3b8", position: "insideBottom", offset: -4 }} />
                <YAxis dataKey="prod" name="Prod BOPD" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Scatter data={data} fill="#10b981" opacity={0.5} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Monthly summary */}
      <Card>
        <CardHeader title="Monthly Production Summary" subtitle="Rolling 6-month breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Month","Days Prod.","Gross Oil bbl","Avg BOPD","Peak BOPD","Water Cut %","Uptime %","CSS Cycles"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Apr 2026",30,1380,46.0,54.2,18.2,98.1,2],
                ["May 2026",31,1462,47.2,55.1,18.8,97.8,2],
                ["Jun 2026",30,1410,47.0,53.8,19.4,98.4,2],
                ["Jul 2026",31,1488,48.0,56.2,20.1,96.9,2],
                ["Aug 2026",31,1512,48.8,57.0,20.8,97.5,2],
                ["Sep 2026",10,486,48.6,57.4,21.2,97.4,1],
              ].map(([month,...rest]) => (
                <tr key={month as string} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{month as string}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 font-mono text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: ENERGY & SOR ───────────────────────────────────────────────────────

function PageEnergy() {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period as keyof typeof PERIODS];
  const data = genDailyData(days);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Energy & Steam-Oil Ratio</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Thermal efficiency · SOR optimization · Carbon metrics</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Current SOR","4.8","","text-purple-700","bg-purple-50 border-purple-200","m³ steam / bbl oil"],
          ["Target SOR","4.3","","text-emerald-600","bg-emerald-50 border-emerald-200","AI optimized target"],
          ["Energy Intensity","21.4","kWh/bbl","text-blue-700","bg-blue-50 border-blue-200","at 48.6 BOPD"],
          ["Steam Consumption","5.7","m³/hr","text-orange-600","bg-orange-50 border-orange-200","injection rate"],
          ["Boiler Efficiency","84.2","%","text-slate-800","bg-slate-50 border-slate-200","steam generator"],
          ["Heat Utilization","72.8","%","text-amber-700","bg-amber-50 border-amber-200","of injected heat"],
          ["CO₂ Intensity","0.42","tCO₂/bbl","text-slate-800","bg-slate-50 border-slate-200","Scope 1"],
          ["Cost / bbl","₹1,840","","text-slate-800","bg-slate-50 border-slate-200","opex incl. steam"],
        ].map(([label,value,unit,val,bg,sub]) => (
          <div key={label as string} className={`rounded-xl border p-3 ${bg as string}`}>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label as string}</div>
            <div className={`text-xl font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string} <span className="text-xs font-normal text-slate-400">{unit as string}</span></div>
            <div className="text-xs text-slate-400 mt-0.5">{sub as string}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="SOR History" subtitle="Steam-Oil Ratio over time · CSS cycle overlay">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="cycle" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[3, 7]} />
                <Tooltip contentStyle={ttStyle} />
                <Bar yAxisId="l" dataKey="sor" fill="#7c3aed" opacity={0.7} radius={[2, 2, 0, 0]} name="SOR" />
                <Line yAxisId="l" type="monotone" dataKey="sor" stroke="#7c3aed" strokeWidth={2} dot={false} />
                <ReferenceLine yAxisId="l" y={4.3} stroke="#10b981" strokeDasharray="3 2" label={{ value: "AI Target", fontSize: 8, fill: "#10b981" }} />
                <ReferenceLine yAxisId="l" y={4.8} stroke="#f59e0b" strokeDasharray="3 2" label={{ value: "Current", fontSize: 8, fill: "#f59e0b" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Energy Intensity" subtitle="kWh per barrel vs production rate">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 7)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[15, 30]} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Area yAxisId="l" type="monotone" dataKey="energy" stroke="#0ea5e9" strokeWidth={2} fill="#e0f2fe" fillOpacity={0.5} dot={false} name="Energy kWh/bbl" />
                <Line yAxisId="r" type="monotone" dataKey="prod" stroke="#0a1628" strokeWidth={1.5} dot={false} name="Prod BOPD" strokeDasharray="4 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Steam Volume per Cycle" subtitle="m³ injected">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="cycle" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="steamVol" fill="#f97316" opacity={0.8} radius={[2, 2, 0, 0]} name="Steam Vol m³" />
                <ReferenceLine y={105} stroke="#10b981" strokeDasharray="3 2" label={{ value: "AI Target", fontSize: 8, fill: "#10b981" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="SOR vs Steam Volume" subtitle="Efficiency envelope">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="steamVol" name="Steam Vol m³" tick={axTick} axisLine={false} tickLine={false} label={{ value: "Steam Volume m³", fontSize: 9, fill: "#94a3b8", position: "insideBottom", offset: -4 }} />
                <YAxis dataKey="sor" name="SOR" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Scatter data={CSS_CYCLES} fill="#7c3aed" opacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader title="Carbon & Cost Summary" subtitle="Scope 1 emissions + operating cost breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Month","Oil bbl","Steam m³","SOR","Energy MWh","CO₂ tonne","Cost ₹L","₹/bbl"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Apr 2026",1380,6624,4.80,29.64,5.80,"25.4",1840],
                ["May 2026",1462,6921,4.73,30.12,5.89,"26.4",1806],
                ["Jun 2026",1410,6726,4.77,30.41,5.95,"26.1",1851],
                ["Jul 2026",1488,7068,4.75,29.88,5.84,"27.1",1820],
                ["Aug 2026",1512,7167,4.74,29.62,5.79,"27.4",1812],
              ].map(([month,...rest]) => (
                <tr key={month as string} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{month as string}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 font-mono text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: PREDICTIVE MAINTENANCE ────────────────────────────────────────────

function PageMaintenance() {
  const [period, setPeriod] = useState("Last 90 Days");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Predictive Maintenance</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · AI-powered equipment health monitoring · 98 active sensors</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Badge color="green">All Systems Normal</Badge>
        </div>
      </div>

      {/* Equipment health grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { name: "Sucker Rod String", health: 93, risk: "LOW", color: "#10b981", next: "Dec 2026", icon: "≡" },
          { name: "Downhole Pump", health: 87, risk: "LOW", color: "#10b981", next: "Mar 2027", icon: "⚙" },
          { name: "VFD / Motor", health: 91, risk: "LOW", color: "#10b981", next: "Jun 2027", icon: "⚡" },
          { name: "Wellhead Assembly", health: 96, risk: "LOW", color: "#10b981", next: "Sep 2027", icon: "⬡" },
          { name: "Steam Generator", health: 78, risk: "MEDIUM", color: "#f59e0b", next: "Nov 2026", icon: "♨" },
          { name: "Surface Piping", health: 88, risk: "LOW", color: "#10b981", next: "Jan 2027", icon: "—" },
          { name: "Pressure Sensors", health: 95, risk: "LOW", color: "#10b981", next: "Ongoing", icon: "◎" },
          { name: "Flow Meters", health: 82, risk: "LOW", color: "#10b981", next: "Feb 2027", icon: "▷" },
        ].map(({ name, health, risk, color, next, icon }) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{icon}</span>
              <Badge color={risk === "LOW" ? "green" : risk === "MEDIUM" ? "amber" : "red"}>{risk}</Badge>
            </div>
            <div className="text-xs font-semibold text-slate-800 mb-1">{name}</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{health}%</span>
              <span className="text-xs text-slate-400">health</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${health}%`, background: color }} />
            </div>
            <div className="text-xs text-slate-400">Next service: <span className="font-medium text-slate-600">{next}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming maintenance */}
        <Card className="col-span-1">
          <CardHeader title="Upcoming Maintenance" subtitle="Scheduled events" />
          <div className="p-4 space-y-3">
            {[
              { date: "Nov 15, 2026", task: "Steam Generator Inspection", priority: "HIGH", component: "Boiler #1", badge: "red" },
              { date: "Dec 14, 2026", task: "Rod String Visual Check", priority: "ROUTINE", component: "Sucker Rods", badge: "blue" },
              { date: "Jan 08, 2027", task: "Flow Meter Calibration", priority: "ROUTINE", component: "Prod. Meter", badge: "blue" },
              { date: "Mar 22, 2027", task: "Pump Inspection", priority: "SCHEDULED", component: "Downhole Pump", badge: "gray" },
              { date: "Jun 10, 2027", task: "VFD / Motor Service", priority: "SCHEDULED", component: "VFD Panel", badge: "gray" },
            ].map(({ date, task, priority, component, badge }) => (
              <div key={task} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                <div className="text-xs font-mono text-slate-400 whitespace-nowrap mt-0.5">{date}</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-700">{task}</div>
                  <div className="text-xs text-slate-400">{component}</div>
                </div>
                <Badge color={badge}>{priority}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Maintenance alerts */}
        <Card className="col-span-2">
          <CardHeader title="AI Maintenance Alerts" badge={<Badge color="blue">ML Model v2.4</Badge>} />
          <div className="p-4 space-y-3">
            {[
              {
                component: "Steam Generator",
                alert: "Boiler tube fouling detected. Heat transfer efficiency reduced by 8.2% over last 30 days.",
                action: "Schedule descaling before Cycle 15 injection. Estimated 6-hour service window required.",
                risk: "MEDIUM", badge: "amber", prob: 68,
              },
              {
                component: "Sucker Rod String (Sect. 21–24)",
                alert: "Cumulative fatigue load approaching 80% of design limit. Viscosity increase will accelerate loading.",
                action: "Reduce SPM to 4.7 immediately. Plan rod inspection at Day 75.",
                risk: "LOW", badge: "green", prob: 7,
              },
              {
                component: "Downhole Pump Valve",
                alert: "Minor valve seat wear pattern detected from dynamometer card analysis.",
                action: "Monitor pump fillage closely. If fillage drops below 65%, schedule pump pull.",
                risk: "LOW", badge: "green", prob: 12,
              },
            ].map(({ component, alert, action, risk, badge, prob }) => (
              <div key={component} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800">{component}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Failure prob: <span className="font-bold text-slate-700">{prob}%</span></span>
                    <Badge color={badge}>{risk}</Badge>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-2">{alert}</div>
                <div className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="font-semibold">Recommended: </span>{action}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Maintenance history */}
      <Card>
        <CardHeader title="Maintenance History" subtitle="All work orders · BGW-07" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date","Component","Work Order","Type","Technician","Duration","Cost ₹","Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["14 Sep 2026","Rod String","WO-2614","Inspection","R. Sharma","4 hr","12,400","Complete"],
                ["02 Jul 2026","Downhole Pump","WO-2588","Inspection","P. Mehta","6 hr","18,200","Complete"],
                ["18 Apr 2026","Sucker Rods 1-3","WO-2562","Replacement","R. Sharma","8 hr","46,800","Complete"],
                ["05 Jan 2026","Rod Section 22","WO-2501","Emergency","A. Singh","12 hr","1,24,000","Complete"],
                ["15 Nov 2025","Steam Generator","WO-2478","Descaling","S. Kumar","6 hr","32,600","Complete"],
                ["10 Oct 2025","VFD Panel","WO-2451","PM Service","P. Mehta","4 hr","8,400","Complete"],
              ].map(([date, ...rest], i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{date}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: AI RECOMMENDATIONS ─────────────────────────────────────────────────

function PageAI() {
  const [activeRec, setActiveRec] = useState(0);
  const recs = [
    {
      id: 1, priority: "HIGH", status: "Action Required", badge: "red",
      title: "Advance CSS Cycle 15 by 3 Days",
      rationale: "Reservoir temperature has declined 3.2°C over the last 8 days. Viscosity is rising, and production is projected to fall below economic cut-off in 9 days if no action is taken.",
      impact: [["Production gain","+4.4 BOPD","text-emerald-600"],["SOR improvement","4.8 → 4.4","text-emerald-600"],["Energy saving","−1.8 kWh/bbl","text-emerald-600"],["Revenue uplift","₹6,200/cycle","text-emerald-600"]],
      parameters: [["Steam Volume","120 → 115 m³"],["Soak Time","36 → 33 hr"],["Timing","3 days earlier"]],
      confidence: 91,
    },
    {
      id: 2, priority: "MEDIUM", status: "Recommended", badge: "amber",
      title: "Reduce SRP Speed: 5.2 → 4.7 SPM",
      rationale: "Pump fillage at 78% indicates partial pump loading. Reducing SPM will improve fillage to ~86%, reduce rod loading by 8%, and extend rod fatigue life. VFD frequency should be reduced from 42 Hz to 38 Hz.",
      impact: [["Pump fillage","78% → 86%","text-emerald-600"],["Rod load reduction","−8%","text-emerald-600"],["Rod risk reduction","7% → 4%","text-emerald-600"],["Energy saving","−0.9 kWh/bbl","text-emerald-600"]],
      parameters: [["SPM","5.2 → 4.7"],["VFD Frequency","42 → 38 Hz"],["Expected fillage","~86%"]],
      confidence: 88,
    },
    {
      id: 3, priority: "LOW", status: "Monitoring", badge: "blue",
      title: "Optimize Steam Injection Pressure",
      rationale: "Historical analysis of 13 CSS cycles shows injection pressure of 8.1 bar achieves better reservoir penetration than current 8.4 bar, with lower steam fingering. This could reduce SOR by up to 5%.",
      impact: [["SOR improvement","4.8 → 4.6","text-emerald-600"],["Steam saving","~8 m³/cycle","text-emerald-600"],["Coverage improvement","+6% area","text-emerald-600"],["Risk","LOW — tested in 4 cycles","text-slate-500"]],
      parameters: [["Injection Pressure","8.4 → 8.1 bar"],["Steam Volume","120 → 118 m³"],["Rate","48 → 50 m³/day"]],
      confidence: 76,
    },
    {
      id: 4, priority: "LOW", status: "Informational", badge: "gray",
      title: "Schedule Steam Generator Descaling",
      rationale: "Boiler heat transfer efficiency has dropped 8.2% over 30 days, indicating tube fouling. Descaling in next maintenance window before Cycle 15 injection will restore steam quality from 0.80 to 0.84.",
      impact: [["Steam quality","0.80 → 0.84","text-emerald-600"],["Boiler efficiency","+8.2%","text-emerald-600"],["Fuel saving","~₹4,400/month","text-emerald-600"],["Downtime","6 hr planned","text-slate-500"]],
      parameters: [["Service date","Before Cycle 15"],["Duration","6 hours"],["Type","Chemical descaling"]],
      confidence: 94,
    },
  ];
  const rec = recs[activeRec];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Recommendations</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Digital Twin model v3.2 · Updated 14s ago</p>
        </div>
        <Badge color="green">4 Active Recommendations</Badge>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "240px 1fr" }}>
        {/* Rec list */}
        <div className="flex flex-col gap-2">
          {recs.map((r, i) => (
            <button key={r.id} onClick={() => setActiveRec(i)}
              className={`text-left p-3 rounded-xl border transition-all ${activeRec === i ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <Badge color={r.badge}>{r.priority}</Badge>
                <span className="text-xs font-mono text-slate-400">{r.confidence}%</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 leading-snug">{r.title}</div>
              <div className="text-xs text-slate-400 mt-1">{r.status}</div>
            </button>
          ))}
        </div>

        {/* Rec detail */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={rec.badge}>{rec.priority}</Badge>
                <span className="text-xs text-slate-400">{rec.status}</span>
              </div>
              <div className="text-base font-bold text-slate-900">{rec.title}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Model Confidence</div>
              <div className="text-xl font-bold font-mono text-emerald-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rec.confidence}%</div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rationale</div>
                <div className="text-sm text-slate-700 leading-relaxed">{rec.rationale}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Parameters</div>
                <div className="grid grid-cols-2 gap-2">
                  {rec.parameters.map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                      <div className="text-xs text-slate-400">{k}</div>
                      <div className="text-sm font-mono font-bold text-blue-700">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ background: "#0a1628" }}>Apply Recommendation</button>
                <button className="px-5 py-2.5 text-sm font-semibold border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors">Simulate</button>
                <button className="px-5 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">Schedule</button>
                <button className="px-5 py-2.5 text-sm font-semibold text-slate-400 rounded-xl hover:text-slate-600 transition-colors">Dismiss</button>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Expected Impact</div>
              <div className="space-y-2">
                {rec.impact.map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className={`text-xs font-mono font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-500 mb-2">Confidence Breakdown</div>
                {[["Data Quality","96%"],["Model Fit","89%"],["Historical Match","88%"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-mono font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendation history */}
      <Card>
        <CardHeader title="Recommendation History" subtitle="Applied, scheduled, and dismissed" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date","Recommendation","Action","Result","Production Impact","Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["28 Aug 2026","Reduce SPM from 5.6 to 5.2","Applied","Pump fillage: 72% → 78%","+2.1 BOPD","Success"],
                ["12 Aug 2026","Advance Cycle 13 by 2 days","Applied","Temp recovered +4.2°C","+3.8 BOPD","Success"],
                ["01 Jul 2026","Increase steam volume to 125 m³","Applied","SOR increased 0.3","−0.5 BOPD","Partial"],
                ["15 Jun 2026","Reduce injection pressure 8.6 → 8.2","Applied","Better reservoir sweep","+1.2 BOPD","Success"],
                ["20 May 2026","Change stroke length to 108 in","Dismissed","N/A","N/A","Dismissed"],
              ].map(([date,...rest], i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{date}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className={`px-4 py-2.5 ${j === 4 ? (cell as string).startsWith("+") ? "text-emerald-600 font-semibold" : (cell as string).startsWith("−") ? "text-red-500 font-semibold" : "text-slate-400" : "text-slate-600"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: HISTORICAL DATA ────────────────────────────────────────────────────

function PageHistory() {
  const [period, setPeriod] = useState("Last 1 Year");
  const [dateFrom, setDateFrom] = useState("2025-09-10");
  const [dateTo, setDateTo] = useState("2026-09-10");
  const [metric, setMetric] = useState("All");
  const days = PERIODS[period as keyof typeof PERIODS];
  const data = genDailyData(days);
  const rod = genRodHistory(days);
  const srp = genSRPHistory(days);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Historical Data Archive</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Full production history · All sensors and parameters</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-500 font-medium">Period</label>
          <PeriodSelector value={period} onChange={setPeriod} />
          <label className="text-xs text-slate-500 font-medium">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <label className="text-xs text-slate-500 font-medium">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select value={metric} onChange={e => setMetric(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            {["All","Production","Reservoir","SRP","Energy","Rod Health"].map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="text-xs px-3 py-1.5 text-white rounded-lg font-medium hover:opacity-90" style={{ background: "#0a1628" }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-6 gap-2.5">
        {[
          ["Avg. Production",(data.reduce((a,d)=>a+d.prod,0)/data.length).toFixed(1),"BOPD","text-slate-800"],
          ["Peak Production",Math.max(...data.map(d=>d.prod)).toFixed(1),"BOPD","text-emerald-600"],
          ["Total Oil Produced",data.reduce((a,d)=>a+d.prod,0).toFixed(0),"bbl","text-blue-700"],
          ["Avg. Reservoir Temp",(data.reduce((a,d)=>a+d.temp,0)/data.length).toFixed(1),"°C","text-orange-600"],
          ["Avg. SOR",(data.reduce((a,d)=>a+d.sor,0)/data.length).toFixed(2),"","text-purple-700"],
          ["Avg. Energy",(data.reduce((a,d)=>a+d.energy,0)/data.length).toFixed(1),"kWh/bbl","text-blue-600"],
        ].map(([label,value,unit,color]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label as string}</div>
            <div className={`text-lg font-bold font-mono ${color as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string} <span className="text-xs font-normal text-slate-400">{unit as string}</span></div>
          </div>
        ))}
      </div>

      {/* Multi-param chart */}
      <ChartCard title="Multi-Parameter History" subtitle="Production · Temperature · Viscosity · SOR — full selected period">
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
              <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 9)} />
              <YAxis yAxisId="prod" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[20, 65]} />
              <YAxis yAxisId="temp" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[40, 80]} />
              <Tooltip contentStyle={ttStyle} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
              <Area yAxisId="prod" type="monotone" dataKey="prod" stroke="#0a1628" strokeWidth={2} fill="#0a162818" dot={false} name="Oil BOPD" />
              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={1.5} dot={false} name="Temp °C" />
              <Line yAxisId="prod" type="monotone" dataKey="sor" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="SOR" strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="SRP Performance History" subtitle="SPM · Fillage · VFD over time">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={srp}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(srp.length / 6)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[2, 10]} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[40, 100]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Line yAxisId="l" type="monotone" dataKey="spm" stroke="#0a1628" strokeWidth={1.5} dot={false} name="SPM" />
                <Area yAxisId="r" type="monotone" dataKey="fillage" stroke="#0ea5e9" strokeWidth={1.5} fill="#e0f2fe" fillOpacity={0.5} dot={false} name="Fillage %" />
                <Bar yAxisId="l" dataKey="vfd" fill="#7c3aed" opacity={0.4} radius={[1,1,0,0]} name="VFD Hz" maxBarSize={6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rod Risk & Energy History" subtitle="% risk · kWh/bbl over time">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rod}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(rod.length / 6)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[0, 30]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Area yAxisId="l" type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} fill="#fef9c3" fillOpacity={0.7} dot={false} name="Rod Risk %" />
                <Line yAxisId="l" type="monotone" dataKey="load" stroke="#0a1628" strokeWidth={1.5} dot={false} name="Rod Load kN" />
                <ReferenceLine yAxisId="l" y={15} stroke="#f97316" strokeDasharray="3 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Raw data table */}
      <Card>
        <CardHeader title="Raw Data Table" subtitle={`${data.length} records · ${period}`}
          badge={<button className="text-xs px-3 py-1.5 text-white rounded-lg font-medium hover:opacity-90" style={{ background: "#0a1628" }}>Export</button>} />
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0">
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date","Prod BOPD","Temp °C","Viscosity cP","BHP bar","WC %","Energy kWh/bbl","SOR","Fluid Level m"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{d.date}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-emerald-700">{d.prod}</td>
                  <td className="px-4 py-2 font-mono text-orange-600">{d.temp}</td>
                  <td className="px-4 py-2 font-mono text-amber-700">{d.visc.toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono">{d.bhp}</td>
                  <td className="px-4 py-2 font-mono text-blue-600">{d.wc.toFixed(1)}</td>
                  <td className="px-4 py-2 font-mono text-blue-700">{d.energy}</td>
                  <td className="px-4 py-2 font-mono text-purple-700">{d.sor}</td>
                  <td className="px-4 py-2 font-mono">{d.fluidLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PAGE: OVERVIEW ────────────────────────────────────────────────────────────

function PageOverview() {
  const data14 = genDailyData(14);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Field Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Baghewala Field · 4 active wells · CSS Programme active</p>
        </div>
        <Badge color="green">All Wells Operational</Badge>
      </div>

      {/* All wells */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { well: "BGW-07", phase: "PROD", prod: 48.6, temp: 62.4, sor: 4.8, fillage: 78, color: "border-emerald-300 bg-emerald-50" },
          { well: "BGW-09", phase: "SOAK", prod: 41.2, temp: 58.8, sor: 5.1, fillage: 72, color: "border-amber-300 bg-amber-50" },
          { well: "BGW-12", phase: "STEAM", prod: 36.8, temp: 54.2, sor: 5.4, fillage: 68, color: "border-orange-300 bg-orange-50" },
          { well: "BGW-15", phase: "IDLE", prod: 0, temp: 49.2, sor: 0, fillage: 0, color: "border-slate-200 bg-slate-50" },
        ].map(({ well, phase, prod, temp, sor, fillage, color }) => (
          <div key={well} className={`rounded-xl border p-4 ${color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-900">{well}</div>
              <Badge color={phase === "PROD" ? "green" : phase === "SOAK" ? "amber" : phase === "STEAM" ? "orange" : "gray"}>{phase}</Badge>
            </div>
            <StatRow label="Production" value={prod > 0 ? prod : "—"} unit={prod > 0 ? "BOPD" : ""} color="green" />
            <StatRow label="Res. Temp" value={temp} unit="°C" color="orange" />
            <StatRow label="SOR" value={sor > 0 ? sor : "—"} color="purple" />
            <StatRow label="Pump Fillage" value={fillage > 0 ? fillage + "%" : "—"} color="blue" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Field Production (Last 14 days)" subtitle="All wells combined BOPD">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data14.map(d => ({ ...d, total: +(d.prod * 1.28).toFixed(1) }))}>
                <defs>
                  <linearGradient id="gfield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="total" stroke="#0a1628" strokeWidth={2} fill="url(#gfield)" name="Field BOPD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Field SOR Comparison" subtitle="Per well · Latest CSS cycle">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ well: "BGW-07", sor: 4.8 }, { well: "BGW-09", sor: 5.1 }, { well: "BGW-12", sor: 5.4 }, { well: "BGW-15", sor: 0 }]}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" />
                <XAxis dataKey="well" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 7]} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="sor" fill="#7c3aed" radius={[4, 4, 0, 0]} name="SOR" />
                <ReferenceLine y={4.8} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Target", fontSize: 8, fill: "#10b981" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Today's Field Summary" />
          <div className="p-4">
            <StatRow label="Total Field Production" value="126.6" unit="BOPD" color="green" />
            <StatRow label="Active Wells" value="3" unit="/ 4" color="blue" />
            <StatRow label="Wells in Steam" value="1" unit="(BGW-12)" color="orange" />
            <StatRow label="Wells in Soak" value="1" unit="(BGW-09)" color="amber" />
            <StatRow label="Field Energy" value="21.8" unit="kWh/bbl avg" color="blue" />
            <StatRow label="Field SOR" value="5.1" unit="avg" color="purple" />
            <StatRow label="Sensor Coverage" value="98.2" unit="%" color="green" />
            <StatRow label="Twin Health" value="96" unit="%" color="green" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Active Alerts" badge={<Badge color="amber">2 Alerts</Badge>} />
          <div className="p-4 space-y-3">
            {[
              { msg: "BGW-07: Reservoir cooling trend — viscosity increase predicted", level: "amber" },
              { msg: "BGW-12: Steam injection pressure 0.3 bar above optimal", level: "amber" },
              { msg: "BGW-09: Soak phase optimal. Production start in ~18 hr", level: "blue" },
              { msg: "All rod strings: Normal fatigue status", level: "green" },
            ].map(({ msg, level }) => (
              <div key={msg} className={`rounded-lg p-2.5 text-xs ${level === "amber" ? "bg-amber-50 border border-amber-200 text-amber-800" : level === "green" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}>
                {msg}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="CSS Programme Status" />
          <div className="p-4 space-y-2">
            {[
              { well: "BGW-07", cycle: "C14", phase: "Production", day: "Day 12/21", color: "bg-emerald-100 text-emerald-700" },
              { well: "BGW-09", cycle: "C13", phase: "Soak", day: "Day 2/3", color: "bg-amber-100 text-amber-700" },
              { well: "BGW-12", cycle: "C12", phase: "Steam Inj.", day: "Day 1/3", color: "bg-orange-100 text-orange-700" },
              { well: "BGW-15", cycle: "—", phase: "Idle", day: "Next: Oct 5", color: "bg-slate-100 text-slate-500" },
            ].map(({ well, cycle, phase, day, color }) => (
              <div key={well} className={`rounded-lg px-3 py-2.5 ${color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{well}</span>
                  <span className="text-xs font-mono">{cycle}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-medium">{phase}</span>
                  <span className="text-xs">{day}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PAGE: SETTINGS ───────────────────────────────────────────────────────────

function PageSettings() {
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [thresholds, setThresholds] = useState({ tempLow: 55, tempHigh: 70, sorMax: 5.5, rodRisk: 20 });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">System configuration · Alerts · Thresholds · Digital twin parameters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Well Configuration" subtitle="BGW-07 static parameters" />
          <div className="p-4 space-y-3">
            {[
              ["Well Name","BGW-07"],["Field","Baghewala, Rajasthan"],["Formation","Bikaner–Nagaur"],
              ["Total Depth","310 m TVD"],["Casing Size","7 inch"],["Tubing Size","2.875 inch"],
              ["Rod Grade","API Grade D"],["Rod String Length","310 m"],["SRP Unit","228-213-86"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{k}</span>
                <input className="text-xs font-mono font-semibold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 bg-white w-40 text-right focus:outline-none focus:ring-2 focus:ring-blue-400" defaultValue={v as string} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Alert Thresholds" subtitle="Trigger AI recommendations and alarms" />
          <div className="p-4 space-y-4">
            {[
              { label: "Min. Reservoir Temp (°C)", key: "tempLow", min: 40, max: 65, unit: "°C" },
              { label: "Max. Reservoir Temp (°C)", key: "tempHigh", min: 65, max: 85, unit: "°C" },
              { label: "Max SOR Threshold", key: "sorMax", min: 4, max: 8, unit: "" },
              { label: "Rod Risk Alert Level (%)", key: "rodRisk", min: 10, max: 40, unit: "%" },
            ].map(({ label, key, min, max, unit }) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="font-mono font-bold text-blue-700">{thresholds[key as keyof typeof thresholds]}{unit}</span>
                </div>
                <input type="range" min={min} max={max} value={thresholds[key as keyof typeof thresholds]}
                  onChange={e => setThresholds({ ...thresholds, [key]: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-full accent-blue-600 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>{min}</span><span>{max}</span></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Notification Settings" />
          <div className="p-4 space-y-4">
            {[
              { label: "Email Notifications", key: "email", desc: "r.sharma@cairnindia.com" },
              { label: "SMS Alerts", key: "sms", desc: "+91 98765 43210" },
              { label: "Push Notifications", key: "push", desc: "Mobile app · WellTwin AI" },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-slate-700">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${notifications[key as keyof typeof notifications] ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${notifications[key as keyof typeof notifications] ? "left-5.5 translate-x-1" : "left-0.5"}`} style={{ left: notifications[key as keyof typeof notifications] ? 22 : 2 }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Model Settings" badge={<Badge color="blue">v3.2.1</Badge>} />
          <div className="p-4 space-y-3">
            {[
              ["Model Version","DT-Heavy-Oil v3.2.1"],["Training Data","2,847 well-days"],
              ["Last Retrained","01 Sep 2026"],["Prediction Horizon","72 hours"],
              ["Update Frequency","Real-time (14s)"],["Confidence Threshold","75%"],
              ["Formation Model","Bikaner–Nagaur HO"],["Auto-Apply Threshold","90%"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{k}</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{v as string}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <button onClick={save} className={`px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-all ${saved ? "bg-emerald-600" : "hover:opacity-90"}`}
          style={saved ? {} : { background: "#0a1628" }}>
          {saved ? "✓ Saved" : "Save Settings"}
        </button>
        <button className="px-6 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          Reset Defaults
        </button>
        <button className="px-6 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          Export Config
        </button>
      </div>
    </div>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────

const navItems = [
  { id: "overview", label: "Overview", icon: "⬡" },
  { id: "twin", label: "Digital Twin", icon: "◈" },
  { id: "reservoir", label: "Reservoir", icon: "⬡" },
  { id: "css", label: "CSS Optimization", icon: "♨" },
  { id: "srp", label: "SRP Optimization", icon: "⚙" },
  { id: "rod", label: "Rod Health", icon: "≡" },
  { id: "production", label: "Production", icon: "▲" },
  { id: "energy", label: "Energy & SOR", icon: "⚡" },
  { id: "maintenance", label: "Pred. Maintenance", icon: "⚠" },
  { id: "ai", label: "AI Recommendations", icon: "◎" },
  { id: "history", label: "Historical Data", icon: "⊞" },
  { id: "settings", label: "Settings", icon: "◐" },
];

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("twin");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pages: Record<string, React.ReactNode> = {
    overview: <PageOverview />,
    twin: <PageDigitalTwin />,
    reservoir: <PageReservoir />,
    css: <PageCSS />,
    srp: <PageSRP />,
    rod: <PageRodHealth />,
    production: <PageProduction />,
    energy: <PageEnergy />,
    maintenance: <PageMaintenance />,
    ai: <PageAI />,
    history: <PageHistory />,
    settings: <PageSettings />,
  };

  const tickerItems = [
    "BGW-07 Oil Production: 48.6 BOPD", "Reservoir Temp: 62.4°C", "Oil Viscosity: 18,700 cP",
    "Pump Fillage: 78%", "SOR: 4.8", "Steam Injection BGW-12: ACTIVE", "VFD: 42 Hz",
    "Rod Load: NORMAL", "Twin Health: 96%", "BGW-09 Oil Production: 41.2 BOPD",
    "BGW-12 Res. Temp: 54.2°C", "Field Total: 126.6 BOPD",
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* HEADER */}
      <header className="flex-none h-14 bg-white border-b border-slate-200 shadow-sm flex items-center px-4 gap-4 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg,#0a1628,#1e3a6e)" }}>WT</div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none">WELLTWIN AI</div>
            <div className="text-xs text-slate-400 leading-none mt-0.5">Well-to-Surface Digital Twin</div>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer">
          <option>Baghewala Field</option><option>Mangala Field</option><option>Aishwarya Field</option>
        </select>
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer">
          <option>BGW-07</option><option>BGW-09</option><option>BGW-12</option><option>BGW-15</option>
        </select>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
          <span className="text-xs font-semibold text-emerald-700">LIVE</span>
        </div>
        <div className="flex-1 ticker-wrap overflow-hidden text-xs text-slate-400 font-mono border-l border-r border-slate-100 px-3">
          <span className="ticker-content">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="mr-12">{item}</span>
            ))}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono font-semibold text-slate-700">{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
          <div className="text-xs text-slate-400">{currentTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#0a1628" }}>PE</div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR */}
        <aside className="flex-none w-48 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-3 pt-4 flex-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-left transition-all text-xs font-medium
                  ${activeNav === item.id ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                style={activeNav === item.id ? { background: "#0a1628" } : {}}>
                <span className="text-sm leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Field Status</div>
            {[
              { well: "BGW-07", status: "PROD", color: "#10b981" },
              { well: "BGW-09", status: "SOAK", color: "#f59e0b" },
              { well: "BGW-12", status: "STEAM", color: "#f97316" },
              { well: "BGW-15", status: "IDLE", color: "#94a3b8" },
            ].map(({ well, status, color }) => (
              <div key={well} className="flex items-center justify-between py-0.5">
                <span className="text-xs font-mono text-slate-600">{well}</span>
                <span className="text-xs font-semibold rounded px-1.5 py-0.5" style={{ color, background: color + "18", fontSize: 10 }}>{status}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4">
          {pages[activeNav]}
        </main>
      </div>
    </div>
  );
}
