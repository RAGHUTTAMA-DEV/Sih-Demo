import React, { useState, useMemo } from "react";
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
} from "recharts";
import { PERIODS, genDailyData } from "../data/mockData";
import {
  PeriodSelector,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageProduction() {
  const [period, setPeriod] = useState("Last 90 Days");
  const days = PERIODS[period] || 90;
  const data = useMemo(() => genDailyData(days), [days]);

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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          ["Today's Production", "48.6 BOPD", "text-emerald-700", "bg-emerald-50 border-emerald-200"],
          ["Period Cumulative", `${totalOil.toFixed(0)} bbl`, "text-slate-800", "bg-slate-50 border-slate-200"],
          ["Avg. Daily Rate", `${avgProd.toFixed(1)} BOPD`, "text-blue-700", "bg-blue-50 border-blue-200"],
          ["Peak Production", `${Math.max(...data.map((d) => d.prod)).toFixed(1)} BOPD`, "text-purple-700", "bg-purple-50 border-purple-200"],
          ["Avg. Water Cut", `${(data.reduce((a, d) => a + d.wc, 0) / data.length).toFixed(1)}%`, "text-blue-600", "bg-blue-50 border-blue-200"],
          ["Gross Fluid Rate", "62.4 BFPD", "text-slate-800", "bg-slate-50 border-slate-200"],
          ["Net Oil Entitlement", "38.2 BOPD", "text-amber-700", "bg-amber-50 border-amber-200"],
          ["Facility Uptime", "97.4%", "text-emerald-700", "bg-emerald-50 border-emerald-200"],
        ].map(([label, value, val, bg]) => (
          <div key={label as string} className={`rounded-xl border p-3 shadow-2xs ${bg as string}`}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 truncate">{label as string}</div>
            <div className={`text-lg font-bold font-mono ${val as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value as string}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="prod" stroke="#0a1628" strokeWidth={2} fill="url(#gprod)" name="Oil BOPD" isAnimationActive={false} />
                <ReferenceLine y={avgProd} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Avg", fontSize: 8, fill: "#10b981" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Oil + Water Rates" subtitle="BOPD and water cut %">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={30} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 50]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Bar yAxisId="l" dataKey="prod" fill="#0a1628" opacity={0.8} radius={[1, 1, 0, 0]} name="Oil BOPD" maxBarSize={8} isAnimationActive={false} />
                <Line yAxisId="r" type="monotone" dataKey="wc" stroke="#3b82f6" strokeWidth={2} dot={false} name="WC %" isAnimationActive={false} />
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
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 8)} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v.toFixed(0)}`} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="cum" stroke="#7c3aed" strokeWidth={2} fill="url(#gcum)" name="Cum. Oil bbl" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Temp vs Production Correlation" subtitle="Thermal effect on recovery">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
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
                {["Month", "Days Prod.", "Gross Oil bbl", "Avg BOPD", "Peak BOPD", "Water Cut %", "Uptime %", "CSS Cycles"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Apr 2026", 30, 1380, 46.0, 54.2, 18.2, 98.1, 2],
                ["May 2026", 31, 1462, 47.2, 55.1, 18.8, 97.8, 2],
                ["Jun 2026", 30, 1410, 47.0, 53.8, 19.4, 98.4, 2],
                ["Jul 2026", 31, 1488, 48.0, 56.2, 20.1, 96.9, 2],
                ["Aug 2026", 31, 1512, 48.8, 57.0, 20.8, 97.5, 2],
                ["Sep 2026", 10, 486, 48.6, 57.4, 21.2, 97.4, 1],
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
