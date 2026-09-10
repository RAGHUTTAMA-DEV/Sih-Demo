import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PERIODS, genDailyData } from "../data/mockData";
import {
  PeriodSelector,
  StatRow,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageReservoir() {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period] || 30;
  const data = useMemo(() => genDailyData(days), [days]);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 truncate">{label}</div>
            <div className={`text-lg font-bold font-mono ${color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[45, 75]} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fill="url(#gtRes)" dot={false} name="Temp °C" isAnimationActive={false} />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={ttStyle} formatter={(v: unknown) => [`${(v as number).toLocaleString()} cP`, "Viscosity"]} />
                <Area type="monotone" dataKey="visc" stroke="#92400e" strokeWidth={2} fill="url(#gvRes)" dot={false} name="Viscosity cP" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Bottomhole Pressure" subtitle="BHP bar">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[10, 18]} />
                <Tooltip contentStyle={ttStyle} />
                <Line type="monotone" dataKey="bhp" stroke="#0ea5e9" strokeWidth={2} dot={false} name="BHP bar" isAnimationActive={false} />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 40]} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="wc" stroke="#3b82f6" strokeWidth={2} fill="url(#gwc)" dot={false} name="Water Cut %" isAnimationActive={false} />
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
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
              <XAxis dataKey="temp" name="Temp °C" tick={axTick} axisLine={false} tickLine={false} label={{ value: "Temperature °C", fontSize: 9, fill: "#94a3b8", position: "insideBottom", offset: -4 }} />
              <YAxis dataKey="visc" name="Viscosity cP" tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: unknown, n: unknown) => [(n as string) === "visc" ? `${(v as number).toLocaleString()} cP` : `${v}°C`, (n as string) === "visc" ? "Viscosity" : "Temperature"]} />
              <Scatter data={data} fill="#f97316" opacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Period stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Period Statistics" subtitle={period} />
          <div className="p-4 space-y-0">
            <StatRow label="Avg. Reservoir Temp" value={(data.reduce((a, d) => a + d.temp, 0) / data.length).toFixed(1)} unit="°C" color="orange" />
            <StatRow label="Peak Temp" value={Math.max(...data.map((d) => d.temp)).toFixed(1)} unit="°C" color="orange" />
            <StatRow label="Min Temp" value={Math.min(...data.map((d) => d.temp)).toFixed(1)} unit="°C" />
            <StatRow label="Avg. Viscosity" value={(data.reduce((a, d) => a + d.visc, 0) / data.length).toFixed(0)} unit="cP" color="amber" />
            <StatRow label="Avg. BHP" value={(data.reduce((a, d) => a + d.bhp, 0) / data.length).toFixed(1)} unit="bar" color="blue" />
            <StatRow label="Avg. Water Cut" value={(data.reduce((a, d) => a + d.wc, 0) / data.length).toFixed(1)} unit="%" />
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
