import React, { useState, useEffect, useRef } from "react";
import { WellState } from "./types/simulation";
import { getInitialState, stepSimulation } from "./services/simulationEngine";
import { ComponentDetailModal } from "./components/ui/ComponentDetailModal";
import { WhatIfModal } from "./components/common/WhatIfModal";

// 12 Operational SCADA Pages from Figma Design
import { PageOverview } from "./pages/PageOverview";
import { PageDigitalTwin } from "./pages/PageDigitalTwin";
import { PageReservoir } from "./pages/PageReservoir";
import { PageCSS } from "./pages/PageCSS";
import { PageSRP } from "./pages/PageSRP";
import { PageRodHealth } from "./pages/PageRodHealth";
import { PageProduction } from "./pages/PageProduction";
import { PageEnergy } from "./pages/PageEnergy";
import { PageMaintenance } from "./pages/PageMaintenance";
import { PageAI } from "./pages/PageAI";
import { PageHistory } from "./pages/PageHistory";
import { PageSettings } from "./pages/PageSettings";

// Navigation Items Matching Figma
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

export function App() {
  const [activeNav, setActiveNav] = useState("twin");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWell, setSelectedWell] = useState("BGW-07");
  const [selectedField, setSelectedField] = useState("Baghewala Field");
  const [selectedComponentName, setSelectedComponentName] = useState<string | null>(null);
  const [isGlobalWhatIfOpen, setIsGlobalWhatIfOpen] = useState(false);

  // Background Physics & Kinematics Engine for 3D Digital Twin
  const [wellState, setWellState] = useState<WellState>(getInitialState());
  const lastTimeRef = useRef<number>(performance.now());
  const stateRef = useRef<WellState>(wellState);
  stateRef.current = wellState;

  // Real-time clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Slow-Mode Prototype Telemetry Engine (Updates gently every 4s without disrupting charts)
  useEffect(() => {
    const timer = setInterval(() => {
      setWellState((prev) => {
        if (prev.isPaused) return prev;
        const prodDrift = (Math.random() - 0.5) * 0.15;
        const tempDrift = (Math.random() - 0.5) * 0.05;
        return {
          ...prev,
          productionRate: Math.max(38, Math.min(54, +(prev.productionRate + prodDrift).toFixed(1))),
          reservoirTemp: Math.max(58, Math.min(66, +(prev.reservoirTemp + tempDrift).toFixed(1))),
          whpBar: +(8.4 + (Math.random() - 0.5) * 0.04).toFixed(1),
          bhpBar: +(14.2 + (Math.random() - 0.5) * 0.06).toFixed(1),
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Callback when What-If simulation parameters are applied
  const handleApplyWhatIfParams = (params: {
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
  }) => {
    setWellState((prev) => ({
      ...prev,
      spm: params.spm,
      targetSpm: params.spm,
      reservoirTemp: params.predTemp,
      viscositycP: params.predVisc,
      productionRate: params.predProd,
      heatedZoneRadius: params.predPlumeRadius,
      injPressureBar: params.injPressure,
      whpBar: +(params.injPressure * 0.98).toFixed(1),
      aiRecommendationApplied: true,
      anomalyDetected: false,
      anomalyMessage: null,
    }));
  };

  const handleApplyAIAction = (title: string) => {
    if (title.includes("SPM")) {
      setWellState((prev) => ({
        ...prev,
        spm: 4.7,
        targetSpm: 4.7,
        pumpFillagePercent: 86,
        rodFailureRiskPercent: 4,
        aiRecommendationApplied: true,
      }));
    } else if (title.includes("Cycle 15") || title.includes("Steam")) {
      setWellState((prev) => ({
        ...prev,
        reservoirTemp: 66.2,
        viscositycP: 15400,
        productionRate: 52.8,
        heatedZoneRadius: 18.5,
        aiRecommendationApplied: true,
      }));
    }
  };

  // Marquee Ticker Telemetry Items
  const tickerItems = [
    `BGW-07 Oil Production: ${(wellState.productionRate || 48.6).toFixed(1)} BOPD`,
    `Reservoir Temp: ${(wellState.reservoirTemp || 62.4).toFixed(1)}°C`,
    `Oil Viscosity: ${(wellState.viscositycP || 18700).toLocaleString()} cP`,
    `Pump Fillage: ${wellState.pumpFillagePercent || 78}%`,
    `SOR: ${(wellState.sor || 4.8).toFixed(1)}`,
    `Steam Injection BGW-12: ACTIVE`,
    `VFD: 42 Hz`,
    `Rod Load: ${wellState.rodFailureRiskPercent > 12 ? "ELEVATED" : "NORMAL"}`,
    `Twin Health: 96%`,
    `BGW-09 Oil Production: 41.2 BOPD`,
    `BGW-12 Res. Temp: 54.2°C`,
    `Field Total: 126.6 BOPD`,
  ];

  const renderActivePage = () => {
    switch (activeNav) {
      case "overview":
        return <PageOverview />;
      case "twin":
        return (
          <PageDigitalTwin
            wellState={wellState}
            onApplyWhatIf={handleApplyWhatIfParams}
            onSelectComponent={(name) => setSelectedComponentName(name)}
          />
        );
      case "reservoir":
        return <PageReservoir />;
      case "css":
        return <PageCSS />;
      case "srp":
        return <PageSRP onApplySPM={(spm) => setWellState((prev) => ({ ...prev, spm, targetSpm: spm }))} />;
      case "rod":
        return <PageRodHealth />;
      case "production":
        return <PageProduction />;
      case "energy":
        return <PageEnergy />;
      case "maintenance":
        return <PageMaintenance />;
      case "ai":
        return (
          <PageAI
            onApplyAIAction={handleApplyAIAction}
            onOpenWhatIf={() => setIsGlobalWhatIfOpen(true)}
          />
        );
      case "history":
        return <PageHistory />;
      case "settings":
        return <PageSettings />;
      default:
        return (
          <PageDigitalTwin
            wellState={wellState}
            onApplyWhatIf={handleApplyWhatIfParams}
            onSelectComponent={(name) => setSelectedComponentName(name)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden font-sans select-none">
      {/* ─── SCADA FIGMA HEADER ──────────────────────────────────────────────── */}
      <header className="flex-none h-14 bg-white border-b border-slate-200 shadow-xs flex items-center px-4 gap-3 z-30">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-xs tracking-wider"
            style={{ background: "linear-gradient(135deg, #0a1628, #1e3a6e)" }}
          >
            WT
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 leading-none tracking-tight">WELLTWIN AI</div>
            <div className="text-[10px] text-slate-400 font-medium leading-none mt-1">Well-to-Surface Digital Twin</div>
          </div>
        </div>

        <div className="w-px h-7 bg-slate-200 hidden sm:block" />

        {/* Field & Well Dropdowns */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hidden md:block"
          >
            <option>Baghewala Field</option>
            <option>Mangala Field</option>
            <option>Aishwarya Field</option>
          </select>

          <select
            value={selectedWell}
            onChange={(e) => setSelectedWell(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option>BGW-07</option>
            <option>BGW-09</option>
            <option>BGW-12</option>
            <option>BGW-15</option>
          </select>
        </div>

        {/* LIVE Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
          <span className="text-[11px] font-bold text-emerald-700 tracking-wide">LIVE</span>
        </div>

        {/* Live Animated Telemetry Ticker (Figma Design) */}
        <div className="flex-1 ticker-wrap overflow-hidden text-xs text-slate-500 font-mono border-l border-r border-slate-100 px-3 hidden lg:block">
          <span className="ticker-content">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="mr-10">
                {item}
              </span>
            ))}
          </span>
        </div>

        {/* Clock & Status */}
        <div className="text-right flex-shrink-0 ml-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="text-xs font-mono font-bold text-slate-800">
              {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-85 shadow-2xs transition-opacity"
            style={{ background: "#0a1628" }}
            title="Petroleum Production Engineer"
          >
            PE
          </div>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE (SIDEBAR + CONTENT) ────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT NAVIGATION SIDEBAR */}
        <aside className="flex-none w-48 sm:w-52 bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-20">
          <div className="p-3 flex-1 space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-xs font-medium cursor-pointer ${
                    isActive
                      ? "text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                  style={isActive ? { background: "#0a1628" } : {}}
                >
                  <span className="text-sm leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.id === "twin" && (
                    <span className="ml-auto text-[9px] font-mono bg-cyan-500/20 text-cyan-400 px-1 py-0.2 rounded border border-cyan-500/30">
                      3D
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Field Status Widget */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Field Well Status
            </div>
            {[
              { well: "BGW-07", status: "PROD", color: "#10b981" },
              { well: "BGW-09", status: "SOAK", color: "#f59e0b" },
              { well: "BGW-12", status: "STEAM", color: "#f97316" },
              { well: "BGW-15", status: "IDLE", color: "#94a3b8" },
            ].map(({ well, status, color }) => (
              <div key={well} className="flex items-center justify-between py-1">
                <span className="text-xs font-mono font-medium text-slate-700">{well}</span>
                <span
                  className="text-[10px] font-bold rounded px-1.5 py-0.5"
                  style={{ color, background: `${color}18` }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN PAGE RENDERER */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 bg-slate-50">
          {renderActivePage()}
        </main>
      </div>

      {/* ─── GLOBAL MODALS ─────────────────────────────────────────────────── */}
      {/* 3D Component Inspection Modal */}
      <ComponentDetailModal
        componentName={selectedComponentName}
        wellState={wellState}
        onClose={() => setSelectedComponentName(null)}
      />

      {/* Global What-If Modal Triggered from AI Recommendations */}
      {isGlobalWhatIfOpen && (
        <WhatIfModal
          onClose={() => setIsGlobalWhatIfOpen(false)}
          onApplyToLiveTwin={handleApplyWhatIfParams}
        />
      )}
    </div>
  );
}

export default App;
