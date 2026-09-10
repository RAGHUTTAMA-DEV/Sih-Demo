import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { WellState, CameraPreset } from "../types/simulation";
import { genDailyData } from "../data/mockData";
import { Card, ChartCard, axTick, ttStyle } from "../components/common/FigmaShared";
import { WhatIfModal } from "../components/common/WhatIfModal";
import { DigitalTwinViz } from "../components/schematic/DigitalTwinViz";
import { DigitalTwinScene } from "../components/3d/DigitalTwinScene";

interface PageDigitalTwinProps {
  wellState: WellState;
  onApplyWhatIf: (params: {
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
  onSelectComponent?: (name: string) => void;
}

export function PageDigitalTwin({ wellState, onApplyWhatIf, onSelectComponent }: PageDigitalTwinProps) {
  const [viewType, setViewType] = useState<"3d" | "schematic">("3d");
  const [schematicMode, setSchematicMode] = useState("twin");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("overview");
  const [showSpatialTags, setShowSpatialTags] = useState(false);
  const [timeSlider, setTimeSlider] = useState(7);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const data30 = useMemo(() => genDailyData(30), []);

  return (
    <div className="space-y-4">
      {/* Top 8 KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          {
            label: "Oil Production",
            value: (wellState.productionRate || 48.6).toFixed(1),
            unit: "BOPD",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            val: "text-emerald-700",
            delta: "↑ 2.1 vs yesterday"
          },
          {
            label: "Reservoir Temp",
            value: (wellState.reservoirTemp || 62.4).toFixed(1),
            unit: "°C",
            bg: "bg-orange-50",
            border: "border-orange-200",
            val: "text-orange-600",
            delta: "↓ 1.2°C vs peak"
          },
          {
            label: "Oil Viscosity",
            value: (wellState.viscositycP || 18700).toLocaleString(),
            unit: "cP",
            bg: "bg-amber-50",
            border: "border-amber-200",
            val: "text-amber-700",
            delta: "Arrhenius thermal"
          },
          {
            label: "Pump Fillage",
            value: `${wellState.pumpFillagePercent || 78}%`,
            unit: "",
            bg: "bg-blue-50",
            border: "border-blue-200",
            val: "text-blue-700",
            delta: "Target: 85%"
          },
          {
            label: "SOR",
            value: (wellState.sor || 4.8).toFixed(1),
            unit: "",
            bg: "bg-purple-50",
            border: "border-purple-200",
            val: "text-purple-700",
            delta: "↓ 0.3 vs cycle avg"
          },
          {
            label: "Energy",
            value: (wellState.energyKwhPerBbl || 21.4).toFixed(1),
            unit: "kWh/bbl",
            bg: "bg-sky-50",
            border: "border-sky-200",
            val: "text-sky-700",
            delta: "Electrical lift"
          },
          {
            label: "Rod Failure Risk",
            value: wellState.rodFailureRiskPercent > 15 ? "HIGH" : wellState.rodFailureRiskPercent > 8 ? "MED" : "LOW",
            unit: `(${wellState.rodFailureRiskPercent}%)`,
            bg: wellState.rodFailureRiskPercent > 15 ? "bg-red-50" : "bg-emerald-50",
            border: wellState.rodFailureRiskPercent > 15 ? "border-red-200" : "border-emerald-200",
            val: wellState.rodFailureRiskPercent > 15 ? "text-red-700" : "text-emerald-700",
            delta: "Fatigue stress"
          },
          {
            label: "Twin Health",
            value: "96%",
            unit: "",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            val: "text-emerald-700",
            delta: "98 sensors active"
          },
        ].map(({ label, value, unit, bg, border, val, delta }) => (
          <div key={label} className={`rounded-xl border p-3 shadow-2xs ${bg} ${border}`}>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">{label}</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold font-mono ${val}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
              {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{delta}</div>
          </div>
        ))}
      </div>

      {/* Main Hero Container */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        {/* Left / Center Viewport */}
        <div>
          <Card className="overflow-hidden flex flex-col">
            {/* Viewport Header */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 bg-white gap-2 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                <span className="text-sm font-bold text-slate-900">Digital Twin — BGW-07</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">Baghewala · 310m TD</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* 3D vs 2D Primary Switcher */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewType("3d")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewType === "3d"
                        ? "bg-[#0a1628] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ✦ 3D Interactive Model
                  </button>
                  <button
                    onClick={() => setViewType("schematic")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewType === "schematic"
                        ? "bg-[#0a1628] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    2D Schematic
                  </button>
                </div>

                {/* Sub-controls depending on view */}
                {viewType === "3d" ? (
                  <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                    {(["overview", "pumpjack", "wellbore", "reservoir"] as CameraPreset[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCameraPreset(p)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                          cameraPreset === p ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowSpatialTags(!showSpatialTags)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        showSpatialTags ? "bg-amber-500 text-white font-bold" : "text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      🏷️ Tags
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {["twin", "physical", "thermal", "flow"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSchematicMode(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          schematicMode === m
                            ? "bg-[#0a1628] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Viewport Canvas + Side Telemetry Bar */}
            <div className="flex flex-col md:flex-row min-h-[520px] bg-[#0c1425] relative">
              {/* Actual Visualizer Area */}
              <div className="flex-1 relative min-h-[480px] w-full overflow-hidden">
                {viewType === "3d" ? (
                  <div className="w-full h-full absolute inset-0">
                    <DigitalTwinScene
                      wellState={wellState}
                      activeCameraPreset={cameraPreset}
                      showSpatialTags={showSpatialTags}
                      onSelectComponent={onSelectComponent || (() => {})}
                    />

                    {/* Quick 3D HUD Watermark */}
                    <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 pointer-events-none">
                      <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        3D KINEMATICS ACTIVE
                      </div>
                      <div>SPM: {wellState.spm.toFixed(1)} | Plume: {wellState.heatedZoneRadius}m</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center bg-white">
                    <DigitalTwinViz mode={schematicMode} />
                  </div>
                )}
              </div>

              {/* Live SCADA Telemetry Column (Figma Design) */}
              <div className="w-full md:w-48 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-3.5 flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Telemetry</div>
                {[
                  ["WHP", `${(wellState.whpBar || 8.4).toFixed(1)} bar`, "#0ea5e9"],
                  ["BHP", `${(wellState.bhpBar || 14.2).toFixed(1)} bar`, "#0284c7"],
                  ["Inj. Press", `${(wellState.injPressureBar || 8.4).toFixed(1)} bar`, "#f97316"],
                  ["Fluid Level", `${wellState.fluidLevelM || 142} m`, "#3b82f6"],
                  ["Rod Load", `${(wellState.rodLoadKn || 18.4).toFixed(1)} kN`, "#475569"],
                  ["Motor Amps", `${(wellState.motorAmps || 38.2).toFixed(1)} A`, "#64748b"],
                  ["Stroke Rate", `${wellState.spm.toFixed(1)} SPM`, "#0a1628"],
                  ["Prod. Rate", `${(wellState.productionRate || 48.6).toFixed(1)} BOPD`, "#10b981"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-1 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {value}
                    </span>
                  </div>
                ))}

                <div className="mt-auto pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">CSS Phase</div>
                  {[
                    ["Steam Inj.", true, false],
                    ["Soak", true, false],
                    ["Production", false, true],
                    ["Cooling", false, false]
                  ].map(([phase, done, active]) => (
                    <div key={phase as string} className="flex items-center gap-2 mb-1.5">
                      <div className={`w-2 h-2 rounded-full ${active ? "bg-amber-500 animate-pulse" : done ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <span className={`text-xs ${active ? "font-bold text-amber-800" : done ? "text-slate-600" : "text-slate-300"}`}>
                        {phase as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Timeline and What-If Bar */}
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-600 font-semibold whitespace-nowrap flex items-center gap-1.5">
                <span>⏱</span> Timeline Scrubber
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={timeSlider}
                onChange={(e) => setTimeSlider(+e.target.value)}
                className="flex-1 h-1.5 rounded-full accent-blue-600 bg-slate-200 cursor-pointer min-w-[120px]"
              />
              <div className="flex gap-2 text-xs text-slate-400 font-mono whitespace-nowrap">
                <span>Day −30</span>
                <span>·</span>
                <span className="text-slate-800 font-bold">Now</span>
                <span>·</span>
                <span className="text-blue-600 font-semibold">+72h (Pred.)</span>
              </div>
              <button
                onClick={() => setShowWhatIf(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all whitespace-nowrap shadow-2xs flex items-center gap-1"
              >
                <span>∑</span>
                <span>What-If Simulation</span>
              </button>
            </div>
          </Card>

          {/* Mini-Charts Row (Figma Design) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { title: "Reservoir Temp", key: "temp", unit: "°C", color: "#f97316", domain: [50, 72] as [number, number] },
              { title: "Oil Production", key: "prod", unit: "BOPD", color: "#0a1628", domain: [25, 60] as [number, number] },
              { title: "Viscosity", key: "visc", unit: "cP", color: "#92400e", domain: [13000, 28000] as [number, number] },
            ].map(({ title, key, unit, color, domain }) => (
              <ChartCard key={title} title={title} subtitle={unit}>
                <div style={{ height: 90 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data30.slice(-15)}>
                      <defs>
                        <linearGradient id={`g_${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={3} />
                      <YAxis hide domain={domain} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#g_${key})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            ))}
          </div>
        </div>

        {/* Right Info Cards Column (Figma Design) */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">CSS Optimization</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Optimal</span>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Cycle</span><span className="font-mono font-bold text-slate-800">C14</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Cumulative Steam</span><span className="font-mono font-bold text-slate-800">1,680 m³</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Heated Zone Radius</span><span className="font-mono font-bold text-orange-600">{wellState.heatedZoneRadius} m</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Current SOR</span><span className="font-mono font-bold text-purple-700">{wellState.sor.toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Optimal Next Cycle</span><span className="font-mono font-bold text-blue-600">in 9 days</span></div>
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">SRP Optimization</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">VFD Active</span>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Current SPM</span><span className="font-mono font-bold text-slate-800">{wellState.spm.toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Target SPM</span><span className="font-mono font-bold text-emerald-600">{wellState.targetSpm.toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pump Fillage</span><span className="font-mono font-bold text-blue-700">{wellState.pumpFillagePercent}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Stroke Length</span><span className="font-mono font-bold text-slate-800">100 in</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Dynamometer Card</span><span className="font-mono font-bold text-emerald-600">Full Pump</span></div>
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Digital Twin Engine</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Active</span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div className="text-slate-600">
                Continuous physical & telemetry state estimation. Real-time kinematic synchronization with sucker rod string.
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between"><span className="text-slate-500">Model Confidence</span><span className="font-mono font-semibold text-emerald-600">94%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Data Freshness</span><span className="font-mono font-semibold text-blue-600">14 sec</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Active Sensors</span><span className="font-mono font-semibold text-slate-700">98 / 102</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* What-If Modal */}
      {showWhatIf && (
        <WhatIfModal
          onClose={() => setShowWhatIf(false)}
          onApplyToLiveTwin={onApplyWhatIf}
        />
      )}
    </div>
  );
}
