import React, { useState } from "react";
import {
  BarChart,
  Bar,
  ComposedChart,
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
import { CSS_CYCLES } from "../data/mockData";
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

export function PageCSS() {
  const [period, setPeriod] = useState("Last 6 Months");
  const [, setSelectedCycle] = useState(13);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="SOR per CSS Cycle" subtitle="Steam-Oil Ratio trend">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CSS_CYCLES}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                {["Cycle", "Steam Vol m³", "Inj. Press bar", "Soak hr", "Peak Prod BOPD", "SOR", "Duration days", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CSS_CYCLES.map((c, i) => (
                <tr
                  key={c.cycle}
                  className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                    i === CSS_CYCLES.length - 1 ? "bg-amber-50" : ""
                  }`}
                  onClick={() => setSelectedCycle(i)}
                >
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">{c.cycle}</td>
                  <td className="px-4 py-2.5 font-mono">{c.steamVol}</td>
                  <td className="px-4 py-2.5 font-mono">{c.injPress}</td>
                  <td className="px-4 py-2.5 font-mono">{c.soakTime}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700">{c.peakProd}</td>
                  <td className="px-4 py-2.5 font-mono">{c.sor}</td>
                  <td className="px-4 py-2.5 font-mono">{c.duration}</td>
                  <td className="px-4 py-2.5">
                    {i === CSS_CYCLES.length - 1 ? (
                      <Badge color="orange">Active</Badge>
                    ) : (
                      <Badge color="gray">Complete</Badge>
                    )}
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
