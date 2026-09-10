import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { PERIODS, genSRPHistory, DYN_DATA } from "../data/mockData";
import {
  Badge,
  PeriodSelector,
  StatRow,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

interface PageSRPProps {
  onApplySPM?: (spm: number) => void;
}

export function PageSRP({ onApplySPM }: PageSRPProps) {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period] || 30;
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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          ["Stroke Length", "100 in", "text-slate-800"],
          ["Stroke/Min (SPM)", "5.2", "text-blue-700"],
          ["Recommended SPM", "4.7", "text-amber-600"],
          ["VFD Frequency", "42 Hz", "text-slate-800"],
          ["Pump Fillage", "78%", "text-blue-700"],
          ["Rod Load", "18.4 kN", "text-slate-800"],
          ["Motor Current", "38.2 A", "text-slate-800"],
          ["Rod Float Risk", "7%", "text-emerald-600"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 truncate">{label as string}</div>
            <div className={`text-lg font-bold font-mono ${color as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value as string}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="AI Recommendation" badge={<Badge color="amber">Action Required</Badge>} />
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-600">
              Reduce SPM from <span className="font-mono font-bold text-blue-700">5.2 → 4.7</span> to improve pump fillage and reduce rod loading given reservoir cooling trend.
            </div>
            <div className="space-y-2">
              {[
                ["VFD Frequency", "42 → 38 Hz"],
                ["Expected Fillage", "78 → 86%"],
                ["Rod Load Reduction", "−8%"],
                ["Energy Saving", "~1.2 kWh/bbl"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-mono font-semibold text-emerald-700">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onApplySPM && onApplySPM(4.7)}
              className="w-full py-2 text-xs font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "#0a1628" }}
            >
              Apply SPM Change
            </button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Period Statistics" subtitle={period} />
          <div className="p-4">
            <StatRow label="Avg. SPM" value={(srp.reduce((a, d) => a + d.spm, 0) / srp.length).toFixed(2)} unit="SPM" color="blue" />
            <StatRow label="Avg. Fillage" value={Math.round(srp.reduce((a, d) => a + d.fillage, 0) / srp.length)} unit="%" color="blue" />
            <StatRow label="Avg. VFD" value={Math.round(srp.reduce((a, d) => a + d.vfd, 0) / srp.length)} unit="Hz" />
            <StatRow label="Avg. Motor Amps" value={(srp.reduce((a, d) => a + d.amps, 0) / srp.length).toFixed(1)} unit="A" />
            <StatRow label="Min Fillage" value={Math.min(...srp.map((d) => d.fillage))} unit="%" color="amber" />
            <StatRow label="Max SPM" value={Math.max(...srp.map((d) => d.spm)).toFixed(2)} unit="SPM" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Pump Performance Index" />
          <div className="p-4">
            {[
              ["Volumetric Efficiency", 78, "#0ea5e9"],
              ["Mechanical Efficiency", 88, "#10b981"],
              ["Overall Efficiency", 69, "#7c3aed"],
              ["Fillage Factor", 78, "#f97316"],
            ].map(([label, val, color]) => (
              <div key={label as string} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{label as string}</span>
                  <span className="font-mono font-semibold text-slate-700">{val as number}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${val as number}%`, background: color as string }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
