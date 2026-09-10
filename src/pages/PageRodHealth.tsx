import React, { useState } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { PERIODS, genRodHistory } from "../data/mockData";
import {
  Badge,
  PeriodSelector,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageRodHealth() {
  const [period, setPeriod] = useState("Last 90 Days");
  const days = PERIODS[period] || 90;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Failure Risk", "7%", "LOW", "bg-emerald-50 border-emerald-200", "text-emerald-700"],
          ["Max Rod Stress", "186 MPa", "61% of yield", "bg-blue-50 border-blue-200", "text-blue-700"],
          ["Fatigue Life", "82%", "remaining", "bg-emerald-50 border-emerald-200", "text-emerald-700"],
          ["Cumulative Cycles", "1.84M", "since last change", "bg-slate-50 border-slate-200", "text-slate-700"],
        ].map(([label, value, sub, bg, val]) => (
          <div key={label as string} className={`rounded-xl border p-3 shadow-2xs ${bg as string}`}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label as string}</div>
            <div className={`text-2xl font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value as string}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub as string}</div>
          </div>
        ))}
      </div>

      {/* Risk breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Risk Contributors" />
          <div className="p-4 space-y-3">
            {[
              ["Increasing Viscosity", 35, "#f59e0b"],
              ["Elevated Rod Loading", 28, "#f97316"],
              ["Reduced Pump Fillage", 22, "#0ea5e9"],
              ["Thermal Cycling", 10, "#7c3aed"],
              ["Corrosion Factor", 5, "#94a3b8"],
            ].map(([label, pct, color]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{label as string}</span>
                  <span className="font-mono font-semibold text-slate-700">{pct as number}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${pct as number}%`, background: color as string }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Rod String Status" subtitle="24 sections · API Grade D" />
          <div className="p-4">
            <div className="grid grid-cols-6 gap-1 mb-3">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded flex items-center justify-center text-xs font-mono"
                  style={{
                    background: i < 3 ? "#dcfce7" : i < 20 ? "#eff6ff" : "#fef9c3",
                    border: `1px solid ${i < 3 ? "#86efac" : i < 20 ? "#bfdbfe" : "#fde047"}`,
                    color: i < 3 ? "#166534" : i < 20 ? "#1e40af" : "#713f12",
                    fontSize: 9,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: "#dcfce7", border: "1px solid #86efac" }} />
                <span className="text-slate-500">New (1-3)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }} />
                <span className="text-slate-500">Good (4-20)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: "#fef9c3", border: "1px solid #fde047" }} />
                <span className="text-slate-500">Monitor (21-24)</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Last inspection: 14 Sep 2026 · Next: 14 Dec 2026</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Failure Predictions" badge={<Badge color="blue">AI Model</Badge>} />
          <div className="p-4 space-y-2">
            {[
              ["30-day risk", "7%", "LOW", "text-emerald-700"],
              ["60-day risk", "12%", "LOW", "text-emerald-700"],
              ["90-day risk", "18%", "MEDIUM", "text-amber-600"],
              ["Critical threshold", "≥25%", "HIGH", "text-red-600"],
            ].map(([k, v, level, c]) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                {["Date", "Event", "Section(s)", "Action Taken", "Depth m", "Result", "Engineer"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["14 Sep 2026", "Scheduled Inspection", "All", "Visual + MPI check", "0–310", "No defects found", "R. Sharma"],
                ["02 Jul 2026", "Routine Inspection", "21-24", "Micrometer check", "240–310", "Minor wear on #22", "P. Mehta"],
                ["18 Apr 2026", "Rod Replacement", "1-3", "Replaced Grade D rods", "0–30", "Completed OK", "R. Sharma"],
                ["05 Jan 2026", "Rod Failure", "22", "Emergency workover", "268m", "Replaced + inspection", "A. Singh"],
                ["12 Oct 2025", "Scheduled Inspection", "All", "Visual + RT check", "0–310", "1 crack on #21, tagged", "P. Mehta"],
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
