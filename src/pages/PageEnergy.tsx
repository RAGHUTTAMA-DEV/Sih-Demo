import React, { useState } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  BarChart,
} from "recharts";
import { PERIODS, genDailyData, CSS_CYCLES } from "../data/mockData";
import {
  PeriodSelector,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageEnergy() {
  const [period, setPeriod] = useState("Last 30 Days");
  const days = PERIODS[period] || 30;
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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          ["Current SOR", "4.8", "", "text-purple-700", "bg-purple-50 border-purple-200", "m³ steam / bbl oil"],
          ["Target SOR", "4.3", "", "text-emerald-600", "bg-emerald-50 border-emerald-200", "AI optimized target"],
          ["Energy Intensity", "21.4", "kWh/bbl", "text-blue-700", "bg-blue-50 border-blue-200", "at 48.6 BOPD"],
          ["Steam Consumption", "5.7", "m³/hr", "text-orange-600", "bg-orange-50 border-orange-200", "injection rate"],
          ["Boiler Efficiency", "84.2", "%", "text-slate-800", "bg-slate-50 border-slate-200", "steam generator"],
          ["Heat Utilization", "72.8", "%", "text-amber-700", "bg-amber-50 border-amber-200", "of injected heat"],
          ["CO₂ Intensity", "0.42", "tCO₂/bbl", "text-slate-800", "bg-slate-50 border-slate-200", "Scope 1"],
          ["Cost / bbl", "₹1,840", "", "text-slate-800", "bg-slate-50 border-slate-200", "opex incl. steam"],
        ].map(([label, value, unit, val, bg, sub]) => (
          <div key={label as string} className={`rounded-xl border p-3 shadow-2xs ${bg as string}`}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5 truncate">{label as string}</div>
            <div className={`text-lg font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value as string} <span className="text-xs font-normal text-slate-400">{unit as string}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{sub as string}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="SOR History" subtitle="Steam-Oil Ratio over time · CSS cycle overlay">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                {["Month", "Oil bbl", "Steam m³", "SOR", "Energy MWh", "CO₂ tonne", "Cost ₹L", "₹/bbl"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Apr 2026", 1380, 6624, 4.80, 29.64, 5.80, "25.4", 1840],
                ["May 2026", 1462, 6921, 4.73, 30.12, 5.89, "26.4", 1806],
                ["Jun 2026", 1410, 6726, 4.77, 30.41, 5.95, "26.1", 1851],
                ["Jul 2026", 1488, 7068, 4.75, 29.88, 5.84, "27.1", 1820],
                ["Aug 2026", 1512, 7167, 4.74, 29.62, 5.79, "27.4", 1812],
              ].map(([month, ...rest]) => (
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
